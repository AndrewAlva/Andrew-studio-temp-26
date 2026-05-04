// Singleton rAF loop — all scenes register callbacks here
type RafCallback = (dt: number) => void;

class RafManager {
  private callbacks = new Map<string, RafCallback>();
  private paused = false;
  private lastTime = 0;
  private frameId = 0;

  constructor() {
    // TODO: implement single rAF loop driving all registered callbacks with delta time
  }

  add(id: string, fn: RafCallback): void {
    // TODO
  }

  remove(id: string): void {
    // TODO
  }

  pause(): void {
    // TODO
  }

  resume(): void {
    // TODO
  }

  private tick(time: number): void {
    // TODO: compute dt in seconds, call all callbacks, request next frame unless paused
  }
}

export const raf = new RafManager();
