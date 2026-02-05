import { prisma } from "../../../lib/prisma";
import CreateUserForm from "../../../components/create-user-form";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      cohortTeachers: {
        include: {
          cohort: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Users</h1>

      <CreateUserForm />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cohorts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-5 py-3 text-gray-600">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{user.cohortTeachers.length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">No users found.</p>
        )}
      </div>
    </div>
  );
}
