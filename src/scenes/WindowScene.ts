import * as THREE from 'three';
import { sceneManager } from './SceneManager';
import { raf } from '../utils/raf';
import { cursor } from '../utils/cursor';
import { getMood, getMoodColors } from '../utils/time';
import { prefersReducedMotion } from '../utils/motion';
import windowVert from '../shaders/window.vert?raw';
import windowFrag from '../shaders/window.frag?raw';

export class WindowScene {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  private photoPlane: THREE.Mesh | null = null;
  private gradientPlane: THREE.Mesh | null = null;
  private gradientMaterial: THREE.ShaderMaterial | null = null;
  private moodUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private canvas: HTMLCanvasElement | null = null;

  async init(canvas: HTMLCanvasElement, photoUrl: string): Promise<void> {
    // TODO:
    // 1. sceneManager.mount(canvas)
    // 2. Create full-screen PlaneGeometry for photo (fit camera frustum)
    // 3. Create gradient ShaderMaterial (window.vert / window.frag)
    // 4. Pass cursor as uMouse uniform each frame
    // 5. Pass getMoodColors() as uGradientTop / uGradientBottom
    // 6. Set up 1-minute interval to recalculate mood (smooth lerp between moods)
    // 7. Register raf callback; register resize handler
    // 8. Respect prefers-reduced-motion (no cursor blur animation)
    this.canvas = canvas;
    console.log('TODO: WindowScene.init');
  }

  private updateMoodUniforms(): void {
    // TODO: read getMoodColors(), set uniforms on gradientMaterial
  }

  private tick(_dt: number): void {
    // TODO: update uMouse from cursor singleton; render scene
  }

  destroy(): void {
    // TODO: clear interval, raf.remove, dispose, unmount
    if (this.moodUpdateInterval) clearInterval(this.moodUpdateInterval);
  }
}
