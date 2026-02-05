import { prisma } from "../../lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [userCount, cohortCount, unitCount, weekCount] = await Promise.all([
    prisma.user.count(),
    prisma.cohort.count(),
    prisma.unit.count(),
    prisma.week.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Admin Panel</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Users", value: userCount, href: "/admin/users" },
          { label: "Cohorts", value: cohortCount, href: "/admin/cohorts" },
          { label: "Units", value: unitCount, href: "/admin/units" },
          { label: "Weeks", value: weekCount, href: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-navy-900 mt-1">{stat.value}</p>
            {stat.href && (
              <Link href={stat.href} className="text-xs text-navy-600 hover:underline mt-2 inline-block">
                Manage →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/admin/users" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-navy-300 transition-colors">
          <h2 className="text-sm font-semibold text-navy-800">Manage Users</h2>
          <p className="text-xs text-gray-500 mt-0.5">View, edit, and manage teacher accounts</p>
        </Link>
        <Link href="/admin/cohorts" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-navy-300 transition-colors">
          <h2 className="text-sm font-semibold text-navy-800">Manage Cohorts</h2>
          <p className="text-xs text-gray-500 mt-0.5">Create cohorts, assign units and content</p>
        </Link>
        <Link href="/admin/units" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-navy-300 transition-colors">
          <h2 className="text-sm font-semibold text-navy-800">Manage Units</h2>
          <p className="text-xs text-gray-500 mt-0.5">Create and edit reusable content templates</p>
        </Link>
      </div>
    </div>
  );
}
