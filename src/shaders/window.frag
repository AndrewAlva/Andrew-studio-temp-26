// Fragment shader: window photo + time-of-day gradient + cursor radial blur
// TODO: implement full logic

precision highp float;

uniform sampler2D uTexture;
uniform vec3 uGradientTop;
uniform vec3 uGradientBottom;
uniform float uGradientOpacity; // default 0.4
uniform vec2 uMouse;            // normalised 0–1 cursor position
uniform float uBlurRadius;      // default 0.015

varying vec2 vUv;

void main() {
  // TODO:
  // 1. Compute 8-tap radial blur of uTexture around uMouse position
  //    - Inside cursor radius: average 8 samples at small angular offsets
  //    - Outside: sample normally; use smoothstep for transition
  // 2. Compute vertical gradient: mix(uGradientBottom, uGradientTop, vUv.y)
  // 3. Blend gradient over blurred photo at uGradientOpacity

  vec4 photo = texture2D(uTexture, vUv);
  vec3 gradient = mix(uGradientBottom, uGradientTop, vUv.y);
  vec3 blended = mix(photo.rgb, gradient, uGradientOpacity);
  gl_FragColor = vec4(blended, 1.0);
}
