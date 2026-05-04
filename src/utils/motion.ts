export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onMotionChange(cb: (reduced: boolean) => void): void {
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => cb(e.matches));
}
