"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>("demo@marketpulse.io");
  const [password, setPassword] = useState<string>("demopassword123");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MARKET PULSE</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Don&apos;t watch the market. Know what changed.</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl bg-slate-900">
          
          <div className="mb-6 p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-start space-x-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              <strong className="text-cyan-300 font-bold block">Instant Demo Access Ready</strong>
              Pre-filled credentials allow instant testing of all market scenarios.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Create account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
