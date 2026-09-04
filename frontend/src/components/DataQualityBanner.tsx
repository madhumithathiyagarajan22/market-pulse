"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Clock, ChevronRight } from "lucide-react";

interface DataQualityBannerProps {
  warning?: string;
}

export const DataQualityBanner: React.FC<DataQualityBannerProps> = ({ warning }) => {
  if (!warning) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-amber-500/40 bg-amber-950/30 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
            DATA QUALITY ALERT
          </span>
          <p className="text-xs text-slate-300 font-medium">{warning}</p>
        </div>
      </div>

      <Link
        href="/data-quality"
        className="flex items-center space-x-1 text-xs font-bold text-amber-300 hover:text-white bg-amber-900/60 px-3 py-1.5 rounded-lg border border-amber-700/60 transition-all self-end sm:self-center"
      >
        <span>View Source Health</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
};
