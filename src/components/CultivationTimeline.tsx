import React from 'react';
import { useFarm } from '../context/FarmContext';
import { CROPS } from '../data/crops';
import { Calendar, Sprout } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CultivationTimeline: React.FC = () => {
  const { state } = useFarm();
  const currentMonthIdx = new Date().getMonth();

  const plantedParcels = state.parcels.filter((p) => p.currentCrop && p.sowingDate);

  return (
    <section id="cultivation-timeline-section" className="bg-stone-900/70 border border-stone-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-leaf-400" />
            <span>Seasonal Cultivation & Harvest Timeline</span>
          </h2>
          <p className="text-xs text-stone-400">
            Gantt visualizer tracking biological phases from germination to peak yield
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sowing/Germination
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Vegetative/Flowering
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Peak Harvest
          </span>
        </div>
      </div>

      {/* Months Grid Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-12 gap-1 pb-2 border-b border-stone-800 text-center text-xs font-semibold">
            {MONTHS.map((month, idx) => {
              const isCurrent = idx === currentMonthIdx;
              return (
                <div
                  key={month}
                  className={`py-1 rounded ${
                    isCurrent
                      ? 'bg-leaf-600/30 text-leaf-300 border border-leaf-500/40'
                      : 'text-stone-400'
                  }`}
                >
                  {month}
                  {isCurrent && <span className="block text-[9px] font-normal">Current</span>}
                </div>
              );
            })}
          </div>

          {/* Planted Parcels Gantt Bars */}
          <div className="divide-y divide-stone-800/60 mt-2">
            {plantedParcels.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                <Sprout className="w-6 h-6 text-stone-600" />
                <p>No crops currently scheduled on the cultivation timeline.</p>
                <p className="text-[11px] text-stone-400">
                  Use the <span className="text-leaf-400">Agent Console</span> or click "+ Plant Crop" on any parcel card above.
                </p>
              </div>
            ) : (
              plantedParcels.map((parcel) => {
                const crop = CROPS[parcel.currentCrop!];
                if (!crop) return null;

                const sowMonth = parcel.sowingDate ? new Date(parcel.sowingDate).getMonth() : 3;
                const durationMonths = Math.max(1, Math.min(10, Math.round(crop.daysToHarvest / 30)));

                // Calculate left and width percentage on 12-month track
                const leftPercent = (sowMonth / 12) * 100;
                const widthPercent = (durationMonths / 12) * 100;

                return (
                  <div key={parcel.id} className="py-2.5 flex items-center gap-3">
                    {/* Parcel Name Label */}
                    <div className="w-48 shrink-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{crop.emoji}</span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-stone-200 truncate">{parcel.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {crop.name} • {crop.daysToHarvest}d cycle
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar Track */}
                    <div className="flex-1 h-8 bg-stone-950/60 rounded-lg relative overflow-hidden border border-stone-800/80">
                      {/* Sub-grid lines for each month */}
                      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className={`border-r border-stone-800/40 ${
                              i === currentMonthIdx ? 'bg-leaf-950/20' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Cultivation Phase Gantt Bar */}
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.min(100 - leftPercent, Math.max(8, widthPercent))}%`,
                        }}
                        className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-emerald-600 via-sky-600 to-amber-600 p-1 flex items-center justify-between text-white text-[10px] font-semibold shadow-md truncate px-2"
                        title={`${crop.name}: Sown ~${parcel.sowingDate}, Expected Harvest ~${parcel.harvestDate}`}
                      >
                        <span className="truncate">
                          {crop.name} ({parcel.cultivationPhase || 'Growing'})
                        </span>
                        <span className="shrink-0 text-[9px] opacity-90">Harvest {parcel.harvestDate?.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
