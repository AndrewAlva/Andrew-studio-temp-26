import * as THREE from 'three';

// Singleton WebGLRenderer — shared across scenes
class SceneManager {
  renderer: THREE.WebGLRenderer | null = null;

  mount(canvas: HTMLCanvasElement): void {
    // TODO: create renderer with antialias, no alpha, high-performance powerPreference
    // setPixelRatio(Math.min(devicePixelRatio, 2)), setSize to canvas dimensions
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  unmount(): void {
    // TODO: dispose renderer
    this.renderer?.dispose();
    this.renderer = null;
  }

  resize(width: number, height: number): void {
    // TODO: update renderer size; camera aspect is updated by each scene
    this.renderer?.setSize(width, height);
  }
}

export const sceneManager = new SceneManager();
