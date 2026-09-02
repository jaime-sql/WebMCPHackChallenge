# 🌱 AgriMCP — Agent-Native Precision Cultivation Canvas

> **The WebMCP Challenge (Devpost Hackathon Submission)**  
> Built for the open web standard powered by Google Chrome and OpenAI WebMCP (`document.modelContext.registerTool`).

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-v1.0%20Standard-blue.svg)](https://webmachinelearning.github.io/webmcp/)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020.svg?logo=cloudflare)](https://agrimcp.pages.dev)
[![Live URL](https://img.shields.io/badge/Live%20Demo-agrimcp.cortexmatter.com-success.svg)](https://agrimcp.cortexmatter.com)

**🌐 Live Demo:** [https://agrimcp.cortexmatter.com](https://agrimcp.cortexmatter.com) *(Backup: [https://agrimcp.pages.dev](https://agrimcp.pages.dev))*  
**📦 GitHub Repository:** [https://github.com/jaime-sql/WebMCPHackChallenge](https://github.com/jaime-sql/WebMCPHackChallenge)

---

## 🌾 Project Overview

Modern agriculture requires balancing complex, interdependent variables: soil pH, moisture levels, nitrogen-phosphorus-potassium (NPK) ratios, Growing Degree Days (GDD), and volatile weather curves. 

Previously, growers either had to cross-reference static PDF tables and spreadsheets manually, or chat with detached AI chatbots that could only produce walls of text without interacting with their actual field maps or schedules.

**AgriMCP** transforms the grower experience into a **collaborative canvas**. Instead of leaving AI agents to guess their way through HTML selectors or scrape DOM text, AgriMCP exposes **structured agronomic tools directly into the browser session** via `document.modelContext.registerTool()`. 

When an agent (via **ChatGPT's in-app browser** or **Google Chrome with `#enable-webmcp-testing`**) enters the page, it can analyze soil suitability, schedule crops onto visual parcels, stress-test the farm against climate shocks, and arrange companion plantings in real time!

---

## 🚀 Key Features

- **Interactive Farm Parcel Grid:** 6 diverse topographic plots tracking live soil pH, moisture percentage, nitrogen saturation, and organic matter.
- **Seasonal Cultivation & Harvest Timeline:** Gantt visualizer mapping biological phases from sowing $\rightarrow$ germination $\rightarrow$ vegetative $\rightarrow$ flowering $\rightarrow$ peak harvest.
- **Microclimate & Frost Telemetry:** Regional climate zone models (USDA 6b, 7a, 8b, 9a) calculating Growing Degree Days and critical frost dates.
- **Climate Anomaly Stress Tester:** Simulates late spring frosts, summer heatwaves, flash droughts, and torrential rain, flagging vulnerable crops and suggesting immediate countermeasures.
- **Operational 12-Week Care Regimen:** Week-by-week checklist covering bed prep, germination inspection, side-dressing fertilization, and harvest windows.
- **In-App WebMCP Agent Console:** Built-in dual-mode inspector allowing reviewers to trigger realistic 1-click agent scenarios, inspect JSON schemas, and monitor latency in real time.

---

## 🛠️ WebMCP Implementation (`document.modelContext`)

AgriMCP registers **5 non-trivial tools** directly into the browser's model context:

```typescript
// 1. Analyze suitability based on soil telemetry, GDD, and frost risk
document.modelContext.registerTool({
  name: "analyze_cultivation_suitability",
  description: "Evaluates soil pH, moisture levels, Growing Degree Days (GDD), and frost risk to determine whether a target farm parcel is suitable for a specific crop and planting month.",
  inputSchema: {
    type: "object",
    properties: {
      cropId: { type: "string", enum: ["tomato", "corn", "avocado", "strawberry", "lettuce", "blueberry", "carrot", "grape"] },
      parcelId: { type: "string" },
      targetMonth: { type: "number", minimum: 1, maximum: 12 }
    },
    required: ["cropId", "parcelId", "targetMonth"]
  },
  execute: async (input) => { /* Mutates parcel state & returns suitability score */ }
});

// 2. Schedule planting window on the visual calendar
document.modelContext.registerTool({
  name: "schedule_crop_cultivation",
  description: "Schedules a crop on a specific parcel, initializes the multi-phase cultivation timeline, and generates the care schedule.",
  inputSchema: {
    type: "object",
    properties: {
      parcelId: { type: "string" },
      cropId: { type: "string" },
      sowingWeek: { type: "string" },
      optimizationGoal: { type: "string", enum: ["max_yield", "water_efficiency", "frost_avoidance"] }
    },
    required: ["parcelId", "cropId", "sowingWeek"]
  },
  execute: async (input) => { /* Updates parcel & Gantt chart */ }
});

// 3. Simulate weather anomalies (Stress testing the farm)
document.modelContext.registerTool({
  name: "simulate_climate_shock",
  description: "Simulates an extreme weather anomaly (late spring frost, summer heatwave, flash drought, or excess rainfall) across all farm parcels to stress-test crop resilience and calculate yield risks.",
  inputSchema: {
    type: "object",
    properties: {
      anomalyType: { type: "string", enum: ["late_spring_frost", "summer_heatwave", "flash_drought", "excess_rainfall"] },
      severity: { type: "string", enum: ["moderate", "severe"] }
    },
    required: ["anomalyType"]
  },
  execute: async (input) => { /* Evaluates vulnerability & triggers risk badges */ }
});

// 4. Optimize companion planting & detect antagonist conflicts
document.modelContext.registerTool({
  name: "optimize_companion_planting",
  description: "Analyzes farm parcels to identify synergistic companion planting pairings (pest control, nitrogen-fixing, weed suppression) and alerts to antagonistic plant conflicts.",
  inputSchema: {
    type: "object",
    properties: {
      targetParcelId: { type: "string" }
    },
    required: ["targetParcelId"]
  },
  execute: async (input) => { /* Matches synergistic crops to adjacent parcels */ }
});

// 5. Generate operational 12-week care checklist
document.modelContext.registerTool({
  name: "generate_harvest_and_care_plan",
  description: "Generates a comprehensive 12-week operational care plan (bed prep, germination check, fertilization, irrigation regimen, and harvest window) for a specific parcel.",
  inputSchema: {
    type: "object",
    properties: {
      parcelId: { type: "string" }
    },
    required: ["parcelId"]
  },
  execute: async (input) => { /* Populates 12-week milestone schedule */ }
});
```

---

## 📋 Devpost Submission Questions Answered

### 1. Why is this use case a strong fit for WebMCP?
Agricultural planning is heavily state-driven, multi-dimensional, and visual. Human growers need to see their physical plots, soil conditions, and timeline visually, while AI agents excel at mathematical computations (Growing Degree Days, thermal accumulation, frost probability curves, and NPK stoichiometry). WebMCP provides the exact clean interface that connects the agent's analytical capabilities directly to the client's visual state without brittle DOM scraping or external server round-trips.

### 2. How does it create a better user experience?
Instead of reading through text-based recommendations and manually adjusting multiple input forms or calendar entries, the grower simply delegates goals to the agent (e.g. *"Plan my high-acid plots for berry production and stress-test them against a late spring frost"*). The agent uses WebMCP tools to compute optimal solutions and directly updates the visual parcel cards, colors, badges, and Gantt timeline in front of the grower's eyes.

### 3. What can people and agents do together that was difficult or impossible before?
Previously, an AI could tell you in text that "tomatoes need 1,300 GDD and should be planted after the last frost." But the human had to manually calculate whether their specific microclimate had accumulated enough heat units, cross-check their soil pH test report, and manually draw out their garden plan. With AgriMCP, human and agent co-pilot: the farmer provides strategic intent, and the agent inspects parcel telemetry, validates pH thresholds, schedules sowing dates, identifies synergistic companion crops, and simulates climate anomalies directly on the live UI canvas.

### 4. How did you implement WebMCP?
AgriMCP implements `document.modelContext.registerTool()` directly on page mount. It exposes a dual-mode architecture:
1. **Native Mode:** In browsers with WebMCP support (e.g., Google Chrome with `#enable-webmcp-testing` or ChatGPT's in-app browser), tools are registered directly with `document.modelContext`.
2. **Interactive Agent Console:** For reviewers or judges evaluating on standard browsers, the app features an integrated slide-over console that mimics native agent calls, executes the exact same underlying logic, and inspects inputs, outputs, and latency in real time.

---

## 🎬 3-Minute Demo Video Script

| Time | Visual on Screen | Spoken Audio / Narration |
|:---|:---|:---|
| **0:00 - 0:35** | Home canvas: Parcel grid, soil gauges, timeline | *"Welcome to AgriMCP, an agent-native precision cultivation canvas built for The WebMCP Challenge. Agriculture requires balancing soil chemistry, weather curves, and growing cycles. Instead of leaving AI agents in a detached chat box, AgriMCP exposes structured tools directly into the browser using WebMCP."* |
| **0:35 - 1:15** | Open Agent Console $\rightarrow$ Click 'Evaluate Plot Alpha for Tomatoes' | *"Here in Plot Alpha, our soil pH is 6.4. When our AI agent executes `analyze_cultivation_suitability`, it evaluates Growing Degree Days and frost risk, returning a 92% match score and updating the card live on our canvas."* |
| **1:15 - 1:55** | Run 'Schedule Sweet Corn on Plot Delta' $\rightarrow$ Timeline animates | *"Next, the agent calls `schedule_crop_cultivation`. Notice how our Seasonal Cultivation Timeline immediately renders the biological progression—from germination to vegetative growth and harvest window."* |
| **1:55 - 2:30** | Click 'Simulate Late Spring Frost' $\rightarrow$ Risk badges appear | *"Now let's stress-test our farm. The agent triggers `simulate_climate_shock`. The frost-sensitive tomatoes in Plot Alpha immediately flash danger with a 75% yield risk, while our cold-hardy crops remain safe. The agent suggests protective cloches and shifts the sowing schedule."* |
| **2:30 - 3:00** | Open Care Plan Modal $\rightarrow$ Summary | *"With WebMCP, farmers and AI agents collaborate seamlessly on a shared interactive canvas. AgriMCP is 100% open source under the MIT license and ready for the future of the agent-native web."* |

---

## 💻 Local Development & Installation

AgriMCP is 100% self-contained with **zero backend dependencies** and **zero global installations**:

```bash
# 1. Clone repository
git clone https://github.com/jaime-sql/WebMCPHackChallenge.git
cd WebMCPHackChallenge

# 2. Install dependencies locally (isolated inside ./node_modules)
npm install

# 3. Start local development server
npm run dev

# 4. Build for production (ready for Vercel, Netlify, or Cloudflare Pages)
npm run build
```

---

## 🧪 Testing with WebMCP

### Option A: Google Chrome with WebMCP Enabled
1. Open Google Chrome.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Enable the flag and restart Chrome.
4. Open the deployed application URL.
5. Inspect the WebMCP tools using Chrome's Model Context Tool Inspector.

### Option B: ChatGPT In-App Browser
1. Open ChatGPT with in-app browser capabilities.
2. Direct ChatGPT to the deployed live URL.
3. ChatGPT will discover and invoke registered tools natively.

### Option C: In-App WebMCP Agent Console
1. Click the **"Agent Console"** button in the top navigation bar.
2. Run any preset scenario or author custom JSON payloads to inspect tool outputs live.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
