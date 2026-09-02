import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { CROPS } from '../data/crops';
import { Parcel } from '../types';
import {
  Droplets,
  FlaskConical,
  Sprout,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface FarmGridProps {
  onOpenCarePlan: (parcel: Parcel) => void;
}

export const FarmGrid: React.FC<FarmGridProps> = ({ onOpenCarePlan }) => {
  const { state, dispatch } = useFarm();
  const [plantingParcelId, setPlantingParcelId] = useState<string | null>(null);

  const handleClear = (parcelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLEAR_PARCEL', parcelId });
  };

  const handleSelectCrop = (parcelId: string, cropId: string) => {
    const crop = CROPS[cropId];
    if (!crop) return;

    const today = new Date();
    const harvestDate = new Date(today);
    harvestDate.setDate(harvestDate.getDate() + crop.daysToHarvest);

    dispatch({
      type: 'UPDATE_PARCEL',
      parcelId,
      updates: {
        currentCrop: cropId,
        sowingDate: today.toISOString().split('T')[0],
        harvestDate: harvestDate.toISOString().split('T')[0],
        cultivationPhase: 'sowing',
        suitabilityScore: 88, // estimated default until agent analyzes
      },
    });
    setPlantingParcelId(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🌾</span> Interactive Farm Parcels
          </h2>
          <p className="text-xs text-stone-400">
            Real-time soil metrics, crop allocation, and AI agent manipulation canvas
          </p>
        </div>
        <div className="text-xs text-stone-400">
          Total Area: <span className="text-leaf-400 font-semibold">11,800 m²</span> across 6 plots
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.parcels.map((parcel) => {
          const crop = parcel.currentCrop ? CROPS[parcel.currentCrop] : null;
          const isSelected = state.selectedParcelId === parcel.id;
          const isPlanting = plantingParcelId === parcel.id;

          return (
            <div
              key={parcel.id}
              onClick={() => dispatch({ type: 'SELECT_PARCEL', parcelId: parcel.id })}
              className={`relative rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-leaf-500 bg-stone-900/95 ring-2 ring-leaf-500/20 shadow-xl'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 hover:bg-stone-900/80'
              }`}
            >
              {/* Parcel Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-stone-100 text-sm flex items-center gap-1.5">
                      {parcel.name}
                    </h3>
                    <span className="text-[11px] text-stone-500">{parcel.sizeSqM.toLocaleString()} m²</span>
                  </div>

                  {/* Status / Score Tag */}
                  {parcel.suitabilityScore !== null ? (
                    <div
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                        parcel.suitabilityScore >= 80
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : parcel.suitabilityScore >= 50
                          ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                          : 'bg-red-950/80 border-red-700 text-red-300'
                      }`}
                      title={parcel.suitabilityDetails?.recommendation || 'Suitability score'}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{parcel.suitabilityScore}% Match</span>
                    </div>
                  ) : crop ? (
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-[11px] text-stone-300 font-medium">
                      Planted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-800/60 border border-stone-700/40 text-[11px] text-stone-400">
                      Fallow
                    </span>
                  )}
                </div>

                {/* Risk Alert Banner */}
                {parcel.riskBadge && (
                  <div
                    className={`mb-3 p-2 rounded-lg text-xs flex items-start gap-1.5 border ${
                      parcel.riskBadge.level === 'danger'
                        ? 'bg-red-950/90 border-red-800 text-red-200'
                        : parcel.riskBadge.level === 'caution'
                        ? 'bg-amber-950/90 border-amber-800 text-amber-200'
                        : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{parcel.riskBadge.message}</span>
                  </div>
                )}

                {/* Planted Crop Information */}
                {crop ? (
                  <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <p className="font-semibold text-xs text-white leading-snug">{crop.name}</p>
                          <p className="text-[10px] text-leaf-400 capitalize font-medium">
                            Phase: {parcel.cultivationPhase || 'vegetative'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-stone-400">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          <span>Harvest: {parcel.harvestDate || 'Estimated'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-stone-800 rounded-lg p-3 text-center mb-3 text-stone-500 text-xs">
                    {isPlanting ? (
                      <div className="space-y-2">
                        <p className="text-stone-300 font-medium text-[11px]">Select crop to plant:</p>
                        <div className="grid grid-cols-4 gap-1">
                          {Object.values(CROPS).map((c) => (
                            <button
                              key={c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCrop(parcel.id, c.id);
                              }}
                              className="p-1.5 rounded bg-stone-800 hover:bg-leaf-800/50 border border-stone-700 hover:border-leaf-500 flex flex-col items-center gap-0.5 transition"
                              title={c.name}
                            >
                              <span className="text-base">{c.emoji}</span>
                              <span className="text-[9px] text-stone-300 truncate w-full text-center">
                                {c.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlantingParcelId(null);
                          }}
                          className="text-[10px] text-stone-400 hover:text-stone-200 underline pt-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Sprout className="w-5 h-5 mx-auto mb-1 text-stone-600" />
                        <span>Ready for cultivation</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Soil Telemetry Gauges */}
                <div className="grid grid-cols-3 gap-2 bg-stone-950/40 p-2 rounded-lg border border-stone-800/80 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <FlaskConical className="w-3 h-3 text-purple-400" />
                      <span>Soil pH</span>
                    </div>
                    <p className="font-semibold text-stone-200 text-xs mt-0.5">{parcel.soil.ph.toFixed(1)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Droplets className="w-3 h-3 text-sky-400" />
                      <span>Moisture</span>
                    </div>
                    <p className="font-semibold text-stone-200 text-xs mt-0.5">{parcel.soil.moisturePercent}%</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Nitrogen</span>
                    </div>
                    <p className="font-semibold text-stone-200 text-xs mt-0.5 capitalize">
                      {parcel.soil.nitrogenLevel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                {crop ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCarePlan(parcel);
                      }}
                      className="flex items-center gap-1 text-leaf-400 hover:text-leaf-300 font-medium text-[11px]"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Care Schedule</span>
                    </button>
                    <button
                      onClick={(e) => handleClear(parcel.id, e)}
                      className="text-stone-500 hover:text-red-400 transition"
                      title="Clear planted crop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : !isPlanting ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlantingParcelId(parcel.id);
                    }}
                    className="w-full py-1 text-center rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-[11px] transition"
                  >
                    + Plant Crop
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
