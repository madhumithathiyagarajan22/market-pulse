"use client";

import React from "react";
import { ChangeEvent } from "@/lib/api";
import { X, CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info } from "lucide-react";

interface WhyModalProps {
  change: ChangeEvent | null;
  onClose: () => void;
}

export const WhyModal: React.FC<WhyModalProps> = ({ change, onClose }) => {
  if (!change) return null;

  const score = Math.round(change.attention_score);

  // Compute contribution percentages based on signal weights
  const priceContrib = Math.min(30, Math.round(30 * Math.min(1.0, Math.abs(change.price_change_pct) / 3.0)));
  const volContrib = Math.min(20, Math.round(20 * Math.min(1.0, (change.volume_ratio - 1.0) / 2.0)));
  const newsContrib = change.recent_news ? 20 : 0;
  const sectorContrib = Math.min(15, Math.round(15 * Math.min(1.0, Math.abs(change.price_change_pct - change.sector_change_pct) / 2.0)));
  const marketContrib = Math.min(15, Math.round(15 * Math.min(1.0, Math.abs(change.price_change_pct - change.market_change_pct) / 2.0)));

  const factorWeights = [
    { label: "Price Anomaly", maxWeight: 30, value: priceContrib, color: "bg-amber-400" },
    { label: "Volume Anomaly", maxWeight: 20, value: volContrib, color: "bg-cyan-400" },
    { label: "Company Event", maxWeight: 20, value: newsContrib, color: "bg-emerald-400" },
    { label: "Sector Divergence", maxWeight: 15, value: sectorContrib, color: "bg-rose-400" },
    { label: "Market Divergence", maxWeight: 15, value: marketContrib, color: "bg-purple-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#0e1420] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800 mb-1">
              <span>HEURISTIC ATTENTION SCORE</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              WHY {score}/100?
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {change.stock_symbol} ({change.stock_name}) · {change.attention_level} ATTENTION
            </p>
          </div>
        </div>

        {/* Fundamental Explanation Note */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-xs text-slate-300 leading-relaxed font-medium">
          <strong className="text-cyan-400 font-bold block mb-1">How Attention Score Works:</strong>
          &quot;Market Pulse combines multiple independent signals to determine whether a movement deserves attention. The score is a transparent heuristic designed to highlight anomalies, not a predictive or scientifically perfect metric.&quot;
        </div>

        {/* Factor Breakdown Bars */}
        <div className="p-4 rounded-xl bg-[#141c2c] border border-[#1a2333] mb-6 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            TRANSPARENT SIGNAL WEIGHT BREAKDOWN
          </span>

          {factorWeights.map((factor, idx) => {
            const pct = Math.round((factor.value / factor.maxWeight) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">{factor.label}</span>
                  <span className="font-mono text-slate-400">
                    {factor.value}% / {factor.maxWeight}%
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${factor.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Plain Language Summary Box */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
            <Info className="h-4 w-4" />
            <span>SUMMARY EXPLANATION</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            &quot;{change.stock_symbol} moved significantly more than its normal range ({change.price_change_pct > 0 ? "+" : ""}{change.price_change_pct.toFixed(2)}%), trading volume was unusually high ({change.volume_ratio.toFixed(1)}× normal), and the movement diverged from its sector and the broader market.{change.recent_news ? ' A recent company event provides additional context.' : ''}&quot;
          </p>
        </div>

        {/* Signal Evidence Items */}
        <div className="space-y-3 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
            DETAILED SIGNAL EVIDENCE
          </span>

          {change.evidence.map((ev, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start space-x-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{ev.title}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    +{ev.score_contribution.toFixed(0)} pts
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ev.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Non-Investment Disclaimer */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start space-x-2.5 text-amber-300 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong className="font-bold block">Attention Score Explanation Only</strong>
            This score quantifies statistical market anomalies and news presence. It is <strong>NOT</strong> an investment recommendation or financial advice.
          </span>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all shadow-md"
        >
          Close Explanation
        </button>

      </div>
    </div>
  );
};
