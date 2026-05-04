precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uBlend;
uniform float uDistortion;

varying vec2 vUv;

void main() {
  // Chromatic aberration on the outgoing texture:
  // offset R and B channels horizontally in opposite directions
  float r = texture2D(uTexA, vUv + vec2(uDistortion, 0.0)).r;
  float g = texture2D(uTexA, vUv).g;
  float b = texture2D(uTexA, vUv - vec2(uDistortion, 0.0)).b;
  vec4 texA = vec4(r, g, b, 1.0);

  vec4 texB = texture2D(uTexB, vUv);

  gl_FragColor = mix(texA, texB, uBlend);
}
