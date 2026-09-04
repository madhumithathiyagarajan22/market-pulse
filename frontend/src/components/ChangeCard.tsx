"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChangeEvent } from "@/lib/api";
import { TrendingDown, TrendingUp, AlertTriangle, HelpCircle, ChevronRight, Zap, Newspaper, BarChart2, BookOpen, ThumbsUp, ThumbsDown, Check, ShieldCheck, ShieldAlert } from "lucide-react";

interface ChangeCardProps {
  change: ChangeEvent;
  onInspectEvidence: (change: ChangeEvent) => void;
  onViewStory?: (change: ChangeEvent) => void;
}

export const ChangeCard: React.FC<ChangeCardProps> = ({ change, onInspectEvidence, onViewStory }) => {
  const [feedback, setFeedback] = useState<"useful" | "not_useful" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`pulse_fb_${change.stock_symbol}`);
      if (saved === "useful" || saved === "not_useful") {
        setFeedback(saved);
      }
    }
  }, [change.stock_symbol]);

  const handleFeedback = (val: "useful" | "not_useful") => {
    setFeedback(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(`pulse_fb_${change.stock_symbol}`, val);
    }
  };

  const isHigh = change.attention_score >= 75.0;
  const isNegative = change.price_change_pct < 0;
  const stockMove = change.price_change_pct;
  const sectorMove = change.sector_change_pct;
  const marketMove = change.market_change_pct;

  return (
    <div className={`glass-card rounded-2xl p-6 border transition-all relative overflow-hidden ${
      isHigh 
        ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-[#0e1420] to-[#0e1420]" 
        : "border-[#1a2333] bg-[#0e1420]"
    }`}>
      
      {/* Alert Confidence Bar */}
      <div className="flex items-center justify-between mb-3 text-[10px] font-bold">
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
          <ShieldCheck className="h-3 w-3" />
          <span>High Confidence Feed</span>
        </div>
        <span className="text-slate-400 font-mono">BSE / NSE Live Baseline</span>
      </div>

      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">{change.stock_symbol}</span>
            <span className="text-xs font-semibold text-slate-400">· {change.stock_name}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {change.sector}
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-3xl font-black text-white">
              ₹{change.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
              isNegative 
                ? "bg-rose-950/80 text-rose-400 border-rose-800/60" 
                : "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
            }`}>
              {isNegative ? <TrendingDown className="h-3.5 w-3.5 mr-1" /> : <TrendingUp className="h-3.5 w-3.5 mr-1" />}
              {stockMove > 0 ? "+" : ""}{stockMove.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Visual Attention Score Badge */}
        <div className="flex flex-col items-end">
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border shadow-lg ${
            isHigh 
              ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border-amber-500/40" 
              : "bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-300 border-cyan-500/40"
          }`}>
            <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black">{change.attention_score.toFixed(0)}</span>
              <span className="text-[10px] font-bold text-slate-400">/100</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">
            {change.attention_level} ATTENTION
          </span>
        </div>
      </div>

      {/* Signal Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {change.volume_ratio >= 1.5 && (
          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/60">
            <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
            {change.volume_ratio.toFixed(1)}× Normal Volume
          </span>
        )}

        {change.recent_news && (
          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/60">
            <Newspaper className="h-3.5 w-3.5 mr-1.5" />
            Exchange Announcement
          </span>
        )}

        {Math.abs(stockMove - sectorMove) >= 1.2 && (
          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/60">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Stock-Specific Movement
          </span>
        )}
      </div>

      {/* Relative Performance Breakdown */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#090d14] border border-[#1a2333]">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Relative Performance Breakdown</span>
          <span className="font-mono text-slate-300">Stock vs Sector vs Market</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#141c2c] p-2 rounded-lg border border-[#1a2333]">
            <span className="text-[10px] text-slate-400 font-bold block">{change.stock_symbol}</span>
            <span className={`font-mono font-extrabold block mt-0.5 ${stockMove < 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {stockMove > 0 ? "+" : ""}{stockMove.toFixed(1)}%
            </span>
          </div>

          <div className="bg-[#141c2c] p-2 rounded-lg border border-[#1a2333]">
            <span className="text-[10px] text-slate-400 font-bold block">{change.sector}</span>
            <span className={`font-mono font-bold block mt-0.5 ${sectorMove < 0 ? "text-rose-300" : "text-emerald-300"}`}>
              {sectorMove > 0 ? "+" : ""}{sectorMove.toFixed(1)}%
            </span>
          </div>

          <div className="bg-[#141c2c] p-2 rounded-lg border border-[#1a2333]">
            <span className="text-[10px] text-slate-400 font-bold block">NIFTY 50</span>
            <span className={`font-mono font-bold block mt-0.5 ${marketMove < 0 ? "text-rose-300" : "text-emerald-300"}`}>
              {marketMove > 0 ? "+" : ""}{marketMove.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* WHY THIS MATTERS Section */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
          WHY THIS MATTERS
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          {change.interpretation}
        </p>
      </div>

      {/* Card Action & Feedback Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[#1a2333]">
        
        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {onViewStory && (
            <button
              onClick={() => onViewStory(change)}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-3.5 py-2 rounded-xl border border-amber-800/60 transition-all active:scale-95"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Change Story</span>
            </button>
          )}

          <button
            onClick={() => onInspectEvidence(change)}
            className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 px-3.5 py-2 rounded-xl border border-cyan-800/60 transition-all active:scale-95"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Why am I seeing this?</span>
          </button>

          <Link
            href={`/stock/${change.stock_symbol}`}
            className="flex items-center space-x-1 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <span>Timeline</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Feedback Controls (Was this useful? 👍 👎) */}
        <div className="flex items-center space-x-2 text-xs self-end sm:self-center">
          {feedback ? (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 animate-fade-in">
              <Check className="h-3 w-3 mr-1" />
              Feedback saved
            </span>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="text-[10px] font-semibold">Was this useful?</span>
              <button
                onClick={() => handleFeedback("useful")}
                className="p-1 rounded-lg hover:text-emerald-400 hover:bg-emerald-950/60 transition-all text-slate-400"
                title="Useful alert"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleFeedback("not_useful")}
                className="p-1 rounded-lg hover:text-rose-400 hover:bg-rose-950/60 transition-all text-slate-400"
                title="Not useful alert"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
