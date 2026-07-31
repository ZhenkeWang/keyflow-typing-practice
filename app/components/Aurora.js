"use client";

/**
 * Adapted from the React Bits Aurora background component.
 * Source: https://reactbits.dev/backgrounds/aurora
 * Upstream: https://github.com/DavidHDev/react-bits
 *
 * This file remains subject to the React Bits MIT + Commons Clause license.
 * It is excluded from the repository-wide MIT license. See:
 * - THIRD_PARTY_NOTICES.md
 * - licenses/REACT-BITS-LICENSE.md
 */
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float factor = smoothstep(0.0, 1.0, uv.x);
  vec3 leftMix = mix(uColorStops[0], uColorStops[1], min(factor * 2.0, 1.0));
  vec3 rampColor = mix(leftMix, uColorStops[2], max((factor - 0.5) * 2.0, 0.0));
  float height = snoise(vec2(uv.x * 1.8 + uTime * 0.08, uTime * 0.18)) * 0.5 * uAmplitude;
  height = exp(height);
  height = uv.y * 2.0 - height + 0.18;
  float intensity = 0.62 * height;
  float alpha = smoothstep(0.2 - uBlend * 0.5, 0.2 + uBlend * 0.5, intensity);
  fragColor = vec4(intensity * rampColor * alpha, alpha * 0.78);
}
`;

export default function Aurora({
  colorStops = ["#7667ff", "#47d7bf", "#5363e8"],
  amplitude = 0.9,
  blend = 0.7,
  speed = 0.35,
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio, 1.5) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const toColors = (stops) => stops.map((hex) => {
      const color = new Color(hex);
      return [color.r, color.g, color.b];
    });
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: toColors(colorStops) },
        uResolution: { value: [1, 1] },
        uBlend: { value: blend },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const render = (time) => {
      const current = propsRef.current;
      program.uniforms.uTime.value = reducedMotion ? 0 : time * 0.001 * current.speed;
      program.uniforms.uAmplitude.value = current.amplitude;
      program.uniforms.uBlend.value = current.blend;
      program.uniforms.uColorStops.value = toColors(current.colorStops);
      renderer.render({ scene: mesh });
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div className="aurora-container" ref={containerRef} aria-hidden="true" />;
}
