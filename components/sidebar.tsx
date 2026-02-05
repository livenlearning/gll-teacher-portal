"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";
  const isAdminSection = pathname.startsWith("/admin");

  return (
    <aside className="w-64 bg-navy-600 flex flex-col">
      <div className="p-5 border-b border-navy-500">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-white">GLL Portal</h1>
        </div>
        <p className="text-xs text-navy-200">{session?.user?.name}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-gold-500 text-navy-900 font-semibold"
              : "text-navy-100 hover:bg-navy-500"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-4 0h4" />
          </svg>
          Dashboard
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === "/admin"
                  ? "bg-gold-500 text-navy-900 font-semibold"
                  : "text-navy-100 hover:bg-navy-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.826 3.31.077 3.279 1.815a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.31 1.538-1.457 2.441-3.279 1.815a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.522.626-3.289-.277-3.279-1.815a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.31-1.538 1.457-2.441 3.279-1.815a1.724 1.724 0 002.573-1.066z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>

            {/* Admin sub-nav — visible when in admin section */}
            {isAdminSection && (
              <div className="ml-6 mt-1 space-y-0.5 border-l border-navy-500 pl-3">
                <Link
                  href="/admin/users"
                  className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                    pathname.startsWith("/admin/users")
                      ? "bg-gold-400 text-navy-900 font-semibold"
                      : "text-navy-200 hover:bg-navy-500 hover:text-white"
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/cohorts"
                  className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                    pathname.startsWith("/admin/cohorts")
                      ? "bg-gold-400 text-navy-900 font-semibold"
                      : "text-navy-200 hover:bg-navy-500 hover:text-white"
                  }`}
                >
                  Cohorts
                </Link>
                <Link
                  href="/admin/units"
                  className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                    pathname.startsWith("/admin/units")
                      ? "bg-gold-400 text-navy-900 font-semibold"
                      : "text-navy-200 hover:bg-navy-500 hover:text-white"
                  }`}
                >
                  Units
                </Link>
              </div>
            )}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-navy-500">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
