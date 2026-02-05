"use client";

import { useState } from "react";

interface WeekContentItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
}

interface Week {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string | null;
  unlocked: boolean;
  content: WeekContentItem[];
}

const TYPE_LABELS: Record<string, string> = {
  LESSON: "Lesson",
  VIDEO: "Video",
  RESOURCE: "Resource",
  ASSIGNMENT: "Assignment",
  TASK: "Task",
  DELIVERABLE: "Deliverable",
  LINK: "Link",
  CROSS_CLASSROOM: "Cross-Classroom",
  SURVEY: "Survey",
  GALLERY: "Gallery",
};

const TYPE_COLORS: Record<string, string> = {
  LESSON: "bg-blue-100 text-blue-700",
  VIDEO: "bg-cyan-100 text-cyan-700",
  RESOURCE: "bg-pink-100 text-pink-700",
  ASSIGNMENT: "bg-orange-100 text-orange-700",
  TASK: "bg-orange-100 text-orange-700",
  DELIVERABLE: "bg-orange-100 text-orange-700",
  LINK: "bg-indigo-100 text-indigo-700",
  CROSS_CLASSROOM: "bg-green-100 text-green-700",
  SURVEY: "bg-purple-100 text-purple-700",
  GALLERY: "bg-teal-100 text-teal-700",
};

export default function WeekCard({ week }: { week: Week }) {
  const [expanded, setExpanded] = useState(week.unlocked && week.weekNumber <= 1);

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${week.unlocked ? "border-gray-200" : "border-gray-200 opacity-75"}`}>
      {/* Week Header — clickable toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Lock / Unlock icon */}
          {week.unlocked ? (
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-3 8a1 1 0 11-2 0 1 1 0 012 0zm6 3a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V9a3 3 0 016 0v2m-6 0a3 3 0 00-3 3v4a2 2 0 002 2h10a2 2 0 002-2v-4a3 3 0 00-3-3m-6 0h6" />
            </svg>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-navy-600 uppercase tracking-wide">
                {week.weekNumber === 0 ? "Pre-Unit" : `Week ${week.weekNumber}`}
              </span>
              {!week.unlocked && (
                <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.25 rounded-full">Locked</span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-gray-800">{week.title}</h2>
            {week.subtitle && <p className="text-xs text-gray-500">{week.subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{week.content.length} item{week.content.length !== 1 ? "s" : ""}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        week.content.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400 italic">No content added for this week.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {week.content.map((item) => (
              <li key={item.id} className="px-5 py-3 flex items-start gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600"}`}>
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  {item.body && <p className="text-xs text-gray-500 mt-0.5">{item.body}</p>}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-navy-600 hover:underline mt-0.5 inline-block"
                    >
                      Open link →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
