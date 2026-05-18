/**
 * Lightweight toast notification system.
 */
import { useEffect, useState } from 'react';
import { create } from 'zustand';

interface Toast { id: string; message: string; type: 'success'|'warn'|'error'|'info'; }

interface ToastStore {
  toasts: Toast[];
  push: (message: string, type?: Toast['type']) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export const toast = {
  success: (m: string) => useToastStore.getState().push(m, 'success'),
  warn:    (m: string) => useToastStore.getState().push(m, 'warn'),
  error:   (m: string) => useToastStore.getState().push(m, 'error'),
  info:    (m: string) => useToastStore.getState().push(m, 'info'),
};

const STYLE: Record<Toast['type'], { barColor: string; icon: string }> = {
  success: { barColor: '#00DFB8', icon: '✓' },
  warn:    { barColor: '#FFB020', icon: '⚠' },
  error:   { barColor: '#FF4F6A', icon: '✕' },
  info:    { barColor: '#4B9FFF', icon: 'ℹ' },
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const s = STYLE[t.type];

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => setVisible(false), 3200);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div
      onClick={onDismiss}
      className={`flex items-center gap-3 pr-4 pl-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-300 min-w-[220px]
                  ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow-lg)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="w-1 self-stretch rounded-full" style={{ background: s.barColor }} />
      <span className="text-[13px]">{s.icon}</span>
      <span className="text-[12px] flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
    </div>
  );
}
