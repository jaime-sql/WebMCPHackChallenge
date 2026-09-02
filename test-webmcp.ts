/**
 * Automated WebMCP Test Runner for AgriMCP
 * Executes tests against all 5 WebMCP tool implementations
 */

import { CROPS } from './src/data/crops';
import { INITIAL_PARCELS } from './src/data/parcels';
import { CLIMATE_ZONES } from './src/data/climate';
import {
  calculateSuitability,
  simulateClimateShock,
  getCompanionSuggestions,
  generateCarePlan,
  getPhaseForDay
} from './src/utils/agronomy';
import { WEBMCP_TOOL_DEFINITIONS } from './src/webmcp/registerWebMCP';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🌱 AgriMCP — Automated WebMCP Verification Suite');
console.log('======================================================\n');

// Test 1: Tool Registry Schemas
console.log('📋 Test 1: WebMCP Tool Registration & Schema Integrity');
assert(WEBMCP_TOOL_DEFINITIONS.length === 5, 'Exactly 5 WebMCP tools are registered in the registry');
const toolNames = WEBMCP_TOOL_DEFINITIONS.map(t => t.name);
assert(toolNames.includes('analyze_cultivation_suitability'), 'Tool analyze_cultivation_suitability is registered');
assert(toolNames.includes('schedule_crop_cultivation'), 'Tool schedule_crop_cultivation is registered');
assert(toolNames.includes('simulate_climate_shock'), 'Tool simulate_climate_shock is registered');
assert(toolNames.includes('optimize_companion_planting'), 'Tool optimize_companion_planting is registered');
assert(toolNames.includes('generate_harvest_and_care_plan'), 'Tool generate_harvest_and_care_plan is registered');

WEBMCP_TOOL_DEFINITIONS.forEach(tool => {
  assert(tool.inputSchema.type === 'object', `${tool.name} inputSchema specifies type 'object'`);
  assert(tool.description.length > 20, `${tool.name} provides a clear descriptive prompt`);
});

// Test 2: Soil Suitability & GDD Calculation
console.log('\n🌾 Test 2: Agronomic Suitability & GDD Accumulator');
const tomato = CROPS['tomato'];
const plotAlpha = INITIAL_PARCELS[0];
const climate8b = CLIMATE_ZONES['8b'];

const suitabilityApril = calculateSuitability(tomato, plotAlpha, climate8b, 4);
assert(suitabilityApril.overallScore > 0 && suitabilityApril.overallScore <= 100, `Tomato in April overall score is valid (${suitabilityApril.overallScore}%)`);
assert(suitabilityApril.phMatch === 100, `Plot Alpha (pH 6.4) is a 100% pH match for Heirloom Tomato (target 6.0-6.8)`);
assert(suitabilityApril.recommendation.length > 0, `Generated actionable recommendation: "${suitabilityApril.recommendation.slice(0, 45)}..."`);

// Test Acid Peat with Blueberries
const blueberry = CROPS['blueberry'];
const plotBeta = INITIAL_PARCELS[1]; // pH 5.0
const blueberrySuitability = calculateSuitability(blueberry, plotBeta, climate8b, 3);
assert(blueberrySuitability.phMatch === 100, `Plot Beta (pH 5.0) is a 100% pH match for acid-loving Blueberries (pH 4.5-5.5)`);

// Test 3: Biological Growth Phase Calculation
console.log('\n🌿 Test 3: Biological Phase Transitions');
assert(getPhaseForDay(tomato, 3) === 'germination', 'Day 3 correctly identified as Germination phase');
assert(getPhaseForDay(tomato, 25) === 'vegetative', 'Day 25 correctly identified as Vegetative phase');
assert(getPhaseForDay(tomato, 60) === 'flowering', 'Day 60 correctly identified as Flowering phase');
assert(getPhaseForDay(tomato, 90) === 'harvest', 'Day 90 correctly identified as Harvest phase');

// Test 4: Climate Shock Simulation
console.log('\n❄️ Test 4: Climate Anomaly Stress-Testing');
const parcelsWithTomato = [{
  ...plotAlpha,
  currentCrop: 'tomato',
  sowingDate: '2026-04-10'
}];
const frostShock = simulateClimateShock('late_spring_frost', 'severe', parcelsWithTomato, climate8b);
assert(frostShock.affectedParcels.length === 1, 'Simulated frost evaluated active crop on parcel');
assert(frostShock.affectedParcels[0].riskLevel === 'danger', 'Frost-sensitive Heirloom Tomato correctly flagged as DANGER under severe frost');
assert(frostShock.affectedParcels[0].yieldImpact > 50, `Yield penalty calculated (${frostShock.affectedParcels[0].yieldImpact}%)`);

// Test 5: Companion Planting Synergy & Conflict
console.log('\n🌱 Test 5: Companion Planting & Conflict Engine');
const companionResult = getCompanionSuggestions('plot-alpha', parcelsWithTomato, CROPS);
assert(companionResult.suggestions.length > 0, 'Generated companion crop recommendations for Heirloom Tomato');
const companionIds = companionResult.suggestions.map(s => s.companionCropId);
assert(companionIds.includes('carrot') || companionIds.includes('lettuce'), 'Correctly identified Carrots or Lettuce as synergistic companions');

// Test 6: Operational Care Plan Generation
console.log('\n📋 Test 6: 12-Week Operational Care Checklist');
const carePlan = generateCarePlan(plotAlpha, tomato, climate8b);
assert(carePlan.length === 6, 'Generated 6 bi-weekly operational milestone entries');
assert(carePlan[0].week === 1, 'Week 1 covers Bed Prep and Direct Sowing');
assert(carePlan[carePlan.length - 1].activity.includes('Harvest'), 'Final milestone covers Harvest window');

console.log('\n======================================================');
console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All WebMCP tool implementations verified successfully!\n');
}
