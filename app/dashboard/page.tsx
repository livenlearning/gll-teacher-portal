import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = (session.user as { id: string }).id;

  // Teachers see cohorts where they are assigned as a teacher OR a partner school teacher
  const cohorts = await prisma.cohort.findMany({
    where: {
      OR: [
        { teachers: { some: { teacherId: userId } } },
        { partnerSchools: { some: { teacherId: userId } } },
      ],
    },
    include: {
      weeks: { orderBy: { weekNumber: "asc" } },
      partnerSchools: { include: { teacher: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">My Cohorts</h1>
        <span className="text-sm text-gray-500">{cohorts.length} cohort{cohorts.length !== 1 ? "s" : ""}</span>
      </div>

      {cohorts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No cohorts assigned yet.</p>
          <p className="text-gray-400 text-xs mt-1">An admin will assign cohorts to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((cohort) => (
            <Link
              key={cohort.id}
              href={`/cohort/${cohort.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-navy-400 hover:shadow-sm transition-all"
            >
              <h2 className="text-base font-semibold text-gray-800">{cohort.name}</h2>
              <p className="text-xs text-gray-400 mt-1">{cohort.weeks.length} week{cohort.weeks.length !== 1 ? "s" : ""} of content</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {cohort.weeks.slice(0, 4).map((week) => (
                  <span
                    key={week.id}
                    className="inline-block bg-navy-50 text-navy-600 text-xs px-2 py-0.5 rounded-full"
                  >
                    Week {week.weekNumber}
                  </span>
                ))}
                {cohort.weeks.length > 4 && (
                  <span className="text-xs text-gray-400">+{cohort.weeks.length - 4} more</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
