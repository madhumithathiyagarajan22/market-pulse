"use client";

import React from "react";
import { ChangeEvent } from "@/lib/api";
import { X, Sparkles, ArrowDown, CheckCircle2, Clock, BarChart2, AlertTriangle, Newspaper } from "lucide-react";

interface ChangeStoryModalProps {
  change: ChangeEvent | null;
  onClose: () => void;
}

export const ChangeStoryModal: React.FC<ChangeStoryModalProps> = ({ change, onClose }) => {
  if (!change) return null;

  const currentPrice = change.price;
  const changePct = change.price_change_pct;
  const initialPrice = currentPrice / (1 + changePct / 100);
  const isNegative = changePct < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-[#0e1420] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title & Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800/80 mb-1">
              <span>NARRATIVE CHANGE STORY</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {change.stock_symbol} — WHAT CHANGED
            </h2>
          </div>
        </div>

        {/* Story Timeline Steps */}
        <div className="relative pl-6 space-y-4 my-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          
          {/* Step 1: Last Checked State */}
          <div className="relative flex items-start space-x-3">
            <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-slate-700 border-2 border-[#0e1420]" />
            <div className="flex-1 bg-[#141c2c] p-3.5 rounded-xl border border-[#1a2333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                1. Last Checked State
              </span>
              <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                ₹{initialPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Connector Down Arrow */}
          <div className="flex justify-center text-slate-500 py-0.5">
            <ArrowDown className="h-4 w-4 animate-bounce text-cyan-400" />
          </div>

          {/* Step 2: Company Event (if present) */}
          {change.recent_news ? (
            <>
              <div className="relative flex items-start space-x-3">
                <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-[#0e1420]" />
                <div className="flex-1 bg-[#141c2c] p-3.5 rounded-xl border border-cyan-800/40">
                  <div className="flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                    <Newspaper className="h-3 w-3" />
                    <span>2. Company Event Detected</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                    {change.recent_news.title}
                  </h4>
                  {change.recent_news.source && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Source: {change.recent_news.source} ({change.recent_news.time_ago || "recently"})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center text-slate-500 py-0.5">
                <ArrowDown className="h-4 w-4 text-cyan-400" />
              </div>
            </>
          ) : null}

          {/* Step 3: Volume / Anomaly Surge */}
          <div className="relative flex items-start space-x-3">
            <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-[#0e1420]" />
            <div className="flex-1 bg-[#141c2c] p-3.5 rounded-xl border border-amber-800/40">
              <div className="flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                <BarChart2 className="h-3 w-3" />
                <span>3. Volume & Price Activity Surge</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-1">
                Volume increased to <strong className="text-amber-300 font-mono">{change.volume_ratio.toFixed(1)}×</strong> 30-day average daily volume.
              </p>
            </div>
          </div>

          <div className="flex justify-center text-slate-500 py-0.5">
            <ArrowDown className="h-4 w-4 text-cyan-400" />
          </div>

          {/* Step 4: Sector Divergence */}
          <div className="relative flex items-start space-x-3">
            <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-rose-400 border-2 border-[#0e1420]" />
            <div className="flex-1 bg-[#141c2c] p-3.5 rounded-xl border border-rose-800/40">
              <div className="flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                <span>4. Sector Benchmark Divergence</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                {change.stock_symbol} ({changePct > 0 ? "+" : ""}{changePct.toFixed(2)}%) vs {change.sector} ({change.sector_change_pct > 0 ? "+" : ""}{change.sector_change_pct.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="flex justify-center text-slate-500 py-0.5">
            <ArrowDown className="h-4 w-4 text-cyan-400" />
          </div>

          {/* Step 5: Current State */}
          <div className="relative flex items-start space-x-3">
            <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#0e1420]" />
            <div className="flex-1 bg-[#141c2c] p-3.5 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                5. Current State
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-lg font-black text-white font-mono">
                  ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-extrabold font-mono ${isNegative ? "text-rose-400" : "text-emerald-400"}`}>
                  ({changePct > 0 ? "+" : ""}{changePct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Conclusion Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
            SUMMARY CONCLUSION
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            &quot;{change.interpretation}&quot;
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs transition-all shadow-md active:scale-95"
        >
          Close Change Story
        </button>

      </div>
    </div>
  );
};
