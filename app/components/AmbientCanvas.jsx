"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 34;

export default function AmbientCanvas({ active = true, calm = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;
    let frame;
    let lastPaint = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles = Array.from({ length: calm ? 12 : coarsePointer ? 18 : PARTICLE_COUNT }, (_, index) => ({
      x: (index * 73 % 97) / 97,
      y: (index * 47 % 89) / 89,
      size: .6 + (index % 4) * .35,
      drift: .000012 + (index % 5) * .000003,
      phase: index * .83,
    }));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(timestamp = 0) {
      if (timestamp - lastPaint < (reduceMotion || coarsePointer ? 1000 : calm ? 80 : 34)) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = timestamp;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        const y = ((particle.y + timestamp * particle.drift) % 1.08) * height - height * .04;
        const x = particle.x * width + Math.sin(timestamp * .00018 + particle.phase) * 18;
        const alpha = .08 + Math.sin(timestamp * .00045 + particle.phase) * .035;
        context.beginPath();
        context.fillStyle = `rgba(167, 169, 255, ${Math.max(.03, alpha)})`;
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
      frame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [active, calm]);

  return <canvas ref={canvasRef} className="ambient-particle-canvas" aria-hidden="true" />;
}
