import {
  CropProfile,
  Parcel,
  ClimateProfile,
  SuitabilityDetails,
  CultivationPhase,
  ClimateShockResult,
  CompanionPlantingResult,
  CarePlanEntry,
} from '../types';
import { CROPS } from '../data/crops';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[Math.max(0, Math.min(11, month - 1))];
}

/**
 * Calculates Growing Degree Days (GDD) accumulated over a span of months
 * Formula: GDD = sum(max(0, avgDailyTemp - baseTemp) * 30 days)
 */
export function calculateGDD(
  climate: ClimateProfile,
  baseTemp: number,
  startMonth: number, // 1-12
  monthsToGrow: number
): number {
  let totalGDD = 0;
  for (let i = 0; i < monthsToGrow; i++) {
    const monthIndex = (startMonth - 1 + i) % 12;
    const avgTemp = climate.monthlyAvgTemp[monthIndex];
    const dailyGDD = Math.max(0, avgTemp - baseTemp);
    totalGDD += dailyGDD * 30; // Approx 30 days per month
  }
  return Math.round(totalGDD);
}

/**
 * Determines current cultivation phase based on elapsed days since sowing
 */
export function getPhaseForDay(crop: CropProfile, daysSinceSowing: number): CultivationPhase {
  if (daysSinceSowing < crop.daysToGermination) {
    return 'germination';
  } else if (daysSinceSowing < crop.daysToFlowering) {
    return 'vegetative';
  } else if (daysSinceSowing < crop.daysToHarvest) {
    return 'flowering';
  } else {
    return 'harvest';
  }
}

/**
 * Comprehensive Suitability Analysis for a specific crop, parcel, and climate zone
 */
export function calculateSuitability(
  crop: CropProfile,
  parcel: Parcel,
  climate: ClimateProfile,
  targetMonth: number // 1-12
): SuitabilityDetails {
  const monthIdx = (targetMonth - 1) % 12;

  // 1. pH Matching (Optimal: 100%, 0% if deviation > 1.5)
  const soilPH = parcel.soil.ph;
  let phMatch = 100;
  if (soilPH < crop.optimalPH.min) {
    const diff = crop.optimalPH.min - soilPH;
    phMatch = Math.max(0, Math.round(100 - (diff / 1.5) * 100));
  } else if (soilPH > crop.optimalPH.max) {
    const diff = soilPH - crop.optimalPH.max;
    phMatch = Math.max(0, Math.round(100 - (diff / 1.5) * 100));
  }

  // 2. Moisture Compatibility
  const currentMoisture = parcel.soil.moisturePercent;
  let moistureMatch = 100;
  if (currentMoisture < crop.moisturePercent.min) {
    const diff = crop.moisturePercent.min - currentMoisture;
    moistureMatch = Math.max(0, Math.round(100 - (diff / 30) * 100));
  } else if (currentMoisture > crop.moisturePercent.max) {
    const diff = currentMoisture - crop.moisturePercent.max;
    moistureMatch = Math.max(0, Math.round(100 - (diff / 30) * 100));
  }

  // 3. Frost Risk Calculation
  // Assess minimum temperatures during germination and early vegetative period
  const minTempAtSow = climate.monthlyMinTemp[monthIdx];
  const nextMonthMinTemp = climate.monthlyMinTemp[(monthIdx + 1) % 12];
  const lowestEarlyTemp = Math.min(minTempAtSow, nextMonthMinTemp);

  let frostRisk = 0;
  if (lowestEarlyTemp <= crop.frostToleranceThreshold) {
    frostRisk = 95; // Extreme danger
  } else if (lowestEarlyTemp <= crop.frostToleranceThreshold + 3) {
    frostRisk = 65; // High caution
  } else if (lowestEarlyTemp <= crop.frostToleranceThreshold + 6) {
    frostRisk = 25; // Slight chill risk
  } else {
    frostRisk = 0; // Completely safe
  }

  // 4. Growing Degree Day (GDD) Sufficiency
  const estimatedMonths = Math.ceil(crop.daysToHarvest / 30);
  const projectedGDD = calculateGDD(climate, crop.baseTemp, targetMonth, estimatedMonths);
  const gddSufficiency = Math.min(100, Math.round((projectedGDD / crop.gddToMaturity) * 100));

  // 5. Nitrogen match penalty/bonus
  let nitrogenAdjustment = 0;
  if (crop.npk.n === 'high' && parcel.soil.nitrogenLevel === 'low') {
    nitrogenAdjustment = -15;
  } else if (crop.npk.n === 'low' && parcel.soil.nitrogenLevel === 'high') {
    nitrogenAdjustment = -10; // High N can cause leafy growth without fruit
  }

  // Weighted overall score
  const rawScore =
    phMatch * 0.25 +
    moistureMatch * 0.20 +
    (100 - frostRisk) * 0.30 +
    gddSufficiency * 0.25 +
    nitrogenAdjustment;

  const overallScore = Math.max(5, Math.min(100, Math.round(rawScore)));

  // Recommendation synthesis
  let recommendation = '';
  if (overallScore >= 85) {
    recommendation = `Optimal cultivation window! Excellent thermal accumulation (${projectedGDD} GDD) and ideal soil pH (${soilPH}).`;
  } else if (overallScore >= 70) {
    recommendation = `Favorable conditions for planting in ${getMonthName(targetMonth)}. Monitor soil moisture and prepare for light mulch.`;
  } else if (overallScore >= 50) {
    if (frostRisk > 50) {
      recommendation = `High frost risk! Delay sowing by 2-3 weeks or utilize protective row covers/cloches.`;
    } else if (phMatch < 60) {
      recommendation = `Soil pH (${soilPH}) is suboptimal for ${crop.name} (target ${crop.optimalPH.min}-${crop.optimalPH.max}). Amend with lime or sulfur prior to sowing.`;
    } else {
      recommendation = `Marginal conditions. Thermal accumulation (${projectedGDD} GDD) is slightly behind the ideal ${crop.gddToMaturity} GDD.`;
    }
  } else {
    recommendation = `Unfavorable window for ${crop.name}. Substantial risk of crop failure due to ${frostRisk > 50 ? 'frost damage' : 'GDD deficit and soil mismatch'}.`;
  }

  return {
    overallScore,
    phMatch,
    moistureMatch,
    frostRisk,
    gddSufficiency,
    recommendation,
  };
}

/**
 * Simulates extreme climate shocks and calculates parcel vulnerability & yield penalties
 */
export function simulateClimateShock(
  anomalyType: string,
  severity: string,
  parcels: Parcel[],
  _climate: ClimateProfile
): ClimateShockResult {
  const isSevere = severity === 'severe';
  const affectedParcels: ClimateShockResult['affectedParcels'] = [];

  parcels.forEach((parcel) => {
    if (!parcel.currentCrop) return;

    const crop = CROPS[parcel.currentCrop];
    if (!crop) return;

    const isGreenhouse = parcel.id.includes('greenhouse');
    let riskLevel: 'safe' | 'caution' | 'danger' = 'safe';
    let yieldImpact = 0;
    let recommendation = '';

    switch (anomalyType) {
      case 'late_spring_frost':
        if (isGreenhouse) {
          riskLevel = 'safe';
          yieldImpact = 0;
          recommendation = 'Protected by climate-controlled dome. No frost damage detected.';
        } else if (crop.frostToleranceThreshold >= 0) {
          riskLevel = 'danger';
          yieldImpact = isSevere ? 75 : 45;
          recommendation = 'Immediate thermal blanket deployment required. Consider emergency smudge pots or sprinkler icing.';
        } else if (crop.frostToleranceThreshold >= -4) {
          riskLevel = isSevere ? 'caution' : 'safe';
          yieldImpact = isSevere ? 25 : 5;
          recommendation = 'Cold-hardy crop may experience superficial foliage scorch, but crown will survive.';
        } else {
          riskLevel = 'safe';
          yieldImpact = 0;
          recommendation = 'Fully cold-resilient cultivar. Zero yield reduction projected.';
        }
        break;

      case 'summer_heatwave':
        if (crop.category === 'vegetable' && crop.id === 'lettuce') {
          riskLevel = 'danger';
          yieldImpact = isSevere ? 65 : 40;
          recommendation = 'Severe bolting and bitterness imminent. Erect 40% shade cloth and initiate pre-dawn overhead misting.';
        } else if (crop.moistureNeed === 'high') {
          riskLevel = isSevere ? 'danger' : 'caution';
          yieldImpact = isSevere ? 40 : 20;
          recommendation = 'High transpiration deficit. Double drip irrigation cycles and apply organic straw mulch.';
        } else {
          riskLevel = 'safe';
          yieldImpact = isSevere ? 10 : 0;
          recommendation = 'Heat-tolerant physiology. Ensure routine root-zone hydration.';
        }
        break;

      case 'flash_drought':
        if (isGreenhouse) {
          riskLevel = 'caution';
          yieldImpact = 10;
          recommendation = 'Irrigation reservoir draw increased. Transition to pulse fertigation.';
        } else if (crop.moistureNeed === 'high') {
          riskLevel = 'danger';
          yieldImpact = isSevere ? 55 : 30;
          recommendation = 'Soil moisture depleting past wilting point. Restrict irrigation strictly to critical root zones.';
        } else {
          riskLevel = isSevere ? 'caution' : 'safe';
          yieldImpact = isSevere ? 20 : 5;
          recommendation = 'Deep taproot structure mitigating surface moisture deficit.';
        }
        break;

      case 'excess_rainfall':
        if (isGreenhouse) {
          riskLevel = 'safe';
          yieldImpact = 0;
          recommendation = 'Covered cultivation prevents soil saturation and root hypoxia.';
        } else if (parcel.soil.ph < 5.5 || crop.moistureNeed === 'low') {
          riskLevel = 'danger';
          yieldImpact = isSevere ? 50 : 25;
          recommendation = 'High fungal root-rot risk (Phytophthora). Dig drainage diversion trenches immediately.';
        } else {
          riskLevel = isSevere ? 'caution' : 'safe';
          yieldImpact = isSevere ? 15 : 0;
          recommendation = 'Adequate drainage on slope. Inspect for minor soil nutrient leaching.';
        }
        break;

      default:
        recommendation = 'No specific agronomic impact detected.';
    }

    affectedParcels.push({
      parcelId: parcel.id,
      cropName: crop.name,
      riskLevel,
      yieldImpact,
      recommendation,
    });
  });

  const dangerCount = affectedParcels.filter((p) => p.riskLevel === 'danger').length;
  const summary =
    affectedParcels.length === 0
      ? 'No active crops planted across parcels to simulate.'
      : `Simulated ${severity.toUpperCase()} ${anomalyType.replace(/_/g, ' ')}: ${dangerCount} parcel(s) in critical danger, average yield impact ${(affectedParcels.reduce((acc, p) => acc + p.yieldImpact, 0) / Math.max(1, affectedParcels.length)).toFixed(0)}%.`;

  return {
    anomalyType,
    severity,
    affectedParcels,
    summary,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Identifies synergistic companion planting opportunities across farm parcels
 */
export function getCompanionSuggestions(
  targetParcelId: string,
  parcels: Parcel[],
  crops: Record<string, CropProfile>
): CompanionPlantingResult {
  const targetParcel = parcels.find((p) => p.id === targetParcelId);
  if (!targetParcel || !targetParcel.currentCrop) {
    return {
      targetParcel: targetParcelId,
      targetCrop: 'None',
      suggestions: [],
      warnings: ['Target parcel does not currently have an active crop scheduled.'],
    };
  }

  const currentCrop = crops[targetParcel.currentCrop];
  const suggestions: CompanionPlantingResult['suggestions'] = [];
  const warnings: CompanionPlantingResult['warnings'] = [];

  // Look for empty parcels to place companions
  const emptyParcels = parcels.filter((p) => !p.currentCrop && p.id !== targetParcelId);

  currentCrop.companionCrops.forEach((companionId) => {
    const companionCrop = crops[companionId];
    if (!companionCrop) return;

    // Pick best suited empty parcel
    const bestParcel = emptyParcels[0];
    let benefit = '';
    if (currentCrop.id === 'tomato' && companionId === 'carrot') {
      benefit = 'Carrots loosen deep soil for tomato root aeration without competing for upper canopy light.';
    } else if (currentCrop.id === 'tomato' && companionId === 'lettuce') {
      benefit = 'Lettuce acts as living mulch, suppressing weeds and conserving topsoil moisture under tomato foliage.';
    } else if (currentCrop.id === 'corn') {
      benefit = 'Provides windbreak and microclimate stabilization for tender understory companions.';
    } else {
      benefit = `Synergistic nutrient exchange and natural pest deterrent pairing with ${currentCrop.name}.`;
    }

    suggestions.push({
      companionCropId: companionId,
      companionCropName: companionCrop.name,
      benefit,
      suggestedParcel: bestParcel ? bestParcel.name : 'Adjacent border planting',
    });
  });

  // Check for antagonist warnings in other parcels
  parcels.forEach((otherParcel) => {
    if (otherParcel.id !== targetParcelId && otherParcel.currentCrop) {
      if (currentCrop.antagonisticCrops.includes(otherParcel.currentCrop)) {
        const badCrop = crops[otherParcel.currentCrop];
        warnings.push(
          `Conflict alert: ${badCrop.name} in ${otherParcel.name} shares pests and allelopathic inhibitors with ${currentCrop.name}. Maintain minimum 15m isolation.`
        );
      }
    }
  });

  return {
    targetParcel: targetParcel.name,
    targetCrop: currentCrop.name,
    suggestions,
    warnings,
  };
}

/**
 * Generates an operational 12-week care plan
 */
export function generateCarePlan(
  _parcel: Parcel,
  crop: CropProfile,
  _climate: ClimateProfile
): CarePlanEntry[] {
  return [
    {
      week: 1,
      activity: 'Direct Sowing & Bed Prep',
      icon: '🌱',
      details: `Incorporate mature compost to achieve target pH ${crop.optimalPH.min}-${crop.optimalPH.max}. Plant seeds at recommended depth with initial watering.`,
    },
    {
      week: 3,
      activity: 'Germination Inspection',
      icon: '🔎',
      details: `Verify germination uniformity (expected ~${crop.daysToGermination} days). Thin seedlings to optimal row spacing of 30-45cm.`,
    },
    {
      week: 5,
      activity: 'Nutritional Side-Dressing',
      icon: '🧪',
      details: `Apply balanced organic fertilizer tailored to ${crop.name}'s NPK needs (N:${crop.npk.n}, P:${crop.npk.p}, K:${crop.npk.k}).`,
    },
    {
      week: 7,
      activity: 'Moisture Optimization',
      icon: '💧',
      details: `Maintain ${crop.moistureNeed} moisture regimen (${crop.wateringFrequency}). Check tensiometer probes at 15cm depth.`,
    },
    {
      week: 9,
      activity: 'Canopy & Flowering Management',
      icon: '🌸',
      details: `Prune non-bearing suckers to concentrate assimilates into developing flowers. Inspect undersides of leaves for aphids and mites.`,
    },
    {
      week: 12,
      activity: 'Peak Harvest Window',
      icon: '🧺',
      details: `Optimal maturity reached (~${crop.daysToHarvest} days). Harvest early morning during peak sugar concentration for maximum shelf-life.`,
    },
  ];
}
