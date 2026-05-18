/**
 * Singleton WebSocket connection.
 * Call useSocket() once at the App root.
 * Anywhere else, just read from the Zustand store.
 * emitAck / emitThresholds are exported as plain functions.
 */
import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:3001', { autoConnect: false });
  }
  return socket;
}

/** Call once at the app root to establish the connection. */
export function useSocket() {
  const { setConnected, patchTick, fullSync, ackAlert } = useAppStore();

  useEffect(() => {
    const s = getSocket();
    if (s.connected) return; // already connected

    s.connect();

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onTick       = (data: any) => patchTick(data);
    const onFull       = (data: any) => fullSync(data);
    const onAcked      = (id: string) => ackAlert(id);

    s.on('connect',     onConnect);
    s.on('disconnect',  onDisconnect);
    s.on('state:tick',  onTick);
    s.on('state:full',  onFull);
    s.on('alert:acked', onAcked);

    return () => {
      s.off('connect',     onConnect);
      s.off('disconnect',  onDisconnect);
      s.off('state:tick',  onTick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
      s.off('state:full',  onFull);
      s.off('alert:acked', onAcked);
    };
  }, []);
}

/** Usable anywhere without re-connecting. */
export const emitAck        = (id: string)  => getSocket().emit('alert:ack', id);
export const emitThresholds = (t: object)   => getSocket().emit('thresholds:set', t);
