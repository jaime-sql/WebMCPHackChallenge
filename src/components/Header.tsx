import React from 'react';
import { useFarm } from '../context/FarmContext';
import { CLIMATE_ZONES } from '../data/climate';
import { Sprout, Bot, ShieldAlert, CloudSun, Compass } from 'lucide-react';

interface HeaderProps {
  onToggleSimulator: () => void;
  simulatorOpen: boolean;
  hasNativeWebMCP: boolean;
  onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSimulator,
  simulatorOpen,
  hasNativeWebMCP,
  onStartTour,
}) => {
  const { state, dispatch } = useFarm();

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_CLIMATE_ZONE', zone: e.target.value });
  };

  const handleResetShocks = () => {
    dispatch({ type: 'RESET_ALL_SHOCKS' });
  };

  return (
    <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center shadow-lg shadow-leaf-900/40">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                AgriMCP
                <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-leaf-500/20 text-leaf-400 border border-leaf-500/30">
                  v1.0 Standard
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400">
              Agent-Native Precision Cultivation Canvas with WebMCP Integration
            </p>
          </div>
        </div>

        {/* Climate Zone & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Shock Banner */}
          {state.activeShock && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/60 text-red-300 text-xs animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">
                Active Shock: {state.activeShock.anomalyType.replace(/_/g, ' ')}
              </span>
              <button
                onClick={handleResetShocks}
                className="ml-1 hover:text-white underline text-[11px]"
                title="Dismiss simulated anomaly"
              >
                Clear
              </button>
            </div>
          )}

          {/* Climate Zone Selector */}
          <div className="flex items-center gap-2 bg-stone-800/80 border border-stone-700/60 rounded-lg px-2.5 py-1.5 text-xs">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <select
              value={state.selectedZone}
              onChange={handleZoneChange}
              className="bg-transparent text-stone-200 outline-none cursor-pointer font-medium"
              title="Select Regional Microclimate Zone"
            >
              {Object.entries(CLIMATE_ZONES).map(([key, zone]) => (
                <option key={key} value={key} className="bg-stone-900 text-stone-200">
                  {zone.zoneName}
                </option>
              ))}
            </select>
          </div>

          {/* WebMCP Status Tag */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
              hasNativeWebMCP
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-sky-950/60 border-sky-700/60 text-sky-300'
            }`}
            title={
              hasNativeWebMCP
                ? 'Native document.modelContext registered'
                : 'Universal dual-mode: Ready for Chrome WebMCP flag & in-app agent simulator'
            }
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{hasNativeWebMCP ? 'WebMCP Native' : 'WebMCP Dual-Mode'}</span>
          </div>

          {/* Tour Button */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-medium text-xs transition shadow-sm"
              title="Interactive Tour of AgriMCP"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tour</span>
            </button>
          )}

          {/* Toggle Agent Simulator Drawer */}
          <button
            id="agent-console-btn"
            onClick={onToggleSimulator}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all shadow-md ${
              simulatorOpen
                ? 'bg-leaf-600 text-white shadow-leaf-900/50'
                : 'bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200'
            }`}
          >
            <Bot className="w-4 h-4 text-leaf-400" />
            <span>Agent Console</span>
            {state.executionLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-leaf-500/40 text-white text-[10px]">
                {state.executionLogs.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
