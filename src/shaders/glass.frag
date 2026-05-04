// Fragment shader: crossfade two textures with chromatic-aberration UV distortion
// TODO: implement full logic

precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uBlend;      // 0–1 crossfade between texA and texB
uniform float uDistortion; // default 0.02 — chromatic aberration spread

varying vec2 vUv;

void main() {
  // TODO:
  // 1. Sample uTexA with per-channel UV offset (R: +uDistortion, G: 0, B: -uDistortion)
  // 2. Sample uTexB at plain vUv
  // 3. mix(texA, texB, uBlend) for crossfade output

  vec4 texA = texture2D(uTexA, vUv);
  vec4 texB = texture2D(uTexB, vUv);
  gl_FragColor = mix(texA, texB, uBlend);
}
