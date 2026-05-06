import * as THREE from 'three';

export function isDebugMode(): boolean {
  return new URLSearchParams(window.location.search).has('debug');
}

export class DebugPanel {
  private el: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private frameTimes: number[] = [];
  private frameCount = 0;
  private readonly SAMPLE = 60;
  private readonly UPDATE_EVERY = 10;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
    this.scene = scene;

    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '12px',
      right: '12px',
      zIndex: '9999',
      fontFamily: 'ui-monospace, monospace',
      fontSize: '11px',
      lineHeight: '1.7',
      padding: '10px 14px',
      background: 'rgba(0,0,0,0.72)',
      color: '#e0e0e0',
      borderRadius: '6px',
      pointerEvents: 'none',
      userSelect: 'none',
      minWidth: '180px',
      backdropFilter: 'blur(4px)',
    });
    document.body.appendChild(this.el);
  }

  update(jsMs: number): void {
    this.frameTimes.push(jsMs);
    if (this.frameTimes.length > this.SAMPLE) this.frameTimes.shift();

    this.frameCount++;
    if (this.frameCount % this.UPDATE_EVERY !== 0) return;

    const avgMs = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = avgMs > 0 ? Math.min(1000 / avgMs, 999) : 0;

    const info = this.renderer.info;
    const calls = info.render.calls;
    const tris = info.render.triangles;
    const geos = info.memory.geometries;
    const texs = info.memory.textures;
    const shaders = info.programs?.length ?? 0;

    let meshCount = 0;
    this.scene.traverse((obj) => { if ((obj as THREE.Mesh).isMesh) meshCount++; });

    const fpsColor = fps < 30 ? '#ff5555' : fps < 50 ? '#ffcc00' : '#55ff88';
    const msColor  = avgMs > 33 ? '#ff5555' : avgMs > 20 ? '#ffcc00' : '#55ff88';

    this.el.innerHTML = [
      `<span style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.08em">Performance</span>`,
      `FPS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:${fpsColor}">${fps.toFixed(1)}</span>`,
      `Frame&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:${msColor}">${avgMs.toFixed(2)} ms</span>`,
      `─────────────────`,
      `Draw calls&nbsp;<b>${calls}</b>`,
      `Triangles&nbsp;&nbsp;<b>${tris.toLocaleString()}</b>`,
      `Meshes&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${meshCount}</b>`,
      `─────────────────`,
      `Geometries&nbsp;<b>${geos}</b>`,
      `Textures&nbsp;&nbsp;&nbsp;<b>${texs}</b>`,
      `Programs&nbsp;&nbsp;&nbsp;<b>${shaders}</b>`,
    ].join('<br>');
  }

  destroy(): void {
    this.el.remove();
  }
}
