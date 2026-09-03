import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function startProductTour(onComplete?: () => void) {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'Finish Tour 🚀',
    nextBtnText: 'Next →',
    prevBtnText: '← Previous',
    onDestroyStarted: () => {
      if (onComplete) onComplete();
      driverObj.destroy();
    },
    steps: [
      {
        element: '#hero-banner',
        popover: {
          title: '🌱 Welcome to AgriMCP',
          description:
            'An agent-native precision cultivation canvas built for The WebMCP Challenge. Instead of a text chatbot, AI agents interact directly with this live field canvas using structured WebMCP tools.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#farm-parcels-section',
        popover: {
          title: '🌾 Interactive Farm Parcels',
          description:
            'Each plot displays live soil telemetry (pH, moisture %, nitrogen). When the agent runs suitability tools, parcel cards update with real-time biological match scores and risk badges.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#cultivation-timeline-section',
        popover: {
          title: '📅 Biological Cultivation Timeline',
          description:
            'A Gantt visualizer tracking biological phases from sowing → germination → vegetative → flowering → peak harvest. The AI agent schedules planting windows directly onto this timeline.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#climate-widget-section',
        popover: {
          title: '☀️ Regional Microclimate & Frost Telemetry',
          description:
            'Calculates Growing Degree Days (GDD), spring frost limits, and autumn deadlines. Use the anomaly buttons (Late Frost, Drought, Heatwave) to stress-test your crops!',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#agent-console-btn',
        popover: {
          title: '🤖 WebMCP Agent Console',
          description:
            'The core testing area for hackathon judges! Open this console to run 1-click agent scenarios, view registered input schemas, and monitor latency in real time.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  });

  driverObj.drive();
}
