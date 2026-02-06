"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md overflow-hidden">
        <div className="h-2 bg-gold-500" />
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Image
                src="/banyan-logo.png"
                alt="Banyan Global Learning"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-navy-900">Global Learning Live</h1>
            <p className="text-gray-500 text-sm mt-0.5">Teacher Portal — Sign in to manage your cohorts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
