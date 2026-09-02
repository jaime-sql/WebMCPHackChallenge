import { FarmState, FarmAction, ToolExecutionLog } from '../types';
import { CROPS } from '../data/crops';
import {
  calculateSuitability,
  simulateClimateShock,
  getCompanionSuggestions,
  generateCarePlan,
} from '../utils/agronomy';

// WebMCP Tool Definition Interface
export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Complete tool registry definitions
export const WEBMCP_TOOL_DEFINITIONS: WebMCPToolDefinition[] = [
  {
    name: 'analyze_cultivation_suitability',
    description:
      'Evaluates soil pH, moisture levels, Growing Degree Days (GDD), and frost risk to determine whether a target farm parcel is suitable for a specific crop and planting month.',
    inputSchema: {
      type: 'object',
      properties: {
        cropId: {
          type: 'string',
          enum: Object.keys(CROPS),
          description: 'Unique identifier of the crop (e.g., tomato, corn, avocado, blueberry, etc.)',
        },
        parcelId: {
          type: 'string',
          description: 'ID of the parcel to analyze (e.g., plot-alpha, plot-beta, plot-delta, greenhouse-1)',
        },
        targetMonth: {
          type: 'number',
          description: 'Planned planting month (1 for January through 12 for December)',
          minimum: 1,
          maximum: 12,
        },
      },
      required: ['cropId', 'parcelId', 'targetMonth'],
    },
  },
  {
    name: 'schedule_crop_cultivation',
    description:
      'Schedules a crop on a specific parcel, initializes the multi-phase cultivation timeline (sowing -> germination -> vegetative -> flowering -> harvest), and generates the crop care schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        parcelId: {
          type: 'string',
          description: 'ID of the parcel where the crop will be sown',
        },
        cropId: {
          type: 'string',
          enum: Object.keys(CROPS),
          description: 'Crop ID to plant',
        },
        sowingWeek: {
          type: 'string',
          description: 'Approximate ISO date or description of sowing date (e.g., 2026-04-15)',
        },
        optimizationGoal: {
          type: 'string',
          enum: ['max_yield', 'water_efficiency', 'frost_avoidance'],
          description: 'Primary agronomic optimization priority',
        },
      },
      required: ['parcelId', 'cropId', 'sowingWeek'],
    },
  },
  {
    name: 'simulate_climate_shock',
    description:
      'Simulates an extreme weather anomaly (late spring frost, summer heatwave, flash drought, or excess rainfall) across all farm parcels to stress-test crop resilience and calculate yield risks.',
    inputSchema: {
      type: 'object',
      properties: {
        anomalyType: {
          type: 'string',
          enum: ['late_spring_frost', 'summer_heatwave', 'flash_drought', 'excess_rainfall'],
          description: 'Type of meteorological event to simulate',
        },
        severity: {
          type: 'string',
          enum: ['moderate', 'severe'],
          description: 'Intensity level of the climatic event',
        },
      },
      required: ['anomalyType'],
    },
  },
  {
    name: 'optimize_companion_planting',
    description:
      'Analyzes farm parcels to identify synergistic companion planting pairings (pest control, nitrogen-fixing, weed suppression) and alerts to antagonistic plant conflicts.',
    inputSchema: {
      type: 'object',
      properties: {
        targetParcelId: {
          type: 'string',
          description: 'The target parcel to analyze for companion planting opportunities',
        },
      },
      required: ['targetParcelId'],
    },
  },
  {
    name: 'generate_harvest_and_care_plan',
    description:
      'Generates a comprehensive 12-week operational care plan (bed prep, germination check, fertilization, irrigation regimen, and harvest window) for a specific parcel.',
    inputSchema: {
      type: 'object',
      properties: {
        parcelId: {
          type: 'string',
          description: 'ID of the parcel to generate a care regimen for',
        },
      },
      required: ['parcelId'],
    },
  },
];

export function getToolDefinitions(): WebMCPToolDefinition[] {
  return WEBMCP_TOOL_DEFINITIONS;
}

/**
 * Universal executor used by both real WebMCP (document.modelContext) and the Agent Simulator
 */
export async function executeWebMCPTool(
  toolName: string,
  input: Record<string, any>,
  getState: () => FarmState,
  dispatch: React.Dispatch<FarmAction>
): Promise<any> {
  const startTime = performance.now();
  const state = getState();

  let output: any = null;

  try {
    switch (toolName) {
      case 'analyze_cultivation_suitability': {
        const { cropId, parcelId, targetMonth } = input;
        const crop = CROPS[cropId];
        const parcel = state.parcels.find((p) => p.id === parcelId);

        if (!crop) throw new Error(`Crop '${cropId}' not found in agronomic database.`);
        if (!parcel) throw new Error(`Parcel '${parcelId}' not found.`);

        const month = targetMonth || new Date().getMonth() + 1;
        const suitability = calculateSuitability(crop, parcel, state.climate, month);

        dispatch({
          type: 'UPDATE_PARCEL',
          parcelId,
          updates: {
            suitabilityScore: suitability.overallScore,
            suitabilityDetails: suitability,
          },
        });

        output = {
          success: true,
          parcel: parcel.name,
          crop: crop.name,
          overallScore: suitability.overallScore,
          suitabilityDetails: suitability,
        };
        break;
      }

      case 'schedule_crop_cultivation': {
        const { parcelId, cropId, sowingWeek } = input;
        const crop = CROPS[cropId];
        const parcel = state.parcels.find((p) => p.id === parcelId);

        if (!crop) throw new Error(`Crop '${cropId}' not found.`);
        if (!parcel) throw new Error(`Parcel '${parcelId}' not found.`);

        const sowDate = sowingWeek ? new Date(sowingWeek) : new Date();
        const harvestDate = new Date(sowDate);
        harvestDate.setDate(harvestDate.getDate() + crop.daysToHarvest);

        const currentMonth = sowDate.getMonth() + 1;
        const suitability = calculateSuitability(crop, parcel, state.climate, currentMonth);
        const carePlan = generateCarePlan(parcel, crop, state.climate);

        dispatch({
          type: 'UPDATE_PARCEL',
          parcelId,
          updates: {
            currentCrop: crop.id,
            sowingDate: sowDate.toISOString().split('T')[0],
            harvestDate: harvestDate.toISOString().split('T')[0],
            cultivationPhase: 'sowing',
            suitabilityScore: suitability.overallScore,
            suitabilityDetails: suitability,
            carePlan,
          },
        });

        output = {
          success: true,
          message: `Successfully scheduled ${crop.name} on ${parcel.name}.`,
          sowingDate: sowDate.toISOString().split('T')[0],
          expectedHarvest: harvestDate.toISOString().split('T')[0],
          suitabilityScore: suitability.overallScore,
          careMilestones: carePlan.length,
        };
        break;
      }

      case 'simulate_climate_shock': {
        const { anomalyType, severity = 'moderate' } = input;
        const shockResult = simulateClimateShock(
          anomalyType,
          severity,
          state.parcels,
          state.climate
        );

        dispatch({
          type: 'SET_ACTIVE_SHOCK',
          shock: shockResult,
        });

        output = {
          success: true,
          summary: shockResult.summary,
          affectedParcels: shockResult.affectedParcels,
        };
        break;
      }

      case 'optimize_companion_planting': {
        const { targetParcelId } = input;
        const result = getCompanionSuggestions(targetParcelId, state.parcels, CROPS);

        output = {
          success: true,
          targetParcel: result.targetParcel,
          targetCrop: result.targetCrop,
          suggestions: result.suggestions,
          warnings: result.warnings,
        };
        break;
      }

      case 'generate_harvest_and_care_plan': {
        const { parcelId } = input;
        const parcel = state.parcels.find((p) => p.id === parcelId);

        if (!parcel) throw new Error(`Parcel '${parcelId}' not found.`);
        if (!parcel.currentCrop) {
          throw new Error(`Parcel '${parcel.name}' does not have an active crop planted.`);
        }

        const crop = CROPS[parcel.currentCrop];
        const carePlan = generateCarePlan(parcel, crop, state.climate);

        dispatch({
          type: 'UPDATE_PARCEL',
          parcelId,
          updates: { carePlan },
        });

        output = {
          success: true,
          parcel: parcel.name,
          crop: crop.name,
          carePlan,
        };
        break;
      }

      default:
        throw new Error(`Unrecognized WebMCP tool: '${toolName}'`);
    }
  } catch (err: any) {
    output = {
      success: false,
      error: err.message || 'An error occurred during tool execution.',
    };
  }

  const durationMs = Math.round(performance.now() - startTime);

  const logEntry: ToolExecutionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    toolName,
    input,
    output,
    timestamp: new Date(),
    durationMs,
  };

  dispatch({ type: 'ADD_EXECUTION_LOG', log: logEntry });

  return output;
}

/**
 * Registers all tools with native document.modelContext when available
 */
export function registerWebMCPTools(
  getState: () => FarmState,
  dispatch: React.Dispatch<FarmAction>
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const modelContext = (document as any).modelContext;

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    console.info(
      'ℹ️ WebMCP Notice: document.modelContext is not present in this browser environment. ' +
        'AgriMCP is running in universal dual-mode (accessible via in-app Agent Simulator and ready for Chrome WebMCP flag).'
    );
    return false;
  }

  try {
    WEBMCP_TOOL_DEFINITIONS.forEach((tool) => {
      modelContext.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: async (input: Record<string, any>) => {
          console.log(`🤖 [WebMCP Native Call] ${tool.name}:`, input);
          return await executeWebMCPTool(tool.name, input, getState, dispatch);
        },
      });
    });

    console.log('✅ WebMCP: Successfully registered 5 tools to document.modelContext!');
    return true;
  } catch (e) {
    console.warn('⚠️ WebMCP registration encountered an error:', e);
    return false;
  }
}
