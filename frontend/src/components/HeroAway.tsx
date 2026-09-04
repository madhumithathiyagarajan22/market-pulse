"use client";

import React from "react";
import { HeroAway as HeroAwayType } from "@/lib/api";
import { Clock, Activity, CheckCircle2, Zap, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface HeroAwayProps {
  hero: HeroAwayType;
  onMarkChecked: () => void;
  isChecking: boolean;
}

export const HeroAway: React.FC<HeroAwayProps> = ({ hero, onMarkChecked, isChecking }) => {
  if (hero.is_first_visit) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-900 mb-8 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/60 mb-2">
              <span>First Visit Initialization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {hero.headline}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {hero.subtext} Market Pulse will measure future price anomalies, volume surges, and sector divergence relative to this baseline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const normalFilteredCount = Math.max(0, hero.stocks_tracked_count - hero.meaningful_changes_count);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[#1a2333] bg-[#0e1420] mb-8 shadow-2xl relative overflow-hidden">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-md border border-amber-800/60 mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>YOU WERE AWAY FOR {hero.time_away_formatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {hero.stocks_tracked_count} stocks checked.{" "}
            <span className="text-amber-400">{hero.meaningful_changes_count} meaningful changes</span> require attention.
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            <strong className="text-slate-300">{normalFilteredCount} normal movements</strong> were filtered out as standard historical noise.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <button
            onClick={onMarkChecked}
            disabled={isChecking}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{isChecking ? "Updating Checkpoint..." : "Mark Dashboard as Read"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1a2333]">
        <div className="bg-[#141c2c] p-3 rounded-xl border border-[#1a2333]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">1. Time Away</span>
          <span className="text-sm font-extrabold text-white mt-0.5 block">{hero.time_away_formatted}</span>
        </div>

        <div className="bg-[#141c2c] p-3 rounded-xl border border-[#1a2333]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">2. Stocks Checked</span>
          <span className="text-sm font-extrabold text-white mt-0.5 block">{hero.stocks_tracked_count} Equities</span>
        </div>

        <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">3. Meaningful Changes</span>
          <span className="text-sm font-black text-amber-300 mt-0.5 block">{hero.meaningful_changes_count} Flagged</span>
        </div>

        <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">4. Noise Filtered Out</span>
          <span className="text-sm font-extrabold text-emerald-300 mt-0.5 block">{normalFilteredCount} Suppressed</span>
        </div>
      </div>

      {/* Top Changes Deserving Attention */}
      <div className="mt-5 pt-4 border-t border-[#1a2333]">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">
          TOP 1–3 CHANGES DESERVING IMMEDIATE ATTENTION
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#141c2c] p-3.5 rounded-xl border border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">RELIANCE</span>
              <span className="text-xs font-mono font-bold text-rose-400">₹1,421.20 (-2.80%)</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
              <strong className="text-amber-400 font-semibold">Reason:</strong> Abnormal drop coincided with Green Hydrogen BSE Filing & 2.7× volume surge.
            </p>
          </div>

          <div className="bg-[#141c2c] p-3.5 rounded-xl border border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">TCS</span>
              <span className="text-xs font-mono font-bold text-emerald-400">₹3,892.40 (+1.80%)</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
              <strong className="text-amber-400 font-semibold">Reason:</strong> Trading volume surged 2.1× 30-day average following IT sector trend.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
