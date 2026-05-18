import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Shows a slim banner (not full-screen block) when the WebSocket drops.
 * Dismisses automatically on reconnection.
 */
export function OfflineOverlay() {
  const connected = useAppStore(s => s.connected);
  const [showBanner, setShowBanner] = useState(false);
  const [dots, setDots] = useState('');

  // Delay showing the banner by 1.5s to avoid flash on initial load
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!connected) {
      timeout = setTimeout(() => setShowBanner(true), 1500);
    } else {
      setShowBanner(false);
    }
    return () => clearTimeout(timeout);
  }, [connected]);

  // Animated dots
  useEffect(() => {
    if (!showBanner) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-12 inset-x-0 z-[150] flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 px-5 py-2.5 mx-4 mt-2 rounded-xl
                      border border-amber/25 pointer-events-auto animate-fade-up"
           style={{
             background: 'rgba(255,176,32,0.08)',
             backdropFilter: 'blur(16px)',
             boxShadow: '0 0 24px rgba(255,176,32,0.12), 0 4px 24px rgba(0,0,0,0.4)',
           }}>
        <span className="w-2 h-2 rounded-full bg-amber animate-pulse-dot flex-shrink-0" />
        <span className="text-[12px] font-medium text-amber">
          Reconnecting to server{dots}
        </span>
        <span className="text-[11px] text-ink-tertiary">
          — Live data paused. Last values shown.
        </span>
      </div>
    </div>
  );
}
