import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createSimulator } from './simulator.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── REST: snapshot of current state ─────────────────────────────────────────
app.get('/api/state', (req, res) => res.json(simulator.getState()));
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ── REST: update thresholds at runtime ──────────────────────────────────────
app.post('/api/thresholds', (req, res) => {
  simulator.setThresholds(req.body);
  res.json({ ok: true });
});

// ── REST: acknowledge alert ──────────────────────────────────────────────────
app.post('/api/alerts/:id/ack', (req, res) => {
  const acked = simulator.ackAlert(req.params.id);
  res.json({ ok: acked });
});

// ── WebSocket ────────────────────────────────────────────────────────────────
const simulator = createSimulator();

io.on('connection', (socket) => {
  console.log(`[ws] client connected — ${socket.id}`);
  // Send full state immediately on connect
  socket.emit('state:full', simulator.getState());

  socket.on('thresholds:set', (data) => {
    simulator.setThresholds(data);
    io.emit('thresholds:updated', simulator.getThresholds());
  });

  socket.on('alert:ack', (id) => {
    simulator.ackAlert(id);
    io.emit('alert:acked', id);
  });

  socket.on('disconnect', () => {
    console.log(`[ws] client disconnected — ${socket.id}`);
  });
});

// Broadcast live sensor tick every 200 ms
setInterval(() => {
  io.emit('state:tick', simulator.tick());
}, 200);

// Broadcast full state every 5 s (for supervisor / slow-refresh views)
setInterval(() => {
  io.emit('state:full', simulator.getState());
}, 5000);

const PORT = 3001;
httpServer.listen(PORT, () =>
  console.log(`\n  ⬡ INTELLIWATCH API  →  http://localhost:${PORT}\n`)
);
