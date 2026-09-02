import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FarmState, FarmAction } from '../types';
import { INITIAL_PARCELS } from '../data/parcels';
import { CLIMATE_ZONES } from '../data/climate';

const initialState: FarmState = {
  parcels: INITIAL_PARCELS,
  selectedZone: '8b',
  climate: CLIMATE_ZONES['8b'],
  executionLogs: [],
  activeShock: null,
  selectedParcelId: 'plot-alpha',
};

function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case 'UPDATE_PARCEL': {
      return {
        ...state,
        parcels: state.parcels.map((parcel) =>
          parcel.id === action.parcelId ? { ...parcel, ...action.updates } : parcel
        ),
      };
    }

    case 'SET_CLIMATE_ZONE': {
      const newZone = CLIMATE_ZONES[action.zone] || state.climate;
      return {
        ...state,
        selectedZone: action.zone,
        climate: newZone,
      };
    }

    case 'ADD_EXECUTION_LOG': {
      return {
        ...state,
        executionLogs: [action.log, ...state.executionLogs].slice(0, 50),
      };
    }

    case 'SET_ACTIVE_SHOCK': {
      const shock = action.shock;
      if (!shock) {
        return {
          ...state,
          activeShock: null,
          parcels: state.parcels.map((p) => ({ ...p, riskBadge: null })),
        };
      }

      // Update parcels with risk badges from the shock
      const updatedParcels = state.parcels.map((parcel) => {
        const affected = shock.affectedParcels.find((ap) => ap.parcelId === parcel.id);
        if (affected) {
          return {
            ...parcel,
            riskBadge: {
              level: affected.riskLevel,
              message: `${affected.yieldImpact}% yield risk: ${affected.recommendation}`,
            },
          };
        }
        return parcel;
      });

      return {
        ...state,
        activeShock: shock,
        parcels: updatedParcels,
      };
    }

    case 'CLEAR_PARCEL': {
      return {
        ...state,
        parcels: state.parcels.map((parcel) =>
          parcel.id === action.parcelId
            ? {
                ...parcel,
                currentCrop: null,
                sowingDate: null,
                harvestDate: null,
                cultivationPhase: null,
                suitabilityScore: null,
                suitabilityDetails: null,
                carePlan: null,
                riskBadge: null,
              }
            : parcel
        ),
      };
    }

    case 'RESET_ALL_SHOCKS': {
      return {
        ...state,
        activeShock: null,
        parcels: state.parcels.map((p) => ({ ...p, riskBadge: null })),
      };
    }

    case 'SELECT_PARCEL': {
      return {
        ...state,
        selectedParcelId: action.parcelId,
      };
    }

    default:
      return state;
  }
}

interface FarmContextType {
  state: FarmState;
  dispatch: React.Dispatch<FarmAction>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  return <FarmContext.Provider value={{ state, dispatch }}>{children}</FarmContext.Provider>;
};

export function useFarm(): FarmContextType {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
