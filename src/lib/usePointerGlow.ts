import { useEffect, type RefObject } from 'react';

const BUTTON_GLOW_DISTANCE = 180;
const GLOW_TARGETS = 'button:not(.square), a[href]:not(.brand)';

export function usePointerGlow(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const updateGlow = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = container.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const horizontal = x / bounds.width - 0.5;
        const vertical = y / window.innerHeight - 0.5;

        container.style.setProperty('--pointer-x', `${x}px`);
        container.style.setProperty('--pointer-y', `${y}px`);
        container.style.setProperty('--tilt-x', `${vertical * -5}deg`);
        container.style.setProperty('--tilt-y', `${horizontal * 7}deg`);

        container.querySelectorAll<HTMLElement>(GLOW_TARGETS).forEach((button) => {
          button.classList.add('interactive-glow');
          const rect = button.getBoundingClientRect();
          const closestX = Math.max(rect.left, Math.min(event.clientX, rect.right));
          const closestY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
          const distance = Math.hypot(event.clientX - closestX, event.clientY - closestY);
          const strength = Math.max(0, 1 - distance / BUTTON_GLOW_DISTANCE);

          button.style.setProperty('--button-x', `${event.clientX - rect.left}px`);
          button.style.setProperty('--button-y', `${event.clientY - rect.top}px`);
          button.style.setProperty('--glow-strength', strength.toFixed(2));
        });
      });
    };

    const clearButtonGlow = () => {
      container.querySelectorAll<HTMLElement>(GLOW_TARGETS).forEach((button) => {
        button.classList.add('interactive-glow');
        button.style.setProperty('--glow-strength', '0');
      });
    };

    container.addEventListener('pointermove', updateGlow);
    container.addEventListener('pointerleave', clearButtonGlow);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('pointermove', updateGlow);
      container.removeEventListener('pointerleave', clearButtonGlow);
    };
  }, [containerRef]);
}
