"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroAway } from "@/components/HeroAway";
import { ChangeCard } from "@/components/ChangeCard";
import { WhyModal } from "@/components/WhyModal";
import { ChangeStoryModal } from "@/components/ChangeStoryModal";
import { SectorStoryCard } from "@/components/SectorStoryCard";
import { SuppressedSection } from "@/components/SuppressedSection";
import { CatchUpModal } from "@/components/CatchUpModal";
import { DataQualityBanner } from "@/components/DataQualityBanner";
import { api, PulseResponse, ChangeEvent } from "@/lib/api";
import { RefreshCw, Zap, Layers, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pulse, setPulse] = useState<PulseResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [selectedChange, setSelectedChange] = useState<ChangeEvent | null>(null);
  const [selectedStoryChange, setSelectedStoryChange] = useState<ChangeEvent | null>(null);
  const [isCatchUpOpen, setIsCatchUpOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadPulseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPulse();
      setPulse(data);
    } catch (err: any) {
      console.error("Failed to load pulse:", err);
      setError(err.message || "Failed to load market pulse data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPulseData();
    }
  }, [user]);

  const handleMarkChecked = async () => {
    setIsChecking(true);
    try {
      await api.markChecked();
      await loadPulseData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-cyan-400 font-bold text-sm">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Initializing Market Pulse...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col">
      <Navbar onOpenCatchUp={() => setIsCatchUpOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm font-medium mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadPulseData}
              className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-xs font-bold rounded-lg text-white"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !pulse ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <span>Analyzing watchlist anomalies and calculating deterministic attention scores...</span>
          </div>
        ) : pulse ? (
          <>
            {/* Data Quality Warning */}
            <DataQualityBanner warning={pulse.data_quality_warning} />

            {/* Hero Away Banner */}
            <HeroAway
              hero={pulse.hero}
              onMarkChecked={handleMarkChecked}
              isChecking={isChecking}
            />

            {/* WHAT CHANGED Section */}
            <div className="space-y-6">
              
              {/* High Attention Feed */}
              {pulse.high_attention_changes.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                      HIGH ATTENTION ({pulse.high_attention_changes.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pulse.high_attention_changes.map((change) => (
                      <ChangeCard
                        key={change.stock_symbol}
                        change={change}
                        onInspectEvidence={setSelectedChange}
                        onViewStory={setSelectedStoryChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Attention Feed */}
              {pulse.medium_attention_changes.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                      WATCHLIST MOVEMENTS ({pulse.medium_attention_changes.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pulse.medium_attention_changes.map((change) => (
                      <ChangeCard
                        key={change.stock_symbol}
                        change={change}
                        onInspectEvidence={setSelectedChange}
                        onViewStory={setSelectedStoryChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Aggregated Sector Stories */}
              {pulse.sector_stories.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Layers className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                      SECTOR TREND AGGREGATION
                    </h2>
                  </div>

                  {pulse.sector_stories.map((story, i) => (
                    <SectorStoryCard key={i} story={story} />
                  ))}
                </div>
              )}

              {/* Suppressed Market Noise Section */}
              <SuppressedSection stocks={pulse.suppressed_stocks} />

            </div>
          </>
        ) : null}
      </main>

      {/* Why Am I Seeing This Modal */}
      <WhyModal
        change={selectedChange}
        onClose={() => setSelectedChange(null)}
      />

      {/* Change Story Narrative Modal */}
      <ChangeStoryModal
        change={selectedStoryChange}
        onClose={() => setSelectedStoryChange(null)}
      />

      {/* Catch Me Up Multi-day Modal */}
      <CatchUpModal
        isOpen={isCatchUpOpen}
        onClose={() => setIsCatchUpOpen(false)}
      />
    </div>
  );
}
