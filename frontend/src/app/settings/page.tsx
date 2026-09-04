"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, SignalPreferences } from "@/lib/api";
import { Sliders, Save, CheckCircle2, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<SignalPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getSignalPreferences()
      .then(setPrefs)
      .catch((err) => setError(err.message || "Failed to load preferences"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof SignalPreferences) => {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      [key]: !prefs[key],
    });
  };

  const handleSensitivityChange = (val: number) => {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      sensitivity: val,
    });
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setSavedSuccess(false);
    setError(null);
    try {
      await api.updateSignalPreferences(prefs);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">MY SIGNALS & SENSITIVITY</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Configure which anomaly detectors trigger high attention cards and adjust global detection threshold sensitivity.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold mb-6 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Preferences saved successfully! Attention engine re-calibrated.</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <span>Loading your signal threshold configuration...</span>
          </div>
        ) : prefs ? (
          <div className="space-y-6">
            
            {/* Global Sensitivity Slider Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-white">ATTENTION SENSITIVITY MULTIPLIER</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust how strictly the engine filters out minor price and volume variations.
                  </p>
                </div>
                <span className="text-xl font-black text-cyan-400 bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-800">
                  {prefs.sensitivity.toFixed(1)}×
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={prefs.sensitivity}
                onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">
                <span>0.5× (Conservative — Only Extreme Alerts)</span>
                <span>1.0× (Balanced Standard)</span>
                <span>2.0× (Aggressive — Sensitive)</span>
              </div>
            </div>

            {/* Individual Anomaly Toggles Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white mb-4">ACTIVE ANOMALY DETECTORS</h2>

              {[
                { key: "price_anomaly_enabled", label: "Price Anomaly Detector", desc: "Flag price changes > 2.0 standard deviations beyond historical daily baseline." },
                { key: "volume_anomaly_enabled", label: "Volume Surge Detector", desc: "Flag trading volume exceeding 1.5× 30-day average volume." },
                { key: "sector_divergence_enabled", label: "Sector Underperformance / Outperformance", desc: "Highlight stocks diverging from their broader sector ETF performance." },
                { key: "news_enabled", label: "Corporate Announcements & Press Releases", desc: "Incorporate material exchange announcements into attention scoring." },
                { key: "market_divergence_enabled", label: "Broad Market Benchmark Divergence", desc: "Detect stock divergence relative to NIFTY 50 benchmark." },
                { key: "dividend_enabled", label: "Dividend Ex-Dates & Corporate Actions", desc: "Flag upcoming dividend ex-dates and stock splits." },
                { key: "analyst_change_enabled", label: "Analyst Target Changes", desc: "Include broker consensus rating changes." },
              ].map((item) => {
                const k = item.key as keyof SignalPreferences;
                const isChecked = Boolean(prefs[k]);
                return (
                  <div key={item.key} className="flex items-start justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.label}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(k)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isChecked ? "bg-cyan-500" : "bg-slate-800"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isChecked ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving Preferences..." : "Save Personal Signals"}</span>
              </button>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
