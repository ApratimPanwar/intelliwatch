import React, { useState, useRef } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  // Positioning styles for tooltip bubble
  const positionStyle = (): React.CSSProperties => {
    switch (side) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 };
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 };
    }
  };

  // Arrow styles pointing toward the element
  const arrowStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };
    switch (side) {
      case 'top':
        return {
          ...base,
          bottom: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid var(--surface-0)',
        };
      case 'bottom':
        return {
          ...base,
          top: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '5px solid var(--surface-0)',
        };
      case 'left':
        return {
          ...base,
          right: -5,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '5px solid var(--surface-0)',
        };
      case 'right':
        return {
          ...base,
          left: -5,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: '5px solid var(--surface-0)',
        };
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            ...positionStyle(),
          }}
        >
          <div
            style={{
              position: 'relative',
              background: 'var(--surface-0)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 500,
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {content}
            <div style={arrowStyle()} />
          </div>
        </div>
      )}
    </div>
  );
}
