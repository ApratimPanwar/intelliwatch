/**
 * Smoothly interpolates toward a target value using RAF.
 * Gives live KPI numbers a "gliding" feel instead of hard jumps.
 */
import { useRef, useState, useEffect } from 'react';

export function useAnimatedValue(target: number, speed = 0.12): number {
  const [display, setDisplay] = useState(target);
  const current = useRef(target);
  const raf = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      const delta = target - current.current;
      if (Math.abs(delta) < 0.005) {
        current.current = target;
        setDisplay(target);
        return;
      }
      current.current += delta * speed;
      setDisplay(current.current);
      raf.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, speed]);

  return display;
}
