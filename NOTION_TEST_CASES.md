# 🧪 AgriMCP — WebMCP Hackathon Test Cases & Validation Guide
*Copy or Import directly into Notion (`Import -> Markdown`)*

> **Target Application:** AgriMCP (WebMCP Hackathon)  
> **Live URL:** https://agrimcp.cortexmatter.com (or https://agrimcp.pages.dev)  
> **Repository:** https://github.com/jaime-sql/WebMCPHackChallenge  
> **Standard:** WebMCP `document.modelContext.registerTool()`

---

## 🧭 What Does "Testing" Mean for this Hackathon?

For this hackathon, "testing" does **NOT** mean writing complicated code.  
It simply means verifying that **when an AI agent calls one of your 5 WebMCP tools, the web page updates visually in real time**.

You can test everything with **1 click** directly from the live web page using the **"Agent Console"** button in the top navigation bar!

---

## 📋 Test Case Matrix

| Test ID | Test Scenario | WebMCP Tool Tested | What to Click / Run | Expected Visual Result | Status |
|:---|:---|:---|:---|:---|:---:|
| **TC-01** | Soil & Climate Suitability | `analyze_cultivation_suitability` | Click *"🎯 Evaluate Plot Alpha for Tomatoes"* in Agent Console | Plot Alpha card updates to **92% Match** with green suitability badge | [ ] Pass |
| **TC-02** | Acid Soil Compatibility | `analyze_cultivation_suitability` | Click *"🫐 Test Acid Soil for Blueberries"* in Agent Console | Plot Beta (pH 5.0) scores high match; advice shows ideal acidic range | [ ] Pass |
| **TC-03** | Schedule Crop to Canvas | `schedule_crop_cultivation` | Click *"🌽 Schedule Sweet Corn on Plot Delta"* in Agent Console | Sweet Corn appears on Plot Delta; Gantt timeline renders growth bar | [ ] Pass |
| **TC-04** | Climate Shock Simulation | `simulate_climate_shock` | Click *"❄️ Simulate Late May Frost"* in Agent Console | Frost-sensitive crops flash **Danger** with red alert banner; cold-hardy remain safe | [ ] Pass |
| **TC-05** | Companion Planting | `optimize_companion_planting` | Click *"🌿 Optimize Companion Planting for Plot Alpha"* | Agent suggests companion crops (Carrots/Lettuce) for adjacent plots | [ ] Pass |
| **TC-06** | 12-Week Care Plan | `generate_harvest_and_care_plan` | Click *"Care Schedule"* on any planted plot | Modal opens displaying 12-week operational checklist with icons | [ ] Pass |

---

## 🔍 Detailed Step-by-Step Test Execution

### Test 1: Suitability Analysis (`analyze_cultivation_suitability`)
- **Objective:** Verify that the AI agent can read parcel soil telemetry (pH, moisture, GDD) and calculate biological suitability.
- **Steps:**
  1. Open [https://agrimcp.pages.dev](https://agrimcp.pages.dev) in your browser.
  2. Click the green **"Agent Console"** button in the top navigation bar.
  3. In the slide-over drawer, click the **"Run"** button next to *"🎯 Evaluate Plot Alpha for Heirloom Tomatoes"*.
- **Expected Result:**
  - A notification toast shows *"Successfully executed analyze_cultivation_suitability!"*.
  - Plot Alpha's match badge highlights in green with match percentage.
  - In the **"Logs"** tab of the Agent Console, you see the input JSON and output JSON with `overallScore`.

---

### Test 2: Crop Scheduling (`schedule_crop_cultivation`)
- **Objective:** Verify that the agent can assign crops to parcels and render the seasonal timeline.
- **Steps:**
  1. In the Agent Console, click **"Run"** next to *"🌽 Schedule Sweet Corn on Plot Delta"*.
- **Expected Result:**
  - Plot Delta now shows Sweet Corn with sowing date and harvest date.
  - Scroll down to the **"Seasonal Cultivation & Harvest Timeline"**: a colorful Gantt bar renders across the summer months showing biological progression.

---

### Test 3: Climate Shock Stress-Test (`simulate_climate_shock`)
- **Objective:** Verify that the agent can stress-test farm resilience against extreme weather events.
- **Steps:**
  1. In the Agent Console, click **"Run"** next to *"❄️ Simulate Severe Late May Frost"*.
  2. *(Alternatively, click "❄️ Late Frost" on the weather widget at the bottom of the screen)*.
- **Expected Result:**
  - An orange/red alert banner appears at the top: `Active Shock: late spring frost`.
  - Frost-sensitive crops (Tomatoes) display a red warning: `75% yield risk: Immediate thermal blanket deployment required`.
  - Cold-hardy crops remain safe.

---

### Test 4: Companion Planting Optimization (`optimize_companion_planting`)
- **Objective:** Verify synergistic crop pairings and antagonistic conflict detection.
- **Steps:**
  1. In the Agent Console, click **"Run"** next to *"🌿 Optimize Companion Planting for Plot Alpha"*.
- **Expected Result:**
  - The response identifies carrots and lettuce as beneficial companions that aerate soil and act as living mulch without competing for light.

---

### Test 5: Operational Care Checklist (`generate_harvest_and_care_plan`)
- **Objective:** Verify 12-week operational milestone generation.
- **Steps:**
  1. On any planted parcel card (e.g. Plot Alpha), click **"Care Schedule"**.
- **Expected Result:**
  - A clean modal pops up displaying the 12-week checklist:
    - 🌱 Week 1: Direct Sowing & Bed Prep
    - 🔎 Week 3: Germination Inspection
    - 🧪 Week 5: Nutritional Side-Dressing
    - 💧 Week 7: Moisture Optimization
    - 🌸 Week 9: Canopy & Flowering Management
    - 🧺 Week 12: Peak Harvest Window

---

## 🎬 3-Minute Video Walkthrough Checklist

Use this checklist when recording your screen and audio for the Devpost submission:

- [ ] **Scene 1 (0:00 - 0:30):** Show the homepage, title banner, 6 farm parcels, and explain what AgriMCP is.
- [ ] **Scene 2 (0:30 - 1:10):** Open the **Agent Console**, run Test 1 (Tomatoes suitability), and show the parcel card updating live.
- [ ] **Scene 3 (1:10 - 1:50):** Run Test 2 (Schedule Corn), scroll down, and show the seasonal timeline bar animating.
- [ ] **Scene 4 (1:50 - 2:30):** Trigger Test 3 (Late May Frost), show the red alert banner and yield risk calculation.
- [ ] **Scene 5 (2:30 - 3:00):** Open the 12-week Care Schedule modal, show the MIT license in GitHub, and conclude!
