"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type CohortTeacher = {
  id: string;
  sessionDay: string | null;
  sessionTime: string | null;
  cohort: {
    id: string;
    name: string;
  };
};

type Cohort = {
  id: string;
  name: string;
};

type EditUserModalProps = {
  user: {
    id: string;
    name: string;
    email: string;
    cohortTeachers: CohortTeacher[];
  };
  availableCohorts: Cohort[];
  onClose: () => void;
};

export default function EditUserModal({ user, availableCohorts, onClose }: EditUserModalProps) {
  const [password, setPassword] = useState("");
  const [sessionTimes, setSessionTimes] = useState<Record<string, { day: string; time: string }>>(
    Object.fromEntries(
      user.cohortTeachers.map((ct) => [
        ct.id,
        {
          day: ct.sessionDay || "",
          time: ct.sessionTime || "",
        },
      ])
    )
  );
  const [selectedCohort, setSelectedCohort] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cohorts" | "sessions" | "password">("cohorts");
  const router = useRouter();

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setPassword("");
        alert("Password updated successfully");
        onClose();
        router.refresh();
      } else {
        alert("Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  async function handleSessionTimesSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = Object.entries(sessionTimes).map(([cohortTeacherId, times]) => ({
        cohortTeacherId,
        sessionDay: times.day || null,
        sessionTime: times.time || null,
      }));

      const response = await fetch("/api/cohort-teachers/session-times", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        alert("Session times updated successfully");
        onClose();
        router.refresh();
      } else {
        alert("Failed to update session times");
      }
    } catch (error) {
      console.error("Failed to update session times:", error);
      alert("Failed to update session times");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCohort(e: FormEvent) {
    e.preventDefault();
    if (!selectedCohort) return;

    setLoading(true);

    try {
      const response = await fetch("/api/cohort-teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId: selectedCohort, teacherId: user.id }),
      });

      if (response.ok) {
        alert("Teacher added to cohort successfully. Reopen to set session times.");
        setSelectedCohort("");
        onClose();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add teacher to cohort");
      }
    } catch (error) {
      console.error("Failed to add teacher to cohort:", error);
      alert("Failed to add teacher to cohort");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromCohort(cohortTeacherId: string) {
    if (!confirm("Are you sure you want to remove this teacher from the cohort?")) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/cohort-teachers/${cohortTeacherId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Teacher removed from cohort successfully");
        onClose();
        router.refresh();
      } else {
        alert("Failed to remove teacher from cohort");
      }
    } catch (error) {
      console.error("Failed to remove teacher from cohort:", error);
      alert("Failed to remove teacher from cohort");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("User deleted successfully");
        onClose();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gold-500" />

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy-900">Edit User</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.name} ({user.email})
                  </p>
                </div>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:border-red-500 transition-colors disabled:opacity-50"
                >
                  Delete User
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("cohorts")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "cohorts"
                ? "text-navy-900 border-navy-600"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Cohorts ({user.cohortTeachers.length})
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "sessions"
                ? "text-navy-900 border-navy-600"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Session Times
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "password"
                ? "text-navy-900 border-navy-600"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === "cohorts" && (
            <div className="space-y-4">
              {/* Current cohorts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Cohorts</h3>
                {user.cohortTeachers.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">
                    Not assigned to any cohorts yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.cohortTeachers.map((ct) => (
                      <div key={ct.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-800">{ct.cohort.name}</span>
                        <button
                          onClick={() => handleRemoveFromCohort(ct.id)}
                          disabled={loading}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add to cohort */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Add to Cohort</h3>
                <form onSubmit={handleAddToCohort} className="flex gap-3">
                  <select
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="">Select a cohort...</option>
                    {availableCohorts
                      .filter((c) => !user.cohortTeachers.some((ct) => ct.cohort.id === c.id))
                      .map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="submit"
                    disabled={loading || !selectedCohort}
                    className="bg-navy-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <form onSubmit={handleSessionTimesSubmit} className="space-y-4">
              {user.cohortTeachers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  This user is not assigned to any cohorts yet.
                </p>
              ) : (
                user.cohortTeachers.map((ct) => (
                  <div key={ct.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-navy-900">{ct.cohort.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">
                          Session Day
                        </label>
                        <input
                          type="text"
                          value={sessionTimes[ct.id]?.day || ""}
                          onChange={(e) =>
                            setSessionTimes({
                              ...sessionTimes,
                              [ct.id]: { ...sessionTimes[ct.id], day: e.target.value },
                            })
                          }
                          placeholder="e.g., Wednesday"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">
                          Session Time
                        </label>
                        <input
                          type="text"
                          value={sessionTimes[ct.id]?.time || ""}
                          onChange={(e) =>
                            setSessionTimes({
                              ...sessionTimes,
                              [ct.id]: { ...sessionTimes[ct.id], time: e.target.value },
                            })
                          }
                          placeholder="e.g., 3:00 PM ET"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {user.cohortTeachers.length > 0 && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-navy-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Saving..." : "Save Session Times"}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The password will be hashed before saving.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="bg-navy-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
