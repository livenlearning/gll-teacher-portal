"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface UnitWeekContentItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  order: number;
}

interface UnitWeek {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string | null;
  content: UnitWeekContentItem[];
}

interface Unit {
  id: string;
  name: string;
  description: string | null;
  weeks: UnitWeek[];
}

const CONTENT_TYPES = ["LESSON", "RESOURCE", "ASSIGNMENT", "VIDEO", "TASK", "DELIVERABLE", "LINK", "CROSS_CLASSROOM", "SURVEY", "GALLERY"];

const TYPE_LABELS: Record<string, string> = {
  LESSON: "Lesson",
  RESOURCE: "Resource",
  ASSIGNMENT: "Assignment",
  VIDEO: "Video",
  TASK: "Task",
  DELIVERABLE: "Deliverable",
  LINK: "Link",
  CROSS_CLASSROOM: "Cross Classroom",
  SURVEY: "Survey",
  GALLERY: "Gallery",
};

const DEFAULT_CONTENT = { type: "LESSON", title: "", body: "", url: "" };

export default function AdminUnitEditPage() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [newWeekSubtitle, setNewWeekSubtitle] = useState("");
  const [newContent, setNewContent] = useState<Record<string, { type: string; title: string; body: string; url: string }>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function updateContentField(weekId: string, field: keyof typeof DEFAULT_CONTENT, value: string) {
    setNewContent((prev) => ({
      ...prev,
      [weekId]: { ...DEFAULT_CONTENT, ...prev[weekId], [field]: value },
    }));
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/admin/units/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unit not found");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setUnit(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleUpdateUnit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!unit) return;
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/units/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description") || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUnit((prev) => prev && { ...prev, name: updated.name, description: updated.description });
    }
  }

  async function handleDeleteUnit() {
    if (!unit) return;
    const res = await fetch(`/api/admin/units/${unit.id}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/admin/units";
    }
  }

  async function handleWeekBlur(weekId: string, field: "title" | "subtitle", value: string) {
    if (!unit) return;
    const payload: Record<string, string | null> = {};
    if (field === "title") {
      if (!value.trim()) return; // title required — don't save empty
      payload.title = value.trim();
    }
    if (field === "subtitle") {
      payload.subtitle = value.trim() || null;
    }

    const res = await fetch(`/api/admin/units/${unit.id}/weeks/${weekId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setUnit((prev) => prev && ({
        ...prev,
        weeks: prev.weeks.map((w) => w.id === weekId ? { ...w, title: updated.title, subtitle: updated.subtitle } : w),
      }));
    }
  }

  async function handleAddWeek(e: FormEvent) {
    e.preventDefault();
    if (!unit || !newWeekTitle) return;
    const nextWeekNumber = unit.weeks.length > 0 ? Math.max(...unit.weeks.map((w) => w.weekNumber)) + 1 : 1;
    const res = await fetch(`/api/admin/units/${unit.id}/weeks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newWeekTitle, subtitle: newWeekSubtitle, weekNumber: nextWeekNumber }),
    });
    if (res.ok) {
      const week = await res.json();
      setUnit((prev) => prev && { ...prev, weeks: [...prev.weeks, week] });
      setNewWeekTitle("");
      setNewWeekSubtitle("");
    }
  }

  async function handleDeleteWeek(weekId: string) {
    if (!unit) return;
    const res = await fetch(`/api/admin/units/${unit.id}/weeks/${weekId}`, { method: "DELETE" });
    if (res.ok) {
      setUnit((prev) => prev && { ...prev, weeks: prev.weeks.filter((w) => w.id !== weekId) });
    }
  }

  async function handleAddContent(weekId: string, e: FormEvent) {
    e.preventDefault();
    const item = newContent[weekId];
    if (!item || !item.title) return;
    const res = await fetch(`/api/admin/units/${unit?.id}/weeks/${weekId}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setUnit((prev) =>
        prev && {
          ...prev,
          weeks: prev.weeks.map((w) =>
            w.id === weekId ? { ...w, content: [...w.content, created] } : w
          ),
        }
      );
      setNewContent((prev) => ({ ...prev, [weekId]: { ...DEFAULT_CONTENT } }));
    }
  }

  async function handleDeleteContent(weekId: string, contentId: string) {
    const res = await fetch(`/api/admin/units/${unit?.id}/weeks/${weekId}/content/${contentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUnit((prev) =>
        prev && {
          ...prev,
          weeks: prev.weeks.map((w) =>
            w.id === weekId ? { ...w, content: w.content.filter((c) => c.id !== contentId) } : w
          ),
        }
      );
    }
  }

  if (loading) return <p className="text-sm text-gray-500 p-6">Loading…</p>;
  if (error) return (
    <div className="p-6">
      <p className="text-sm text-red-500 mb-3">{error}</p>
      <Link href="/admin/units" className="text-sm text-navy-600 hover:underline">← Back to Units</Link>
    </div>
  );
  if (!unit) return <p className="text-sm text-red-500 p-6">Unit not found.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/units" className="text-sm text-navy-600 hover:underline mb-4 inline-block">
        ← Back to Units
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Edit Unit</h1>
        <div className="relative">
          <button
            onClick={() => setDeleteConfirm(!deleteConfirm)}
            className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-3 py-1 rounded-lg hover:border-red-500 transition-colors"
          >
            Delete Unit
          </button>
          {deleteConfirm && (
            <div className="absolute right-0 top-8 bg-white border border-red-200 rounded-lg shadow-lg p-3 w-56 z-10">
              <p className="text-xs text-gray-700 mb-2">This will permanently delete the unit and all its weeks and content.</p>
              <div className="flex gap-2">
                <button onClick={handleDeleteUnit} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600">Confirm</button>
                <button onClick={() => setDeleteConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unit details form */}
      <form onSubmit={handleUpdateUnit} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-3">Unit Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input name="name" defaultValue={unit.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <input name="description" defaultValue={unit.description ?? ""}
              placeholder="Brief description of the unit"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-navy-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-navy-700 transition-colors">
          Save
        </button>
      </form>

      {/* Weeks + Content */}
      <div className="space-y-4">
        {unit.weeks.map((week) => (
          <div key={week.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Week header — inline-editable title & subtitle */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-bold text-navy-600 bg-navy-50 px-2 py-0.5 rounded-full shrink-0">
                  Week {week.weekNumber}
                </span>
                <input
                  defaultValue={week.title}
                  onBlur={(e) => handleWeekBlur(week.id, "title", e.target.value)}
                  placeholder="Week name (e.g. Discover)"
                  className="text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-navy-500 focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                />
                <span className="text-gray-300 shrink-0">|</span>
                <input
                  defaultValue={week.subtitle ?? ""}
                  onBlur={(e) => handleWeekBlur(week.id, "subtitle", e.target.value)}
                  placeholder="Subtitle…"
                  className="text-xs text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-navy-500 focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                />
              </div>
              <button onClick={() => handleDeleteWeek(week.id)} className="text-xs text-red-400 hover:text-red-600 shrink-0">
                Remove
              </button>
            </div>

            {/* Existing content items */}
            {week.content.length === 0 && (
              <p className="px-5 py-2.5 text-xs text-gray-400 italic">No content yet — add items below.</p>
            )}
            {week.content.map((item) => (
              <div key={item.id} className="px-5 py-2.5 flex items-start justify-between border-b border-gray-100 last:border-0 gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{item.title}</span>
                  </div>
                  {item.body && <span className="text-xs text-gray-500 pl-1">{item.body}</span>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-navy-600 hover:underline pl-1">
                      🔗 {item.url}
                    </a>
                  )}
                </div>
                <button onClick={() => handleDeleteContent(week.id, item.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">
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
                  {CONTENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs text-gray-500 mb-0.5">Title</label>
                <input value={newContent[week.id]?.title ?? ""}
                  onChange={(e) => updateContentField(week.id, "title", e.target.value)}
                  placeholder="e.g. Mapping Our World"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Description (optional)</label>
                <input value={newContent[week.id]?.body ?? ""}
                  onChange={(e) => updateContentField(week.id, "body", e.target.value)}
                  placeholder="Short description…"
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-44" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">URL (optional)</label>
                <input value={newContent[week.id]?.url ?? ""}
                  onChange={(e) => updateContentField(week.id, "url", e.target.value)}
                  placeholder="https://…"
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-44" />
              </div>
              <button type="submit" className="bg-navy-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-navy-700 transition-colors">
                Add
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Add week form */}
      <form onSubmit={handleAddWeek} className="mt-4 bg-white border border-dashed border-gray-300 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Add Week to Unit</h3>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Week Title</label>
            <input value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)}
              placeholder="e.g. Discover"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Subtitle (optional)</label>
            <input value={newWeekSubtitle} onChange={(e) => setNewWeekSubtitle(e.target.value)}
              placeholder="e.g. Explore the world"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
          </div>
          <button type="submit" className="bg-navy-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-700 transition-colors">
            Add Week
          </button>
        </div>
      </form>
    </div>
  );
}
