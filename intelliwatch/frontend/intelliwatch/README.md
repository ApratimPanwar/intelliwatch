# ⬡ INTELLIWATCH

Industrial Safety & Productivity Monitoring — MSME Factory Floors

## Quick Start (Windows)

**Double-click `START.bat`** — browser opens automatically.

Or manually:
```
# Terminal 1 — backend
cd backend
node src/server.js

# Terminal 2 — frontend
cd frontend
npx vite
```
Then open http://localhost:5173

---

## Architecture

```
intelliwatch/
├── backend/                  Node.js + Express + Socket.io
│   └── src/
│       ├── server.js         WebSocket + REST API
│       ├── simulator.js      Fake sensor data (200ms jitter)
│       └── adapters/         Swap for PostgreSQL / MQTT / OPC-UA
│
├── frontend/                 React + TypeScript + Vite
│   └── src/
│       ├── store/            Zustand global state
│       ├── hooks/            useSocket (auto-syncs live data)
│       ├── components/
│       │   ├── views/        Operator / Supervisor / Owner
│       │   ├── nodebuilder/  React Flow node canvas + preview
│       │   └── widgets/      KPI, Charts, Badges, Cards
│       └── lib/utils.ts      Color map, formatters, helpers
│
└── START.bat                 One-click Windows launcher
```

---

## Connecting Real Data (Later)

1. Create `backend/src/adapters/postgres.js` implementing the same API:
   ```js
   export function createSimulator() {
     return { tick, getState, setThresholds, ackAlert };
   }
   ```
2. Change the import in `server.js`:
   ```js
   import { createSimulator } from './adapters/postgres.js';
   ```
3. Done — frontend doesn't change at all.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| UI Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Node Builder | React Flow (@xyflow/react) |
| State | Zustand |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Data | Pluggable adapters (simulator / PostgreSQL / MQTT) |
