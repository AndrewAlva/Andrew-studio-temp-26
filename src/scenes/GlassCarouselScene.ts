import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import type Stats from 'stats-gl';
import { sceneManager } from './SceneManager';
import { raf } from '../utils/raf';
import { prefersReducedMotion, onMotionChange } from '../utils/motion';
import { preloadAll, loadTexture } from '../utils/textureCache';
import glassVert from '../shaders/glass.vert?raw';
import glassFrag from '../shaders/glass.frag?raw';

export interface ProjectEntry {
  title: string;
  client: string;
  year: number;
  type: string;
  thumbnail: string;
}

// Toggle stencil clipping: true = plane only visible through glass silhouette
const USE_STENCIL_MASK = true;

export class GlassCarouselScene {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private glassMesh: THREE.Mesh | null = null;
  private backgroundPlane: THREE.Mesh | null = null;
  private planeMaterial: THREE.ShaderMaterial | null = null;
  private stencilMask: THREE.Mesh | null = null;

  private projects: ProjectEntry[] = [];
  private activeIndex = 0;

  // Drag / inertia — tweak FRICTION to taste:
  // 0 = instant snap, 0.9 = very slidey, values around 0.82–0.88 feel good
  private static readonly FRICTION = 0.9;
  private isDragging = false;
  private dragStartX = 0;
  private rotationBase = 0;   // target value at the moment the drag began
  private rotationTarget = 0; // where the drag is pointing right now
  private rotationCurrent = 0; // what the mesh is actually rendered at
  private rotationCount = 0;

  private canvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private reducedMotion = false;
  private stats: Stats | null = null;
  private onTickCallback?: (jsMs: number) => void;
  private projectChangeCallback?: (index: number) => void;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.z = 4;

    this.tick = this.tick.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  async init(canvas: HTMLCanvasElement, projects: ProjectEntry[]): Promise<void> {
    this.canvas = canvas;
    this.projects = projects;
    this.reducedMotion = prefersReducedMotion();

    // ── Renderer ────────────────────────────────────────────────────────────
    sceneManager.mount(canvas);
    const renderer = sceneManager.renderer!;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // ── Scene ────────────────────────────────────────────────────────────────
    this.scene.background = new THREE.Color(0xffffff);
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    // ── Lights ───────────────────────────────────────────────────────────────
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 4, 5);
    this.scene.add(dirLight);

    // ── Textures ─────────────────────────────────────────────────────────────
    const urls = projects.map((p) => p.thumbnail);
    if (urls.length) await preloadAll(urls);
    const firstTex = urls.length
      ? await loadTexture(urls[0])
      : new THREE.Texture();

    // ── Background plane (16:9 landscape, custom ShaderMaterial) ──────────
    this.planeMaterial = new THREE.ShaderMaterial({
      vertexShader: glassVert,
      fragmentShader: glassFrag,
      uniforms: {
        uTexA:       { value: firstTex },
        uTexB:       { value: firstTex },
        uBlend:      { value: 0.0 },
        uDistortion: { value: 0.000 }, // refraction distortion strength; tweak for more/less warping of the image under the glass
      },
    });
    // 16:9 plane, slightly larger than the glass box so it fills the view
    const planeGeo = new THREE.PlaneGeometry(2.84, 1.6); // 2.84 / 1.6 ≈ 16/9
    this.backgroundPlane = new THREE.Mesh(planeGeo, this.planeMaterial);
    this.backgroundPlane.position.z = -1;
    this.backgroundPlane.scale.setScalar(1.3);
    this.scene.add(this.backgroundPlane);

    // ── Glass box (4:3 landscape, MeshPhysicalMaterial) ──────────────────
    const glassGeo = new RoundedBoxGeometry(1.8, 1.35, 0.15, 4, 0.05); // 1.8/1.35 = 4/3
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.95,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.3,
      transparent: true,
      color: 0xffffff,
    });
    const glassMatTest = new THREE.MeshNormalMaterial({
      // wireframe: true,
    });
    this.glassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.scene.add(this.glassMesh);

    // ── Stencil mask ──────────────────────────────────────────────────────
    if (USE_STENCIL_MASK) {
      // Invisible mesh with the same silhouette as the glass.
      // Added as a child so it inherits the glass's Y rotation automatically.
      // renderOrder 0 → writes stencil first, before the plane (1) and glass (2).
      const maskMat = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilZPass: THREE.ReplaceStencilOp,
      });
      this.stencilMask = new THREE.Mesh(glassGeo, maskMat); // shares geometry
      this.stencilMask.renderOrder = 0;
      this.glassMesh.add(this.stencilMask);

      // Plane only renders where stencil = 1 (inside the glass silhouette).
      // stencilWrite must be TRUE for Three.js to enable the stencil test at all —
      // it is the master switch for all stencil operations, not just writes.
      // stencilWriteMask: 0x00 prevents any actual modification of the buffer.
      this.planeMaterial.stencilWrite = true;
      this.planeMaterial.stencilWriteMask = 0x00;
      this.planeMaterial.stencilRef = 1;
      this.planeMaterial.stencilFunc = THREE.EqualStencilFunc;
      this.planeMaterial.stencilFail = THREE.KeepStencilOp;
      this.planeMaterial.stencilZFail = THREE.KeepStencilOp;
      this.planeMaterial.stencilZPass = THREE.KeepStencilOp;
      this.backgroundPlane!.renderOrder = 1;

      // Glass renders on top of the plane
      this.glassMesh.renderOrder = 2;
    }

    // ── Initial overlay ───────────────────────────────────────────────────
    this.updateOverlay();
    // Emit once so any registered callback can set its initial state
    // (callback may not be registered yet, so index.astro calls it manually too)
    this.projectChangeCallback?.(this.activeIndex);

    // ── Input events ──────────────────────────────────────────────────────
    if (!this.reducedMotion) {
      canvas.addEventListener('pointerdown', this.onPointerDown);
      canvas.addEventListener('pointermove', this.onPointerMove);
      canvas.addEventListener('pointerup', this.onPointerUp);
      canvas.addEventListener('pointercancel', this.onPointerUp);
      canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', this.onTouchMove, { passive: true });
      canvas.addEventListener('touchend', this.onTouchEnd);
    }

    // ── Resize ────────────────────────────────────────────────────────────
    this.resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      sceneManager.resize(w, h);
    });
    this.resizeObserver.observe(canvas);

    // ── Visibility / reduced-motion ───────────────────────────────────────
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    onMotionChange((reduced) => { this.reducedMotion = reduced; });

    // ── Start loop ────────────────────────────────────────────────────────
    raf.add('glass-carousel', this.tick);
  }

  // ── Visibility ────────────────────────────────────────────────────────────

  private onVisibilityChange(): void {
    document.hidden ? raf.pause() : raf.resume();
  }

  // ── Pointer events (desktop) ──────────────────────────────────────────────

  private onPointerDown(e: PointerEvent): void {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.rotationBase = this.rotationCurrent; // anchor to what's visually there
    (this.canvas as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging || !this.canvas) return;
    this.applyDrag(e.clientX);
  }

  private onPointerUp(_e: PointerEvent): void {
    this.isDragging = false;
  }

  // ── Touch events (mobile) ─────────────────────────────────────────────────

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    this.isDragging = true;
    this.dragStartX = e.touches[0].clientX;
    this.rotationBase = this.rotationCurrent; // anchor to what's visually there
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.isDragging || e.touches.length !== 1) return;
    this.applyDrag(e.touches[0].clientX);
  }

  private onTouchEnd(_e: TouchEvent): void {
    this.isDragging = false;
  }

  // ── Drag logic ────────────────────────────────────────────────────────────

  private applyDrag(currentX: number): void {
    if (!this.canvas) return;
    // Full viewport width = one full rotation (2π)
    const sensitivity = (Math.PI * 2) / this.canvas.clientWidth;
    const newTarget = this.rotationBase + (currentX - this.dragStartX) * sensitivity;

    this.checkCrossings(this.rotationTarget, newTarget);
    this.rotationTarget = newTarget;
    // Mesh chases rotationTarget each tick via friction lerp — no animation needed here
  }

  // ── Project switching ─────────────────────────────────────────────────────

  private checkCrossings(from: number, to: number): void {
    // Trigger at 90°, 270°, 450°… (and −90°, −270°…) — every π, offset by π/2.
    // floor((r + π/2) / π) increments at those exact points in both directions.
    const HALF_PI = Math.PI / 2;
    const prevN = Math.floor((from + HALF_PI) / Math.PI);
    const nextN = Math.floor((to   + HALF_PI) / Math.PI);
    const delta = nextN - prevN;
    if (delta === 0) return;
    // Inverted: spinning right (positive delta) → previous project
    //           spinning left  (negative delta) → next project
    const direction = delta > 0 ? -1 : 1;
    for (let i = 0; i < Math.abs(delta); i++) this.advanceProject(direction);
  }

  private advanceProject(direction: 1 | -1 = 1): void {
    if (this.projects.length <= 1 || !this.planeMaterial) return;
    this.activeIndex =
      (this.activeIndex + direction + this.projects.length) % this.projects.length;
    const next = this.projects[this.activeIndex];

    loadTexture(next.thumbnail).then((tex) => {
      if (!this.planeMaterial) return;
      // texA stays as current; texB fades in
      this.planeMaterial.uniforms.uTexB.value = tex;
      this.planeMaterial.uniforms.uBlend.value = 0;

      gsap.to(this.planeMaterial.uniforms.uBlend, {
        value: 1,
        duration: 0.4,
        ease: 'power1.inOut',
        onComplete: () => {
          if (!this.planeMaterial) return;
          // Commit incoming as the new base
          this.planeMaterial.uniforms.uTexA.value = tex;
          this.planeMaterial.uniforms.uBlend.value = 0;
        },
      });
    });

    this.updateOverlay();
    this.projectChangeCallback?.(this.activeIndex);
  }

  private updateOverlay(): void {
    const p = this.projects[this.activeIndex];
    if (!p) return;
    const sel = (attr: string) =>
      document.querySelector(`[data-project-${attr}]`) as HTMLElement | null;
    const t = sel('title');
    const c = sel('client');
    const y = sel('year');
    const ty = sel('type');
    if (t) t.textContent = p.title;
    if (c) c.textContent = p.client;
    if (y) y.textContent = String(p.year);
    if (ty) ty.textContent = p.type;
  }

  // ── Public navigation API ─────────────────────────────────────────────────

  // Called by prev/next buttons. Snaps rotationTarget to the next exact
  // multiple of π in the travel direction so the glass always settles
  // face-on to the camera, regardless of where a mid-drag left it.
  // direction  1 = next  → decreasing target (left spin)
  // direction -1 = prev  → increasing target (right spin)
  navigate(direction: 1 | -1): void {
    if (!this.reducedMotion) {
      // A tiny epsilon nudges us off exact multiples so floor/ceil always
      // step at least one position when already face-on.
      const EPS = 1e-9;
      if (direction === 1) {
        this.rotationTarget = Math.floor((this.rotationTarget - (Math.PI / 2)) / Math.PI - EPS) * Math.PI;
      } else {
        this.rotationTarget = Math.ceil((this.rotationTarget + (Math.PI / 2)) / Math.PI + EPS) * Math.PI;
      }
    }
    this.advanceProject(direction);
  }

  setProjectChangeCallback(cb: (index: number) => void): void {
    this.projectChangeCallback = cb;
  }

  // ── Debug helpers ─────────────────────────────────────────────────────────

  setStats(stats: Stats | null): void {
    this.stats = stats;
  }

  setTickCallback(cb: (jsMs: number) => void): void {
    this.onTickCallback = cb;
  }

  getRenderer(): THREE.WebGLRenderer | null {
    return sceneManager.renderer;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  // ── Render loop ───────────────────────────────────────────────────────────

  private tick(dt: number): void {
    // Friction-based lerp — frame-rate independent via Math.pow normalisation.
    // FRICTION is the fraction of distance kept per frame at 60 fps;
    // Math.pow spreads it correctly across any dt so 30/60/120 Hz all feel alike.
    if (this.glassMesh) {
      const alpha = 1 - Math.pow(GlassCarouselScene.FRICTION, dt * 60);
      this.rotationCurrent += (this.rotationTarget - this.rotationCurrent) * alpha;
      this.glassMesh.rotation.y = this.rotationCurrent;
    }

    this.stats?.begin();
    sceneManager.renderer?.render(this.scene, this.camera);
    this.stats?.end();
    this.stats?.update();
    this.onTickCallback?.(dt * 1000);
    this.updateRotationCounter();
  }

  private updateRotationCounter(): void {
    const el = document.getElementById('rotation-counter');
    if (!el || !this.glassMesh) return;
    const deg = Math.round(this.glassMesh.rotation.y * (180 / Math.PI));
    if (deg !== this.rotationCount) {
      this.rotationCount = deg;
      el.textContent = `${deg}°`;
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  destroy(): void {
    raf.remove('glass-carousel');
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.onPointerDown);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerup', this.onPointerUp);
      this.canvas.removeEventListener('pointercancel', this.onPointerUp);
      this.canvas.removeEventListener('touchstart', this.onTouchStart);
      this.canvas.removeEventListener('touchmove', this.onTouchMove);
      this.canvas.removeEventListener('touchend', this.onTouchEnd);
    }

    this.glassMesh?.geometry.dispose();
    (this.glassMesh?.material as THREE.Material | undefined)?.dispose();
    (this.stencilMask?.material as THREE.Material | undefined)?.dispose();
    this.backgroundPlane?.geometry.dispose();
    this.planeMaterial?.dispose();
    sceneManager.unmount();
  }
}
