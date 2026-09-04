"use client";

import React from "react";
import { SectorStory } from "@/lib/api";
import { Layers } from "lucide-react";

interface SectorStoryCardProps {
  story: SectorStory;
}

export const SectorStoryCard: React.FC<SectorStoryCardProps> = ({ story }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Sector Aggregated Story
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {story.sector_name} Benchmark ({story.sector_change_pct > 0 ? "+" : ""}{story.sector_change_pct.toFixed(1)}%)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1">{story.headline}</h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Attention: LOW
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-medium">
        {story.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400">Affected Watchlist Stocks:</span>
        {story.stock_symbols.map((sym) => (
          <span key={sym} className="text-xs font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {sym}
          </span>
        ))}
      </div>
    </div>
  );
};
