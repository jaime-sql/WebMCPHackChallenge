import React from 'react';
import { Parcel } from '../types';
import { CROPS } from '../data/crops';
import { X, Calendar, ClipboardCheck } from 'lucide-react';

interface CarePlanModalProps {
  parcel: Parcel | null;
  onClose: () => void;
}

export const CarePlanModal: React.FC<CarePlanModalProps> = ({ parcel, onClose }) => {
  if (!parcel || !parcel.currentCrop) return null;

  const crop = CROPS[parcel.currentCrop];
  const carePlan = parcel.carePlan || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{crop?.emoji}</span>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {parcel.name} — Care Schedule
              </h3>
              <p className="text-xs text-stone-400">
                {crop?.name} • 12-Week Operational Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs bg-stone-950/50 p-3 rounded-xl border border-stone-800">
            <div>
              <span className="text-stone-400 block text-[10px]">Sowing Date</span>
              <span className="font-semibold text-leaf-300">{parcel.sowingDate || 'Not set'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Expected Harvest</span>
              <span className="font-semibold text-amber-300">{parcel.harvestDate || 'Not set'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Current Phase</span>
              <span className="font-semibold text-sky-300 capitalize">
                {parcel.cultivationPhase || 'Vegetative'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-leaf-400" />
              <span>Milestone Action Checklist</span>
            </h4>

            {carePlan.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No care plan generated yet. Trigger WebMCP tool `generate_harvest_and_care_plan` in the Agent Console.
              </p>
            ) : (
              carePlan.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 hover:border-stone-700 transition"
                >
                  <div className="text-xl shrink-0 p-1 rounded-lg bg-stone-800/80">
                    {entry.icon}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-200">
                        Week {entry.week}: {entry.activity}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                        Week {entry.week}
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px] leading-relaxed">{entry.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <ClipboardCheck className="w-3.5 h-3.5 text-leaf-500" />
            <span>Agent WebMCP protocol compliant</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-leaf-600 hover:bg-leaf-500 text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
