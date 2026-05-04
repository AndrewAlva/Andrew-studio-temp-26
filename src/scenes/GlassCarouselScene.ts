import * as THREE from 'three';
import gsap from 'gsap';
import { sceneManager } from './SceneManager';
import { raf } from '../utils/raf';
import { prefersReducedMotion, onMotionChange } from '../utils/motion';
import { preloadAll, loadTexture } from '../utils/textureCache';
import glassVert from '../shaders/glass.vert?raw';
import glassFrag from '../shaders/glass.frag?raw';

interface ProjectEntry {
  title: string;
  client: string;
  year: number;
  type: string;
  thumbnail: string;
}

export class GlassCarouselScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  private glassMesh: THREE.Mesh | null = null;
  private backgroundPlane: THREE.Mesh | null = null;
  private planeMaterial: THREE.ShaderMaterial | null = null;
  private projects: ProjectEntry[] = [];
  private activeIndex = 0;
  private rotationTarget = 0;
  private rotationCurrent = 0;
  private lastCrossing = 0;
  private canvas: HTMLCanvasElement | null = null;

  async init(canvas: HTMLCanvasElement, projects: ProjectEntry[]): Promise<void> {
    // TODO:
    // 1. sceneManager.mount(canvas)
    // 2. Set up scene, camera, lights
    // 3. Create RoundedBoxGeometry glass mesh with MeshPhysicalMaterial
    // 4. Create PlaneGeometry background with ShaderMaterial (glass.vert / glass.frag)
    // 5. Preload all thumbnails with preloadAll()
    // 6. Set scene.background = new THREE.Color(0xffffff)
    // 7. Bind pointer/touch events for drag rotation
    // 8. Register resize handler
    // 9. Register raf callback
    // 10. Respect prefers-reduced-motion
    this.canvas = canvas;
    this.projects = projects;
    console.log('TODO: GlassCarouselScene.init');
  }

  private advanceProject(): void {
    // TODO: increment activeIndex (wrapping), swap planeMaterial textures, animate uBlend 0→1 over 400ms
  }

  private updateOverlay(): void {
    // TODO: update DOM elements with data-project-* attributes from active project
  }

  private onPointerDown(_e: PointerEvent): void {
    // TODO
  }

  private onPointerMove(_e: PointerEvent): void {
    // TODO: accumulate drag delta; use gsap.to to lerp rotation
  }

  private onPointerUp(_e: PointerEvent): void {
    // TODO
  }

  private tick(_dt: number): void {
    // TODO: render scene; check rotation crossings to advance project
  }

  destroy(): void {
    // TODO: raf.remove, dispose geometries/materials/textures, unmount
  }
}
