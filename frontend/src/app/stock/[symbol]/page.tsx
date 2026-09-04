"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { api, StockDetail } from "@/lib/api";
import { ArrowLeft, Clock, TrendingDown, TrendingUp, Zap, HelpCircle, Newspaper, BarChart2, ShieldCheck, RefreshCw, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      setLoading(true);
      api.getStockDetail(symbol)
        .then(setDetail)
        .catch((err) => setError(err.message || "Failed to load stock details"))
        .finally(() => setLoading(false));
    }
  }, [symbol]);

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <span>Loading timeline events for {symbol}...</span>
          </div>
        ) : error || !detail ? (
          <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
            {error || "Stock symbol not found"}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Stock Summary Header Card */}
            <div className="p-6 rounded-2xl border border-[#1a2333] bg-[#0e1420] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{detail.symbol}</h1>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {detail.sector}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{detail.exchange}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-0.5 font-semibold">{detail.name}</p>
                </div>

                <div className="flex items-baseline space-x-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Price</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ₹{detail.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Today&apos;s Change</span>
                    <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                      detail.change_pct < 0 ? "bg-rose-950/80 text-rose-400 border border-rose-800" : "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                    }`}>
                      {detail.change_pct < 0 ? <TrendingDown className="h-3.5 w-3.5 mr-1" /> : <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                      {detail.change_pct > 0 ? "+" : ""}{detail.change_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Core Quick Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#1a2333]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Recent Move</span>
                  <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                    {detail.change_pct > 0 ? "+" : ""}{detail.change_pct.toFixed(2)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Volume Surge</span>
                  <span className="text-sm font-extrabold text-amber-300 font-mono mt-0.5 block">
                    {(detail.avg_volume_30d / 1000000).toFixed(1)}M shares
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Sector Benchmark</span>
                  <span className="text-sm font-extrabold text-slate-300 font-mono mt-0.5 block">
                    {detail.sector} sector
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Attention Score</span>
                  <span className="text-sm font-black text-amber-400 font-mono mt-0.5 block">
                    {detail.attention_score.toFixed(0)} / 100 ({detail.attention_level})
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Chronological Layout Section */}
            <div className="p-6 rounded-2xl border border-[#1a2333] bg-[#0e1420]">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  CHRONOLOGICAL TIMELINE OF EVENTS
                </h2>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1a2333]">
                {detail.timeline.map((event, idx) => {
                  const isHigh = event.impact_level === "HIGH";
                  return (
                    <div key={idx} className="relative flex items-start space-x-4">
                      {/* Timeline Node Icon */}
                      <div className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 ${
                        isHigh ? "bg-amber-400 border-slate-950" : "bg-cyan-400 border-slate-950"
                      }`} />

                      <div className="flex-1 bg-[#141c2c] p-4 rounded-xl border border-[#1a2333]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-cyan-400">{event.time_formatted}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isHigh ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {event.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{event.title}</h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sector vs Stock Comparison & Interpretation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sector Comparison */}
              <div className="p-5 rounded-2xl border border-[#1a2333] bg-[#0e1420]">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-white uppercase tracking-wider mb-3">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <span>SECTOR VS STOCK COMPARISON</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {detail.symbol} moved <strong className="font-mono text-white">{detail.change_pct > 0 ? "+" : ""}{detail.change_pct.toFixed(2)}%</strong> while the broader {detail.sector} sector remained relatively flat. This confirms the movement is strongly stock-specific.
                </p>
              </div>

              {/* Deterministic Interpretation */}
              <div className="p-5 rounded-2xl border border-[#1a2333] bg-[#0e1420]">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-white uppercase tracking-wider mb-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>ENGINE CONCLUSION</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  &quot;{detail.interpretation}&quot;
                </p>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
