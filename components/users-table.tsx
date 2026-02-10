"use client";

import { useState } from "react";
import EditUserModal from "./edit-user-modal";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  cohortTeachers: {
    id: string;
    sessionDay: string | null;
    sessionTime: string | null;
    cohort: {
      id: string;
      name: string;
    };
  }[];
  schoolName?: string | null;
};

type Cohort = {
  id: string;
  name: string;
};

type UsersTableProps = {
  users: User[];
  availableCohorts: Cohort[];
};

export default function UsersTable({ users, availableCohorts }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Cohorts
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-5 py-3 text-gray-600">{user.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{user.cohortTeachers.length}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">No users found.</p>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          availableCohorts={availableCohorts}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  );
}
