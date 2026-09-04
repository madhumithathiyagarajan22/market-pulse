"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Activity, ShieldCheck, Sliders, ListFilter, History, LogOut, User as UserIcon } from "lucide-react";

interface NavbarProps {
  onOpenCatchUp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCatchUp }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Tagline */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">MARKET PULSE</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Demo Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Don&apos;t watch the market. Know what changed.</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-4">
          {user ? (
            <>
              {onOpenCatchUp && (
                <button
                  onClick={onOpenCatchUp}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  <History className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Catch Me Up</span>
                </button>
              )}

              <Link
                href="/watchlist"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Watchlist</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">My Signals</span>
              </Link>

              <Link
                href="/data-quality"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Data Health</span>
              </Link>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <div className="flex items-center space-x-2 pl-1">
                <span className="text-xs text-slate-400 font-medium hidden md:inline">{user.full_name}</span>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
};
