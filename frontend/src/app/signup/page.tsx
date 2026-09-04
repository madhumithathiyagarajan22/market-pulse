"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, User, ArrowRight, CheckCircle2, Circle, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time password requirement checks
  const reqMinLength = password.length >= 8;
  const reqUppercase = /[A-Z]/.test(password);
  const reqLowercase = /[a-z]/.test(password);
  const reqNumber = /[0-9]/.test(password);
  const reqSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const reqMatch = password.length > 0 && password === confirmPassword;

  const isPasswordValid = reqMinLength && reqUppercase && reqLowercase && reqNumber && reqSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Check empty / whitespace password
    if (!password || password.trim().length === 0) {
      setError("Password cannot be empty or whitespace-only.");
      return;
    }

    // 2. Reject if any password criteria is unsatisfied
    if (!reqMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!reqUppercase) {
      setError("Password must contain at least 1 uppercase letter (A-Z).");
      return;
    }
    if (!reqLowercase) {
      setError("Password must contain at least 1 lowercase letter (a-z).");
      return;
    }
    if (!reqNumber) {
      setError("Password must contain at least 1 number (0-9).");
      return;
    }
    if (!reqSpecial) {
      setError("Password must contain at least 1 special character (e.g. ! @ # $ %).");
      return;
    }

    // 3. Check password confirmation match
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MARKET PULSE</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Create your intelligent market attention filter.</p>
        </div>

        {/* Signup Form Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[#1a2333] shadow-2xl bg-[#0e1420]">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d14] border border-[#1a2333] text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="Rahul Sharma"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d14] border border-[#1a2333] text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="rahul@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d14] border border-[#1a2333] text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Password Requirement Checklist */}
              <div className="mt-3 p-3 rounded-xl bg-[#090d14] border border-[#1a2333] space-y-1.5 text-[11px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  PASSWORD REQUIREMENTS
                </span>
                
                <div className={`flex items-center space-x-2 font-medium ${reqMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                  {reqMinLength ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-slate-600" />}
                  <span>Minimum 8 characters</span>
                </div>

                <div className={`flex items-center space-x-2 font-medium ${reqUppercase ? "text-emerald-400" : "text-slate-500"}`}>
                  {reqUppercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-slate-600" />}
                  <span>At least 1 uppercase letter (A-Z)</span>
                </div>

                <div className={`flex items-center space-x-2 font-medium ${reqLowercase ? "text-emerald-400" : "text-slate-500"}`}>
                  {reqLowercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-slate-600" />}
                  <span>At least 1 lowercase letter (a-z)</span>
                </div>

                <div className={`flex items-center space-x-2 font-medium ${reqNumber ? "text-emerald-400" : "text-slate-500"}`}>
                  {reqNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-slate-600" />}
                  <span>At least 1 number (0-9)</span>
                </div>

                <div className={`flex items-center space-x-2 font-medium ${reqSpecial ? "text-emerald-400" : "text-slate-500"}`}>
                  {reqSpecial ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5 text-slate-600" />}
                  <span>At least 1 special character (! @ # $ %)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d14] border border-[#1a2333] text-white text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-[11px] mt-1.5 font-bold flex items-center space-x-1 ${reqMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  {reqMatch ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-md active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Creating Account..." : "Create Account & Watchlist"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-extrabold">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
