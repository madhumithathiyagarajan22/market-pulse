"use client";

import React, { useState } from "react";
import { SuppressedStock } from "@/lib/api";
import { CheckCircle2, ChevronDown, ChevronUp, VolumeX } from "lucide-react";

interface SuppressedSectionProps {
  stocks: SuppressedStock[];
}

export const SuppressedSection: React.FC<SuppressedSectionProps> = ({ stocks }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!stocks || stocks.length === 0) return null;

  const symbolList = stocks.map((s) => s.symbol).join(" · ");

  return (
    <div className="glass-card rounded-2xl p-6 border border-emerald-900/40 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 my-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                ✓ {stocks.length} OTHER STOCKS
              </span>
              <span className="text-xs font-semibold text-slate-400">— Noise Suppressed</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">Nothing meaningful changed.</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              We deliberately didn&apos;t surface normal market noise for: <span className="text-slate-300 font-semibold">{symbolList}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
        >
          <span>{expanded ? "Hide Details" : "Inspect Normal Stocks"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded Table */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="pb-2">Stock</th>
                <th className="pb-2">Sector</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Today&apos;s Move</th>
                <th className="pb-2">Status & Noise Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {stocks.map((s) => (
                <tr key={s.symbol} className="text-slate-300">
                  <td className="py-2.5 font-bold text-white">{s.symbol}</td>
                  <td className="py-2.5 text-slate-400">{s.sector}</td>
                  <td className="py-2.5 font-mono">₹{s.price.toFixed(2)}</td>
                  <td className={`py-2.5 font-bold ${s.change_pct < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {s.change_pct > 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
                  </td>
                  <td className="py-2.5 text-slate-400 font-medium">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
