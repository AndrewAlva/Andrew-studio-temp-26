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
      stencil: true, // explicit — default changed to false in Three.js r152+
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // false = don't override the canvas's CSS width/height
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }

  unmount(): void {
    this.renderer?.dispose();
    this.renderer = null;
  }

  resize(width: number, height: number): void {
    this.renderer?.setSize(width, height, false);
  }
}

export const sceneManager = new SceneManager();
