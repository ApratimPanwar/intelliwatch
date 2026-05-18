# Data Adapters

Drop-in replacements for `createSimulator()` in `server.js`.

## Available Adapters

| File | Source | Status |
|------|--------|--------|
| `simulator.js` (root) | Fake jitter data | ✅ Active |
| `postgres.js` | PostgreSQL / TimescaleDB | 🔜 Planned |
| `mqtt.js` | MQTT broker (IoT devices) | 🔜 Planned |
| `csv.js` | CSV file replay | 🔜 Planned |
| `opcua.js` | OPC-UA (industrial protocol) | 🔜 Planned |

## How to Switch

In `server.js`, change:
```js
import { createSimulator } from './simulator.js';
```
to:
```js
import { createSimulator } from './adapters/postgres.js';
```

Each adapter exports the same `createSimulator()` factory with identical API:
- `tick()` → current sensor snapshot
- `getState()` → full application state
- `setThresholds(obj)` → update alert thresholds
- `ackAlert(id)` → acknowledge an alert
