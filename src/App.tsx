import React, { useState, useEffect } from 'react';
import { useFarm } from './context/FarmContext';
import { registerWebMCPTools } from './webmcp/registerWebMCP';
import { Header } from './components/Header';
import { FarmGrid } from './components/FarmGrid';
import { CultivationTimeline } from './components/CultivationTimeline';
import { ClimateWidget } from './components/ClimateWidget';
import { CarePlanModal } from './components/CarePlanModal';
import { AgentSimulator } from './components/AgentSimulator';
import { Parcel } from './types';
import { startProductTour } from './utils/tour';
import { Bot, Sparkles, BookOpen, Compass } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { state, dispatch } = useFarm();
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [carePlanParcel, setCarePlanParcel] = useState<Parcel | null>(null);
  const [hasNativeWebMCP, setHasNativeWebMCP] = useState(false);

  useEffect(() => {
    // Register WebMCP tools with native browser if available
    const registered = registerWebMCPTools(() => state, dispatch);
    setHasNativeWebMCP(registered);

    // Initial default test crops on 2 parcels so the timeline looks alive on first launch
    if (!state.parcels[0].currentCrop) {
      dispatch({
        type: 'UPDATE_PARCEL',
        parcelId: 'plot-alpha',
        updates: {
          currentCrop: 'tomato',
          sowingDate: '2026-04-10',
          harvestDate: '2026-07-05',
          cultivationPhase: 'vegetative',
          suitabilityScore: 92,
        },
      });
    }

    if (!state.parcels[3].currentCrop) {
      dispatch({
        type: 'UPDATE_PARCEL',
        parcelId: 'plot-delta',
        updates: {
          currentCrop: 'corn',
          sowingDate: '2026-04-25',
          harvestDate: '2026-07-30',
          cultivationPhase: 'sowing',
          suitabilityScore: 86,
        },
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      {/* Top Navbar */}
      <Header
        onToggleSimulator={() => setSimulatorOpen((prev) => !prev)}
        simulatorOpen={simulatorOpen}
        hasNativeWebMCP={hasNativeWebMCP}
        onStartTour={() => startProductTour(() => setSimulatorOpen(true))}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Hackathon Judge Hero Banner */}
        <div id="hero-banner" className="p-4 rounded-2xl bg-gradient-to-r from-leaf-950/70 via-stone-900 to-stone-900 border border-leaf-800/40 relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-leaf-500/20 text-leaf-300 border border-leaf-500/30">
                  The WebMCP Challenge
                </span>
                <span className="text-xs text-stone-400">Devpost Submission</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Where Farmers and AI Agents Co-Pilot the Future of Agriculture
              </h2>
              <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                Instead of leaving AI agents to scrape DOM elements or hallucinate farming dates in a chat box,{' '}
                <strong className="text-leaf-300">AgriMCP</strong> exposes structured agronomic tools directly to the browser session via{' '}
                <code className="text-leaf-400 font-mono text-[11px] bg-stone-950 px-1.5 py-0.5 rounded">
                  document.modelContext.registerTool()
                </code>
                . Agents calculate optimal GDD windows, simulate late frosts, and place companion crops right on your visual field map.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => startProductTour(() => setSimulatorOpen(true))}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Interactive Tour</span>
              </button>
              <button
                onClick={() => setSimulatorOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-leaf-600 to-leaf-500 hover:from-leaf-500 hover:to-leaf-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-leaf-900/40 transition transform active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Open Agent Console</span>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </button>
            </div>
          </div>
        </div>

        {/* Farm Grid */}
        <FarmGrid onOpenCarePlan={(parcel) => setCarePlanParcel(parcel)} />

        {/* Cultivation Timeline */}
        <CultivationTimeline />

        {/* Climate & Weather Widget */}
        <ClimateWidget />
      </main>

      {/* Floating Action Button to trigger Agent Console on Mobile / Small screens */}
      {!simulatorOpen && (
        <button
          onClick={() => setSimulatorOpen(true)}
          className="fixed bottom-5 right-5 z-30 p-3.5 rounded-full bg-gradient-to-r from-leaf-600 to-leaf-500 hover:from-leaf-500 hover:to-leaf-400 text-white shadow-2xl shadow-leaf-900 flex items-center gap-2 font-semibold text-xs border border-leaf-400/40 transition transform hover:scale-105 active:scale-95"
          title="Open Agent Console"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">WebMCP Agent</span>
        </button>
      )}

      {/* Care Plan Modal */}
      <CarePlanModal parcel={carePlanParcel} onClose={() => setCarePlanParcel(null)} />

      {/* Agent Simulator Console */}
      <AgentSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        hasNativeWebMCP={hasNativeWebMCP}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-6 px-4 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span className="font-medium text-stone-400">AgriMCP</span>
            <span>— Open Source under MIT License</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <a
              href="https://webmachinelearning.github.io/webmcp/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-leaf-400 flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>WebMCP Specification</span>
            </a>
            <a
              href="https://developer.chrome.com/docs/ai/webmcp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-leaf-400 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chrome Documentation</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppContent;
