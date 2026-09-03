import React from 'react';
import { useFarm } from '../context/FarmContext';
import { executeWebMCPTool } from '../webmcp/registerWebMCP';
import { CloudRain, Sun, Thermometer, ShieldAlert } from 'lucide-react';

export const ClimateWidget: React.FC = () => {
  const { state, dispatch } = useFarm();
  const { climate } = state;

  const handleSimulateShock = async (
    anomalyType: 'late_spring_frost' | 'summer_heatwave' | 'flash_drought' | 'excess_rainfall'
  ) => {
    await executeWebMCPTool(
      'simulate_climate_shock',
      { anomalyType, severity: 'severe' },
      () => state,
      dispatch
    );
  };

  const currentMonthIdx = new Date().getMonth();
  const currentAvgTemp = climate.monthlyAvgTemp[currentMonthIdx];
  const currentRainfall = climate.monthlyRainfall[currentMonthIdx];

  return (
    <section id="climate-widget-section" className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Regional Microclimate & Frost Telemetry</span>
          </h2>
          <p className="text-xs text-stone-400">{climate.zoneName}</p>
        </div>

        {/* Quick Season Stats */}
        <div className="flex items-center gap-3 text-xs text-stone-300">
          <div className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span>Now: {currentAvgTemp}°C</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span>{currentRainfall} mm/mo</span>
          </div>
        </div>
      </div>

      {/* Frost Dates & Growing Season Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-stone-950/40 p-3 rounded-lg border border-stone-800/80 text-xs">
        <div>
          <p className="text-stone-400 text-[10px]">Last Spring Frost</p>
          <p className="font-semibold text-leaf-300 mt-0.5">{climate.lastFrostDate}</p>
          <span className="text-[10px] text-stone-500">Safe direct sowing begins</span>
        </div>
        <div>
          <p className="text-stone-400 text-[10px]">First Autumn Frost</p>
          <p className="font-semibold text-amber-300 mt-0.5">{climate.firstFrostDate}</p>
          <span className="text-[10px] text-stone-500">Harvest deadline for frost-tender</span>
        </div>
        <div>
          <p className="text-stone-400 text-[10px]">Growing Season Window</p>
          <p className="font-semibold text-sky-300 mt-0.5">{climate.growingSeasonDays} Days</p>
          <span className="text-[10px] text-stone-500">Thermal threshold &gt; 10°C</span>
        </div>
      </div>

      {/* Monthly Mini Temperature Graph */}
      <div>
        <p className="text-[11px] font-semibold text-stone-400 mb-2">
          Monthly Average Temperature Curve (°C)
        </p>
        <div className="grid grid-cols-12 gap-1 items-end h-16 pt-2">
          {climate.monthlyAvgTemp.map((temp, idx) => {
            const isCurrent = idx === currentMonthIdx;
            const heightPercent = Math.max(15, Math.min(100, (temp + 10) * 2.5));
            return (
              <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] text-stone-400">{temp}°</span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all ${
                    isCurrent
                      ? 'bg-amber-400 shadow-md shadow-amber-500/20'
                      : temp < 5
                      ? 'bg-sky-800'
                      : 'bg-stone-700'
                  }`}
                  title={`${temp}°C in month ${idx + 1}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Climate Stress Testing / Anomaly Trigger (Shows off WebMCP tool in action!) */}
      <div className="pt-2 border-t border-stone-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Agent Shock Simulation (WebMCP Stress Test):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSimulateShock('late_spring_frost')}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-sky-950 border border-stone-700 hover:border-sky-600 text-sky-300 text-[11px] font-medium transition flex items-center gap-1"
            >
              <span>❄️ Late Frost</span>
            </button>
            <button
              onClick={() => handleSimulateShock('summer_heatwave')}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-orange-950 border border-stone-700 hover:border-orange-600 text-orange-300 text-[11px] font-medium transition flex items-center gap-1"
            >
              <span>🔥 Heatwave</span>
            </button>
            <button
              onClick={() => handleSimulateShock('flash_drought')}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-amber-950 border border-stone-700 hover:border-amber-600 text-amber-300 text-[11px] font-medium transition flex items-center gap-1"
            >
              <span>🏜️ Drought</span>
            </button>
            <button
              onClick={() => handleSimulateShock('excess_rainfall')}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-blue-950 border border-stone-700 hover:border-blue-600 text-blue-300 text-[11px] font-medium transition flex items-center gap-1"
            >
              <span>🌊 Torrential Rain</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
