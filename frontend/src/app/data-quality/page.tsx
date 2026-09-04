"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, DataQuality } from "@/lib/api";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Activity, RefreshCw } from "lucide-react";

export default function DataQualityPage() {
  const [dq, setDq] = useState<DataQuality | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getDataQuality()
      .then(setDq)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">DATA HEALTH & TRUST MONITOR</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Real-time ingestion status of market tick feeds, exchange announcement scrapers, and sector benchmark data sources.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <span>Pinging data source endpoints and checking latency metrics...</span>
          </div>
        ) : dq ? (
          <div className="space-y-6">
            
            {/* Overview Status Banner */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                  SYSTEM STATUS: {dq.overall_status}
                </span>
                <h2 className="text-xl font-extrabold text-white">Overall Market Feed Confidence</h2>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  1 source experiencing minor provider latency. Score calculations gracefully adjust bounds.
                </p>
              </div>

              <div className="text-right bg-slate-950/80 px-6 py-4 rounded-xl border border-slate-800">
                <span className="text-3xl font-black text-emerald-400">{dq.overall_confidence_pct}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Score</span>
              </div>
            </div>

            {/* Active System Warnings */}
            {dq.active_warnings.length > 0 && (
              <div className="space-y-3">
                {dq.active_warnings.map((warn, i) => (
                  <div key={i} className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-semibold flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Individual Data Feed Status Table */}
            <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-lg font-black text-white mb-4">INGESTION FEED METRICS</h2>

              <div className="space-y-4">
                {dq.sources.map((src, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      {src.status === "HEALTHY" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">{src.source_name}</h3>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                            src.status === "HEALTHY" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}>
                            {src.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{src.details}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono text-xs">
                      <span className="text-slate-300 font-bold block">{src.last_updated}</span>
                      <span className="text-slate-500 font-semibold">{src.latency_ms} ms latency</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
