type RafCallback = (dt: number) => void;

class RafManager {
  private callbacks = new Map<string, RafCallback>();
  private paused = false;
  private lastTime = 0;
  private frameId = 0;

  constructor() {
    this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }

  add(id: string, fn: RafCallback): void {
    this.callbacks.set(id, fn);
  }

  remove(id: string): void {
    this.callbacks.delete(id);
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    cancelAnimationFrame(this.frameId);
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.lastTime = 0;
    this.frameId = requestAnimationFrame(this.tick);
  }

  private tick(time: number): void {
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.1) : 0;
    this.lastTime = time;
    for (const fn of this.callbacks.values()) fn(dt);
    this.frameId = requestAnimationFrame(this.tick);
  }
}

export const raf = new RafManager();
