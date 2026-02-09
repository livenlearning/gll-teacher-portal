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

type EditUserModalProps = {
  user: {
    id: string;
    name: string;
    email: string;
    cohortTeachers: CohortTeacher[];
  };
  onClose: () => void;
};

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "sessions">("sessions");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gold-500" />

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Edit User</h2>
              <p className="text-sm text-gray-500 mt-1">
                {user.name} ({user.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "sessions"
                ? "text-navy-900 border-navy-600"
                : "text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Session Times ({user.cohortTeachers.length})
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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
