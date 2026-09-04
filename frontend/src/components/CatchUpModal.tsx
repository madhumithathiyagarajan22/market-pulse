"use client";

import React, { useState, useEffect } from "react";
import { api, CatchUpResponse } from "@/lib/api";
import { X, History, Sparkles, ChevronRight, Layers, ArrowUpRight } from "lucide-react";

interface CatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatchUpModal: React.FC<CatchUpModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<CatchUpResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getCatchUp(68.0)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Multi-Day Compression</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">CATCH ME UP</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium animate-pulse">
            Compressing 60+ raw market events into key story narratives...
          </div>
        ) : data ? (
          <div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
              <p className="text-sm text-slate-200 font-medium">
                You missed <strong className="text-amber-400">{data.total_events_missed} events</strong> while away for ~3 days. We&apos;ve compressed them into <strong className="text-white">{data.stories.length} key stories</strong>:
              </p>
            </div>

            <div className="space-y-4">
              {data.stories.map((s) => (
                <div key={s.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                        {s.category}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-2">{s.title}</h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                      {s.event_count} events merged
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-medium">
                    {s.summary}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all shadow-md"
            >
              Resume Live Dashboard
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
