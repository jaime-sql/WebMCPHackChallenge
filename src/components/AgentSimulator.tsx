import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  getToolDefinitions,
  executeWebMCPTool,
  WebMCPToolDefinition,
} from '../webmcp/registerWebMCP';
import {
  Bot,
  X,
  Play,
  Terminal,
  Code2,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AgentSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  hasNativeWebMCP: boolean;
}

export const AgentSimulator: React.FC<AgentSimulatorProps> = ({
  isOpen,
  onClose,
  hasNativeWebMCP,
}) => {
  const { state, dispatch } = useFarm();
  const tools = getToolDefinitions();

  const [activeTab, setActiveTab] = useState<'scenarios' | 'tools' | 'logs'>('scenarios');
  const [selectedTool, setSelectedTool] = useState<WebMCPToolDefinition>(tools[0]);
  const [toolInputs, setToolInputs] = useState<string>(
    JSON.stringify(
      {
        cropId: 'tomato',
        parcelId: 'plot-alpha',
        targetMonth: 4,
      },
      null,
      2
    )
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset 1-click test scenarios for hackathon judges
  const presetScenarios = [
    {
      title: '🎯 Evaluate Plot Alpha for Heirloom Tomatoes',
      desc: 'Calls `analyze_cultivation_suitability` with soil pH and frost curve.',
      tool: 'analyze_cultivation_suitability',
      input: { cropId: 'tomato', parcelId: 'plot-alpha', targetMonth: 4 },
    },
    {
      title: '🌽 Schedule Sweet Corn on Plot Delta',
      desc: 'Calls `schedule_crop_cultivation` and populates the seasonal timeline.',
      tool: 'schedule_crop_cultivation',
      input: {
        parcelId: 'plot-delta',
        cropId: 'corn',
        sowingWeek: '2026-04-20',
        optimizationGoal: 'max_yield',
      },
    },
    {
      title: '🫐 Test Acid Soil Compatibility for Blueberries',
      desc: 'Checks suitability on Plot Beta (Acidic Peat, pH 5.0).',
      tool: 'analyze_cultivation_suitability',
      input: { cropId: 'blueberry', parcelId: 'plot-beta', targetMonth: 3 },
    },
    {
      title: '❄️ Simulate Severe Late May Frost',
      desc: 'Calls `simulate_climate_shock` to stress-test all active crops.',
      tool: 'simulate_climate_shock',
      input: { anomalyType: 'late_spring_frost', severity: 'severe' },
    },
    {
      title: '🌿 Optimize Companion Planting for Plot Alpha',
      desc: 'Analyzes adjacent plots for beneficial synergistic pairings.',
      tool: 'optimize_companion_planting',
      input: { targetParcelId: 'plot-alpha' },
    },
    {
      title: '📋 Generate 12-Week Care Plan for Plot Alpha',
      desc: 'Generates operational milestones and irrigation cycles.',
      tool: 'generate_harvest_and_care_plan',
      input: { parcelId: 'plot-alpha' },
    },
  ];

  const handleRunPreset = async (scenario: (typeof presetScenarios)[0]) => {
    setIsExecuting(true);
    setExecutionMessage(`Invoking ${scenario.tool}...`);
    try {
      await executeWebMCPTool(scenario.tool, scenario.input, () => state, dispatch);
      setExecutionMessage(`Successfully executed ${scenario.tool}!`);
    } catch (err: any) {
      setExecutionMessage(`Execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionMessage(null), 3000);
    }
  };

  const handleRunCustomTool = async () => {
    setIsExecuting(true);
    setExecutionMessage(`Executing ${selectedTool.name}...`);
    try {
      const parsed = JSON.parse(toolInputs);
      await executeWebMCPTool(selectedTool.name, parsed, () => state, dispatch);
      setExecutionMessage(`Success! Tool completed.`);
    } catch (err: any) {
      setExecutionMessage(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionMessage(null), 3000);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-leaf-600/20 border border-leaf-500/40 flex items-center justify-center text-leaf-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              WebMCP Agent Console
              <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-leaf-950 border border-leaf-700 text-leaf-300">
                {hasNativeWebMCP ? 'Native MCP' : 'Dual-Mode'}
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Interactive test inspector for WebMCP tools
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-950/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'scenarios'
              ? 'border-leaf-500 text-leaf-400 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          ⚡ Preset Scenarios
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'tools'
              ? 'border-leaf-500 text-leaf-400 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          🛠️ Tool Registry
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-leaf-500 text-leaf-400 bg-stone-900/60'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <span>📜 Logs</span>
          {state.executionLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-stone-800 text-[10px] text-stone-300">
              {state.executionLogs.length}
            </span>
          )}
        </button>
      </div>

      {/* Feedback Toast */}
      {executionMessage && (
        <div className="p-2.5 bg-leaf-950 border-b border-leaf-800 text-leaf-300 text-xs flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 animate-bounce" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Preset Scenarios */}
        {activeTab === 'scenarios' && (
          <div className="space-y-3">
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 text-xs text-stone-300 leading-relaxed">
              <span className="font-semibold text-leaf-400">Judge / Reviewer Quick Test:</span>
              <p className="mt-1 text-[11px] text-stone-400">
                Click any scenario below to simulate an AI agent invoking the registered WebMCP tool directly on this web page. Watch the farm parcels, timeline, and climate widgets mutate in real time!
              </p>
            </div>

            {presetScenarios.map((sc, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-stone-950/50 border border-stone-800 hover:border-leaf-600/60 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-stone-200 group-hover:text-leaf-300 transition">
                      {sc.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">{sc.desc}</p>
                    <code className="inline-block mt-1 text-[10px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded">
                      {sc.tool}()
                    </code>
                  </div>
                  <button
                    disabled={isExecuting}
                    onClick={() => handleRunPreset(sc)}
                    className="shrink-0 p-2 rounded-lg bg-leaf-600 hover:bg-leaf-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-leaf-900/30 transition disabled:opacity-50"
                    title="Execute WebMCP Tool"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Tool Registry & Custom Invoker */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Select WebMCP Tool ({tools.length} Registered)
              </label>
              <select
                value={selectedTool.name}
                onChange={(e) => {
                  const t = tools.find((tool) => tool.name === e.target.value)!;
                  setSelectedTool(t);
                  // Generate default parameters
                  if (t.name === 'analyze_cultivation_suitability') {
                    setToolInputs(JSON.stringify({ cropId: 'tomato', parcelId: 'plot-alpha', targetMonth: 4 }, null, 2));
                  } else if (t.name === 'schedule_crop_cultivation') {
                    setToolInputs(JSON.stringify({ parcelId: 'plot-alpha', cropId: 'tomato', sowingWeek: '2026-04-15' }, null, 2));
                  } else if (t.name === 'simulate_climate_shock') {
                    setToolInputs(JSON.stringify({ anomalyType: 'late_spring_frost', severity: 'severe' }, null, 2));
                  } else if (t.name === 'optimize_companion_planting') {
                    setToolInputs(JSON.stringify({ targetParcelId: 'plot-alpha' }, null, 2));
                  } else {
                    setToolInputs(JSON.stringify({ parcelId: 'plot-alpha' }, null, 2));
                  }
                }}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 outline-none focus:border-leaf-500"
              >
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="bg-stone-950/60 p-3 rounded-lg border border-stone-800 text-xs">
              <p className="font-semibold text-stone-300 text-[11px] mb-1">Description:</p>
              <p className="text-stone-400 leading-relaxed text-[11px]">{selectedTool.description}</p>
            </div>

            {/* JSON Schema */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Input JSON Schema</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">OpenAI / Chrome Standard</span>
              </div>
              <pre className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-[10px] text-sky-300 font-mono overflow-x-auto max-h-36">
                {JSON.stringify(selectedTool.inputSchema, null, 2)}
              </pre>
            </div>

            {/* Input Editor */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Payload Arguments (JSON)
              </label>
              <textarea
                rows={5}
                value={toolInputs}
                onChange={(e) => setToolInputs(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs font-mono text-stone-200 outline-none focus:border-leaf-500"
              />
            </div>

            <button
              disabled={isExecuting}
              onClick={handleRunCustomTool}
              className="w-full py-2 rounded-lg bg-leaf-600 hover:bg-leaf-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-leaf-900/40 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Execute WebMCP Tool</span>
            </button>
          </div>
        )}

        {/* Tab 3: Execution Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {state.executionLogs.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                <Terminal className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                <p>No tool execution logs recorded yet.</p>
                <p className="text-[10px] text-stone-600 mt-1">Run a scenario or tool to inspect responses.</p>
              </div>
            ) : (
              state.executionLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-stone-800 bg-stone-950/70 overflow-hidden text-xs"
                  >
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-900/60 transition"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-stone-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-500" />
                        )}
                        <div>
                          <p className="font-semibold text-stone-200 text-xs font-mono">
                            {log.toolName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span>•</span>
                            <span className="text-leaf-400 font-mono">{log.durationMs}ms</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                        200 OK
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="p-3 border-t border-stone-800/80 bg-stone-950 space-y-2">
                        <div>
                          <p className="text-[10px] text-stone-400 font-semibold mb-1">Input Payload:</p>
                          <pre className="p-2 rounded bg-stone-900 text-[10px] text-amber-300 font-mono overflow-x-auto">
                            {JSON.stringify(log.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] text-stone-400 font-semibold mb-1">Returned Output:</p>
                          <pre className="p-2 rounded bg-stone-900 text-[10px] text-emerald-300 font-mono overflow-x-auto">
                            {JSON.stringify(log.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/90 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-leaf-500" />
        <span>Open standard compliant with Google Chrome & OpenAI WebMCP</span>
      </div>
    </aside>
  );
};
