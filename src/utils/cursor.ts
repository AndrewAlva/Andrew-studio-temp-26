// Singleton normalised cursor/touch position (0–1 relative to viewport)
class CursorTracker {
  x = 0.5;
  y = 0.5;

  constructor() {
    // TODO: register mousemove and touchmove listeners on window
    // On mousemove: x = e.clientX / window.innerWidth, y = e.clientY / window.innerHeight, clamped 0–1
    // On touchmove: use touches[0], same normalisation
  }
}

export const cursor = new CursorTracker();
