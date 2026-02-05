"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface WeekContentItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  order: number;
}

interface Week {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string | null;
  unlocked: boolean;
  content: WeekContentItem[];
}

interface PartnerSchool {
  id: string;
  name: string;
  location: string | null;
  teacherId: string;
}

interface Teacher {
  id: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

interface Cohort {
  id: string;
  name: string;
  slug: string;
  teachers: Teacher[];
  facilitator: string | null;
  facilitatorEmail: string | null;
  startDate: string | null;
  endDate: string | null;
  sessionDay: string | null;
  sessionTime: string | null;
  zoomLink: string | null;
  padletLink: string | null;
  partnerSchools: PartnerSchool[];
  weeks: Week[];
}

interface User {
  id: string;
  name: string;
}

const CONTENT_TYPES = ["LESSON", "RESOURCE", "ASSIGNMENT", "VIDEO", "TASK", "DELIVERABLE", "LINK", "CROSS_CLASSROOM", "SURVEY", "GALLERY"];
const DEFAULT_CONTENT = { type: "LESSON", title: "", body: "", url: "" };

export default function AdminCohortEditPage() {
  const { id } = useParams<{ id: string }>();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [newContent, setNewContent] = useState<Record<string, { type: string; title: string; body: string; url: string }>>({});
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  function updateContentField(weekId: string, field: keyof typeof DEFAULT_CONTENT, value: string) {
    setNewContent((prev) => ({
      ...prev,
      [weekId]: { ...DEFAULT_CONTENT, ...prev[weekId], [field]: value },
    }));
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/admin/cohorts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setCohort(data);
          setSelectedTeacherIds(data.teachers?.map((t: Teacher) => t.teacher.id) || []);
          setLoading(false);
        }
      });
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setUsers(data); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleAddWeek(e: FormEvent) {
    e.preventDefault();
    if (!cohort || !newWeekTitle) return;
    const nextWeekNumber = cohort.weeks.length + 1;
    const res = await fetch(`/api/admin/cohorts/${cohort.id}/weeks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newWeekTitle, weekNumber: nextWeekNumber }),
    });
    const week = await res.json();
    setCohort((prev) => prev && { ...prev, weeks: [...prev.weeks, { ...week, content: [] }] });
    setNewWeekTitle("");
  }

  async function handleAddContent(weekId: string, e: FormEvent) {
    e.preventDefault();
    const item = newContent[weekId];
    if (!item || !item.title) return;
    const res = await fetch(`/api/admin/cohorts/${cohort?.id}/weeks/${weekId}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const created = await res.json();
    setCohort((prev) =>
      prev && {
        ...prev,
        weeks: prev.weeks.map((w) =>
          w.id === weekId ? { ...w, content: [...w.content, created] } : w
        ),
      }
    );
    setNewContent((prev) => ({ ...prev, [weekId]: { type: "LESSON", title: "", body: "", url: "" } }));
  }

  async function handleDeleteContent(weekId: string, contentId: string) {
    await fetch(`/api/admin/cohorts/${cohort?.id}/weeks/${weekId}/content/${contentId}`, {
      method: "DELETE",
    });
    setCohort((prev) =>
      prev && {
        ...prev,
        weeks: prev.weeks.map((w) =>
          w.id === weekId ? { ...w, content: w.content.filter((c) => c.id !== contentId) } : w
        ),
      }
    );
  }

  async function handleUpdateCohort(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cohort) return;
    const formData = new FormData(e.currentTarget);
    await fetch(`/api/admin/cohorts/${cohort.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        teacherIds: selectedTeacherIds,
        facilitator: formData.get("facilitator"),
        facilitatorEmail: formData.get("facilitatorEmail"),
        startDate: formData.get("startDate") || null,
        endDate: formData.get("endDate") || null,
        sessionDay: formData.get("sessionDay"),
        sessionTime: formData.get("sessionTime"),
        zoomLink: formData.get("zoomLink"),
        padletLink: formData.get("padletLink"),
      }),
    });
  }

  function toggleTeacher(teacherId: string) {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  }

  async function toggleWeekUnlock(weekId: string, currentUnlocked: boolean) {
    const res = await fetch(`/api/admin/cohorts/${cohort?.id}/weeks/${weekId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unlocked: !currentUnlocked }),
    });
    if (res.ok) {
      setCohort((prev) =>
        prev && {
          ...prev,
          weeks: prev.weeks.map((w) => (w.id === weekId ? { ...w, unlocked: !currentUnlocked } : w)),
        }
      );
    }
  }

  async function handleUnlockNext() {
    if (!cohort) return;
    // Find the first locked week (by weekNumber order)
    const nextLocked = [...cohort.weeks].sort((a, b) => a.weekNumber - b.weekNumber).find((w) => !w.unlocked);
    if (!nextLocked) return;
    await toggleWeekUnlock(nextLocked.id, false);
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!cohort) return <p className="text-sm text-red-500">Cohort not found.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/cohorts" className="text-sm text-navy-600 hover:underline mb-4 inline-block">
        ← Back to Cohorts
      </Link>

      <h1 className="text-2xl font-bold text-navy-900 mb-6">Edit Cohort</h1>

      {/* Cohort details form */}
      <form onSubmit={handleUpdateCohort} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-3">Cohort Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input name="name" defaultValue={cohort.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-2">Teachers</label>
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-xs text-gray-400">No teachers available</p>
              ) : (
                <div className="space-y-1.5">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTeacherIds.includes(user.id)}
                        onChange={() => toggleTeacher(user.id)}
                        className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-2 focus:ring-navy-500"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {selectedTeacherIds.length} teacher{selectedTeacherIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Facilitator Name</label>
            <input name="facilitator" defaultValue={cohort.facilitator ?? ""}
              placeholder="e.g. Dr. Lisa Park"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Facilitator Email</label>
            <input name="facilitatorEmail" defaultValue={cohort.facilitatorEmail ?? ""}
              placeholder="lisa@gll.edu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input name="startDate" type="date" defaultValue={cohort.startDate ? cohort.startDate.split("T")[0] : ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input name="endDate" type="date" defaultValue={cohort.endDate ? cohort.endDate.split("T")[0] : ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Session Day</label>
            <input name="sessionDay" defaultValue={cohort.sessionDay ?? ""}
              placeholder="e.g. Wednesday"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Session Time</label>
            <input name="sessionTime" defaultValue={cohort.sessionTime ?? ""}
              placeholder="e.g. 3:00 PM – 4:00 PM (ET)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zoom Link</label>
            <input name="zoomLink" defaultValue={cohort.zoomLink ?? ""}
              placeholder="https://zoom.us/j/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Padlet Link</label>
            <input name="padletLink" defaultValue={cohort.padletLink ?? ""}
              placeholder="https://padlet.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-navy-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-navy-700 transition-colors">
          Save
        </button>
      </form>

      {/* Partner Schools display */}
      {cohort.partnerSchools.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-navy-700 mb-2">Partner Schools</h2>
          <div className="flex flex-wrap gap-2">
            {cohort.partnerSchools.map((school) => (
              <span key={school.id} className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full">
                {school.name} {school.location && <span className="text-navy-400">— {school.location}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Week Unlock Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-navy-700">Week Unlock Controls</h2>
          <button
            onClick={handleUnlockNext}
            className="bg-gold-500 text-navy-900 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gold-600 transition-colors"
          >
            Unlock Next →
          </button>
        </div>
        <div className="space-y-2">
          {cohort.weeks.map((week) => (
            <div key={week.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {week.unlocked ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-3 8a1 1 0 11-2 0 1 1 0 012 0zm6 3a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V9a3 3 0 016 0v2m-6 0a3 3 0 00-3 3v4a2 2 0 002 2h10a2 2 0 002-2v-4a3 3 0 00-3-3m-6 0h6" />
                  </svg>
                )}
                <span className="text-sm text-gray-700">
                  {week.weekNumber === 0 ? "Pre-Unit" : `Week ${week.weekNumber}`}: {week.title}
                </span>
              </div>
              <button
                onClick={() => { if (week.weekNumber !== 0) toggleWeekUnlock(week.id, week.unlocked); }}
                disabled={week.weekNumber === 0}
                className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                  week.weekNumber === 0
                    ? "bg-green-100 text-green-700 cursor-default"
                    : week.unlocked
                      ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                      : "bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-700"
                }`}
              >
                {week.weekNumber === 0 ? "Always On" : week.unlocked ? "Unlocked" : "Locked"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weeks + Content */}
      <div className="space-y-4">
        {cohort.weeks.map((week) => (
          <div key={week.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                {week.weekNumber === 0 ? "Pre-Unit" : `Week ${week.weekNumber}`}: {week.title}
                {week.subtitle && <span className="text-xs font-normal text-gray-400 ml-2">— {week.subtitle}</span>}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${week.unlocked ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                {week.unlocked ? "Unlocked" : "Locked"}
              </span>
            </div>

            {/* Existing content */}
            {week.content.map((item) => (
              <div key={item.id} className="px-5 py-2.5 flex items-center justify-between border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="text-sm text-gray-700">{item.title}</span>
                </div>
                <button onClick={() => handleDeleteContent(week.id, item.id)} className="text-xs text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            ))}

            {/* Add content form */}
            <form onSubmit={(e) => handleAddContent(week.id, e)} className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 flex-wrap items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Type</label>
                <select value={newContent[week.id]?.type ?? "LESSON"}
                  onChange={(e) => updateContentField(week.id, "type", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                  {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-gray-500 mb-0.5">Title</label>
                <input value={newContent[week.id]?.title ?? ""}
                  onChange={(e) => updateContentField(week.id, "title", e.target.value)}
                  placeholder="Content title"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">URL (optional)</label>
                <input value={newContent[week.id]?.url ?? ""}
                  onChange={(e) => updateContentField(week.id, "url", e.target.value)}
                  placeholder="https://..."
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-40" />
              </div>
              <button type="submit" className="bg-navy-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-navy-700 transition-colors">
                Add
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Add week form */}
      <form onSubmit={handleAddWeek} className="mt-4 bg-white border border-dashed border-gray-300 rounded-xl p-5 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">New Week Title</label>
          <input value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)}
            placeholder="e.g. Introduction to Basics"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
        </div>
        <button type="submit" className="bg-navy-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-700 transition-colors">
          Add Week
        </button>
      </form>
    </div>
  );
}
