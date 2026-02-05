import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import CreateUnitForm from "../../../components/create-unit-form";

export const dynamic = "force-dynamic";

export default async function AdminUnitsPage() {
  const units = await prisma.unit.findMany({
    include: {
      weeks: {
        include: { content: true },
      },
      cohorts: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Units</h1>

      <CreateUnitForm />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weeks</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Items</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Used By</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit) => {
              const totalContent = unit.weeks.reduce((sum, w) => sum + w.content.length, 0);
              return (
                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{unit.name}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">{unit.description || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{unit.weeks.length}</td>
                  <td className="px-5 py-3 text-gray-600">{totalContent}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    {unit.cohorts.length === 0
                      ? <span className="text-gray-400">None</span>
                      : unit.cohorts.map((c) => c.name).join(", ")}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/units/${unit.id}`}
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

        {units.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-gray-400">No units yet. Create one above to get started.</p>
        )}
      </div>
    </div>
  );
}
