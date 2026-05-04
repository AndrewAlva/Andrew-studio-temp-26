import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

export function loadTexture(url: string): Promise<THREE.Texture> {
  // TODO: check cache, return cached if present; otherwise load, store, and return
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url)!);
  }
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        cache.set(url, texture);
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

export async function preloadAll(urls: string[]): Promise<void> {
  // TODO: load all textures in parallel
  await Promise.all(urls.map(loadTexture));
}
