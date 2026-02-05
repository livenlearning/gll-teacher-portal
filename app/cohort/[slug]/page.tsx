import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import WeekCard from "../../../components/week-card";

export const dynamic = "force-dynamic";

export default async function CohortPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const cohort = await prisma.cohort.findFirst({
    where: { slug },
    include: {
      teachers: {
        include: {
          teacher: { select: { name: true } },
        },
      },
      partnerSchools: { include: { teacher: { select: { name: true } } } },
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          content: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!cohort) notFound();

  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  // Teachers can see cohorts where they are lead teacher or a partner school teacher; admins see all
  const isPartnerTeacher = cohort.partnerSchools.some((ps) => ps.teacherId === userId);
  if (cohort.teacherId !== userId && !isPartnerTeacher && !isAdmin) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-sm text-navy-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      {/* Cohort Header */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="h-1.5 bg-gold-500" />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{cohort.name}</h1>
              {cohort.facilitator && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Facilitator: <span className="font-medium text-navy-700">{cohort.facilitator}</span>
                </p>
              )}
            </div>
            <span className="text-xs bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full font-medium">
              {cohort.weeks.length} week{cohort.weeks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Session Info + Partner Schools */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              {cohort.sessionDay && cohort.sessionTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-navy-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{cohort.sessionDay}, {cohort.sessionTime}</span>
                </div>
              )}
              {cohort.startDate && cohort.endDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-navy-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>
                    {new Date(cohort.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                    {new Date(cohort.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
            {cohort.partnerSchools.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Partner Schools</p>
                <div className="flex flex-wrap gap-1.5">
                  {cohort.partnerSchools.map((school) => (
                    <span key={school.id} className="text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                      {school.name}
                      {school.location && <span className="text-navy-400 ml-1">— {school.location}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        {cohort.padletLink && (
          <a href={cohort.padletLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 font-medium transition-colors">
            <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
            Padlet
          </a>
        )}
        {cohort.zoomLink && (
          <a href={cohort.zoomLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 font-medium transition-colors">
            <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 8h7v8H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
            </svg>
            Zoom Meeting
          </a>
        )}
        {cohort.facilitatorEmail && (
          <a href={`mailto:${cohort.facilitatorEmail}`}
            className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 font-medium transition-colors">
            <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Facilitator
          </a>
        )}
      </div>

      {/* Week Cards */}
      {cohort.weeks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm">No weekly content yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohort.weeks.map((week) => (
            <WeekCard key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}
