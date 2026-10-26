import { useEffect, useRef } from 'react';

/** Utility classes for the ring's resting state (single source for toggling). */
const BASE_CLASSES = [
  'size-7',
  '-top-[14px]',
  '-start-[14px]',
  'border-gold/70',
];
/** Classes swapped in while hovering interactive elements. */
const ACTIVE_CLASSES = [
  'size-11',
  '-top-[22px]',
  '-start-[22px]',
  'border-accent',
];

/**
 * A minimal gold ring that trails the cursor on fine-pointer (desktop)
 * devices and swells over interactive elements.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ring = ringRef.current;
    if (!ring) return;

    ring.style.opacity = '1';

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      const active = Boolean(
        target?.closest?.('a, button, select, input, label, [role="button"]'),
      );
      ring.classList.remove(...(active ? BASE_CLASSES : ACTIVE_CLASSES));
      ring.classList.add(...(active ? ACTIVE_CLASSES : BASE_CLASSES));
    };

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      ring.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="pointer-events-none fixed -top-[14px] -start-[14px] z-[2500] size-7 rounded-full border border-gold/70 transition-all duration-[250ms] ease-theater print:hidden"
    />
  );
}
