// prefers-reduced-motion helpers
export function prefersReducedMotion(): boolean {
  // TODO: return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return false;
}

export function onMotionChange(cb: (reduced: boolean) => void): void {
  // TODO: register MediaQueryList 'change' listener; call cb with new state
}
