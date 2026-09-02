// Crop data model
export interface CropProfile {
  id: string;
  name: string;
  emoji: string;
  category: 'fruit' | 'vegetable' | 'grain' | 'vine';
  optimalPH: { min: number; max: number };
  moistureNeed: 'low' | 'moderate' | 'high';
  moisturePercent: { min: number; max: number };
  npk: { n: 'low' | 'moderate' | 'high'; p: 'low' | 'moderate' | 'high'; k: 'low' | 'moderate' | 'high' };
  gddToMaturity: number; // Growing Degree Days
  baseTemp: number; // °C, base temperature for GDD calculation
  minGerminationTemp: number; // °C
  frostToleranceThreshold: number; // °C, dies below this
  sowingMonths: number[]; // 1-12
  harvestMonths: number[]; // 1-12
  daysToGermination: number;
  daysToFlowering: number;
  daysToHarvest: number;
  companionCrops: string[]; // crop ids
  antagonisticCrops: string[]; // crop ids
  wateringFrequency: string;
  description: string;
}

// Cultivation phase model
export type CultivationPhase = 'sowing' | 'germination' | 'vegetative' | 'flowering' | 'harvest';

export interface CarePlanEntry {
  week: number;
  activity: string;
  details: string;
  icon: string;
}

export interface SuitabilityDetails {
  overallScore: number;
  phMatch: number;
  moistureMatch: number;
  frostRisk: number; // 0 = no risk, 100 = certain frost kill
  gddSufficiency: number;
  recommendation: string;
}

// Farm parcel model
export interface Parcel {
  id: string;
  name: string;
  sizeSqM: number;
  soil: {
    ph: number;
    moisturePercent: number;
    nitrogenLevel: 'low' | 'moderate' | 'high';
    organicMatter: number; // percent
  };
  currentCrop: string | null; // crop id
  sowingDate: string | null;
  harvestDate: string | null;
  cultivationPhase: CultivationPhase | null;
  suitabilityScore: number | null;
  suitabilityDetails: SuitabilityDetails | null;
  carePlan: CarePlanEntry[] | null;
  riskBadge?: {
    level: 'safe' | 'caution' | 'danger';
    message: string;
  } | null;
}

// Climate profile
export interface ClimateProfile {
  zone: string;
  zoneName: string;
  monthlyAvgTemp: number[]; // 12 months, °C
  monthlyMinTemp: number[];
  monthlyMaxTemp: number[];
  monthlyRainfall: number[]; // mm
  monthlySunlightHours: number[];
  lastFrostDate: string; // e.g. 'March 15'
  firstFrostDate: string;
  growingSeasonDays: number;
}

// Climate shock simulation result
export interface ClimateShockResult {
  anomalyType: string;
  severity: string;
  affectedParcels: {
    parcelId: string;
    cropName: string;
    riskLevel: 'safe' | 'caution' | 'danger';
    yieldImpact: number; // percentage loss (0-100)
    recommendation: string;
  }[];
  summary: string;
  timestamp: string;
}

// Companion planting suggestions
export interface CompanionPlantingResult {
  targetParcel: string;
  targetCrop: string;
  suggestions: {
    companionCropId: string;
    companionCropName: string;
    benefit: string;
    suggestedParcel: string;
  }[];
  warnings: string[];
}

// WebMCP Tool Execution Log
export interface ToolExecutionLog {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  timestamp: Date;
  durationMs: number;
}

// Global Farm State
export interface FarmState {
  parcels: Parcel[];
  selectedZone: string;
  climate: ClimateProfile;
  executionLogs: ToolExecutionLog[];
  activeShock: ClimateShockResult | null;
  selectedParcelId: string | null;
}

export type FarmAction =
  | { type: 'UPDATE_PARCEL'; parcelId: string; updates: Partial<Parcel> }
  | { type: 'SET_CLIMATE_ZONE'; zone: string }
  | { type: 'ADD_EXECUTION_LOG'; log: ToolExecutionLog }
  | { type: 'SET_ACTIVE_SHOCK'; shock: ClimateShockResult | null }
  | { type: 'CLEAR_PARCEL'; parcelId: string }
  | { type: 'RESET_ALL_SHOCKS' }
  | { type: 'SELECT_PARCEL'; parcelId: string | null };
