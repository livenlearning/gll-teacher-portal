"use client";

import { useState, type FormEvent } from "react";

interface Teacher {
  id: string;
  name: string;
}

interface UnitSummary {
  id: string;
  name: string;
  description: string | null;
}

interface PartnerSchoolEntry {
  name: string;
  location: string;
  teacherId: string;
}

export default function CreateCohortForm({ teachers, units }: { teachers: Teacher[]; units: UnitSummary[] }) {
  // Core fields
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");

  // Meta fields
  const [facilitator, setFacilitator] = useState("");
  const [facilitatorEmail, setFacilitatorEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionDay, setSessionDay] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [padletLink, setPadletLink] = useState("");

  // Partner schools (dynamic list)
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchoolEntry[]>([]);
  const [psName, setPsName] = useState("");
  const [psLocation, setPsLocation] = useState("");
  const [psTeacherId, setPsTeacherId] = useState(teachers[0]?.id ?? "");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addPartnerSchool() {
    if (!psName.trim()) return;
    setPartnerSchools((prev) => [...prev, { name: psName.trim(), location: psLocation.trim(), teacherId: psTeacherId }]);
    setPsName("");
    setPsLocation("");
  }

  function removePartnerSchool(index: number) {
    setPartnerSchools((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        unitId: unitId || undefined,
        facilitator,
        facilitatorEmail,
        startDate,
        endDate,
        sessionDay,
        sessionTime,
        zoomLink,
        padletLink,
        partnerSchools,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    window.location.reload();
  }

  // Show selected unit description as a hint
  const selectedUnit = units.find((u) => u.id === unitId);

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-navy-700 mb-3">Create New Cohort</h2>

      {/* Row 1: Name + Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cohort Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Spring 2026 Cohort B"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit</label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="">— No unit —</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit hint */}
      {selectedUnit?.description && (
        <p className="text-xs text-navy-500 bg-navy-50 px-3 py-1.5 rounded-lg mb-3">
          {selectedUnit.description}
        </p>
      )}

      {/* Row 2: Facilitator + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Facilitator Name</label>
          <input
            value={facilitator}
            onChange={(e) => setFacilitator(e.target.value)}
            placeholder="e.g. Dr. Lisa Park"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Facilitator Email</label>
          <input
            value={facilitatorEmail}
            onChange={(e) => setFacilitatorEmail(e.target.value)}
            placeholder="lisa@gll.edu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Row 3: Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Row 4: Session + Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Session Day</label>
          <input
            value={sessionDay}
            onChange={(e) => setSessionDay(e.target.value)}
            placeholder="Wednesday"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Session Time</label>
          <input
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            placeholder="3:00 PM – 4:00 PM (ET)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Zoom Link</label>
          <input
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Padlet Link</label>
          <input
            value={padletLink}
            onChange={(e) => setPadletLink(e.target.value)}
            placeholder="https://padlet.com/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Partner Schools section */}
      <div className="border-t border-gray-200 pt-3 mt-1 mb-3">
        <label className="block text-xs font-semibold text-gray-600 mb-2">Partner Schools</label>

        {/* Existing partner schools */}
        {partnerSchools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {partnerSchools.map((ps, i) => (
              <div key={i} className="flex items-center gap-1 bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full text-xs">
                <span>{ps.name}{ps.location && <span className="text-navy-400"> — {ps.location}</span>}</span>
                <button type="button" onClick={() => removePartnerSchool(i)} className="text-navy-400 hover:text-red-500 ml-1">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add partner school inline */}
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">School Name</label>
            <input
              value={psName}
              onChange={(e) => setPsName(e.target.value)}
              placeholder="Taipei American School"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-44"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Location</label>
            <input
              value={psLocation}
              onChange={(e) => setPsLocation(e.target.value)}
              placeholder="Taipei, Taiwan"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-36"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Teacher</label>
            <select
              value={psTeacherId}
              onChange={(e) => setPsTeacherId(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white w-36"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addPartnerSchool}
            className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-navy-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-navy-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating..." : "Create Cohort"}
      </button>
    </form>
  );
}
