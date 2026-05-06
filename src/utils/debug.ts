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
  private readonly UPDATE_EVERY = 8;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
    this.scene = scene;

    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '9998',
      fontFamily: 'ui-monospace, "Cascadia Code", monospace',
      fontSize: '10px',
      lineHeight: '1.8',
      padding: '8px 12px',
      background: 'rgba(10,10,10,0.82)',
      color: '#c8c8c8',
      borderRadius: '0 0 6px 0',
      pointerEvents: 'none',
      userSelect: 'none',
      minWidth: '160px',
      backdropFilter: 'blur(6px)',
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
    const programs = info.programs?.length ?? 0;

    let meshes = 0, lights = 0, objects = 0;
    this.scene.traverse((obj) => {
      objects++;
      if ((obj as THREE.Mesh).isMesh) meshes++;
      if ((obj as THREE.Light).isLight) lights++;
    });

    const fpsCol  = fps < 30 ? '#ff5c5c' : fps < 50 ? '#ffd166' : '#06d6a0';
    const msCol   = avgMs > 33 ? '#ff5c5c' : avgMs > 20 ? '#ffd166' : '#06d6a0';
    const triCol  = tris > 500_000 ? '#ffd166' : '#c8c8c8';

    this.el.innerHTML = [
      `<span style="color:#555;font-size:9px;letter-spacing:.1em;text-transform:uppercase">Three.js Debug</span>`,
      `<span style="color:#555">──────────────────</span>`,
      `FPS      <span style="color:${fpsCol};font-weight:600">${fps.toFixed(1)}</span>`,
      `Frame    <span style="color:${msCol};font-weight:600">${avgMs.toFixed(2)} ms</span>`,
      `<span style="color:#555">──────────────────</span>`,
      `Calls    <span style="font-weight:600">${calls}</span>`,
      `Tris     <span style="color:${triCol};font-weight:600">${tris.toLocaleString()}</span>`,
      `Meshes   <span style="font-weight:600">${meshes}</span>`,
      `Lights   <span style="font-weight:600">${lights}</span>`,
      `Objects  <span style="font-weight:600">${objects}</span>`,
      `<span style="color:#555">──────────────────</span>`,
      `Geos     <span style="font-weight:600">${geos}</span>`,
      `Textures <span style="font-weight:600">${texs}</span>`,
      `Programs <span style="font-weight:600">${programs}</span>`,
    ].join('<br>');
  }

  destroy(): void {
    this.el.remove();
  }
}
