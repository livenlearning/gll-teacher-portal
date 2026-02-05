import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import CreateCohortForm from "../../../components/create-cohort-form";

export const dynamic = "force-dynamic";

export default async function AdminCohortsPage() {
  const [cohorts, teachers, units] = await Promise.all([
    prisma.cohort.findMany({
      include: {
        teachers: {
          include: {
            teacher: { select: { name: true } },
          },
        },
        unit: { select: { name: true } },
        weeks: {
          include: { content: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.unit.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Cohorts</h1>

      <CreateCohortForm teachers={teachers} units={units} />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cohort</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teachers</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weeks</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Items</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cohorts.map((cohort) => {
              const totalContent = cohort.weeks.reduce((sum, w) => sum + w.content.length, 0);
              return (
                <tr key={cohort.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{cohort.name}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {cohort.teachers.length === 0 ? (
                      <span className="text-xs text-gray-400">No teachers</span>
                    ) : (
                      <span className="text-xs">{cohort.teachers.map((ct) => ct.teacher.name).join(", ")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {cohort.unit ? (
                      <span className="text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">{cohort.unit.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{cohort.weeks.length}</td>
                  <td className="px-5 py-3 text-gray-600">{totalContent}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/cohorts/${cohort.id}`}
                      className="text-xs text-navy-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {cohorts.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">No cohorts found.</p>
        )}
      </div>
    </div>
  );
}
