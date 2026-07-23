"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const KEY_ROWS_3D = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "enter"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "ctrl", "opt", "cmd", "space", "cmd", "opt", "←", "↑", "↓", "→"],
];

const WIDTHS = {
  esc: 1.18,
  del: 1.35,
  tab: 1.45,
  caps: 1.62,
  enter: 1.72,
  shift: 1.82,
  fn: 1.05,
  ctrl: 1.12,
  opt: 1.08,
  cmd: 1.18,
  space: 4.45,
};

function easeInOut(value) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function KeyRow({ row, rowIndex, keyRefs }) {
  const layout = useMemo(() => {
    const gap = .08;
    const units = row.map((key) => WIDTHS[key] || 1);
    const total = units.reduce((sum, unit) => sum + unit, 0) + gap * (row.length - 1);
    let cursor = -total / 2;
    return row.map((key, index) => {
      const width = units[index];
      const item = { key, width, x: cursor + width / 2 };
      cursor += width + gap;
      return item;
    });
  }, [row]);

  return layout.map(({ key, width, x }, keyIndex) => {
    const absoluteIndex = rowIndex * 14 + keyIndex;
    return (
      <group
        key={`${rowIndex}-${keyIndex}-${key}`}
        position={[x * .48, .2, -1.52 + rowIndex * .61]}
        ref={(node) => { keyRefs.current[absoluteIndex] = node; }}
      >
        <RoundedBox args={[width * .45, .14, .48]} radius={.05} smoothness={3}>
          <meshStandardMaterial
            color="#07090d"
            metalness={.32}
            roughness={.28}
            emissive="#7794e8"
            emissiveIntensity={.025}
          />
        </RoundedBox>
      </group>
    );
  });
}

function LaptopModel({ ready, leaving, onEnter }) {
  const root = useRef();
  const lid = useRef();
  const keyRefs = useRef([]);
  const screenGlow = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const open = easeInOut((time - .42) / 1.42);
    const typingTime = time - 1.82;

    if (lid.current) {
      lid.current.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2 + .025, -.105, open);
    }

    keyRefs.current.forEach((key, index) => {
      if (!key) return;
      const local = typingTime - index * .0085;
      const press = local > 0 && local < .24 ? Math.sin((local / .24) * Math.PI) : 0;
      key.position.y = .2 - press * .08;
      const material = key.children[0]?.material;
      if (material) material.emissiveIntensity = .035 + press * .32;
    });

    if (screenGlow.current) {
      screenGlow.current.material.emissiveIntensity = THREE.MathUtils.damp(
        screenGlow.current.material.emissiveIntensity,
        time > 2.3 ? .4 : .025,
        3.2,
        delta
      );
    }

    if (root.current) {
      const fittedScale = Math.min(1.02, state.viewport.width / 10, state.viewport.height / 7.4);
      const targetScale = leaving ? fittedScale * 1.14 : fittedScale;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, targetScale, leaving ? 4.4 : 3.2, delta));
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, leaving ? 1.15 : 0, 4.2, delta);
      root.current.position.y = THREE.MathUtils.damp(
        root.current.position.y,
        leaving ? .12 : Math.sin(time * .72) * .025,
        3.4,
        delta
      );
      root.current.rotation.y = THREE.MathUtils.damp(
        root.current.rotation.y,
        leaving ? 0 : state.pointer.x * .045,
        2.6,
        delta
      );
      root.current.rotation.x = THREE.MathUtils.damp(
        root.current.rotation.x,
        leaving ? -.018 : state.pointer.y * -.02,
        2.6,
        delta
      );
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <group>
        <RoundedBox args={[8.6, .2, 5.08]} radius={.22} smoothness={5}>
          <meshPhysicalMaterial color="#b9bdc4" metalness={.94} roughness={.2} clearcoat={.82} clearcoatRoughness={.16} />
        </RoundedBox>
        <RoundedBox args={[8.18, .035, 4.7]} radius={.15} smoothness={4} position={[0, .12, -.08]}>
          <meshStandardMaterial color="#adb2ba" metalness={.9} roughness={.22} />
        </RoundedBox>

        <RoundedBox args={[.58, .018, 2.92]} radius={.12} smoothness={3} position={[-3.66, .15, -.18]}>
          <meshStandardMaterial color="#858b94" metalness={.75} roughness={.32} />
        </RoundedBox>
        <RoundedBox args={[.58, .018, 2.92]} radius={.12} smoothness={3} position={[3.66, .15, -.18]}>
          <meshStandardMaterial color="#858b94" metalness={.75} roughness={.32} />
        </RoundedBox>

        {KEY_ROWS_3D.map((row, rowIndex) => (
          <KeyRow row={row} rowIndex={rowIndex} key={rowIndex} keyRefs={keyRefs} />
        ))}

        <RoundedBox args={[4.15, .025, 1.38]} radius={.12} smoothness={4} position={[0, .16, 1.72]}>
          <meshPhysicalMaterial color="#9da3ac" metalness={.88} roughness={.24} />
        </RoundedBox>
        <RoundedBox args={[2.2, .05, .15]} radius={.07} smoothness={3} position={[0, -.03, 2.54]}>
          <meshStandardMaterial color="#777d86" metalness={.86} roughness={.25} />
        </RoundedBox>
        <mesh position={[0, .13, -2.51]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[.105, .105, 6.3, 32]} />
          <meshStandardMaterial color="#17191d" metalness={.86} roughness={.24} />
        </mesh>
      </group>

      <group ref={lid} position={[0, .08, -2.52]} rotation={[-Math.PI / 2 + .025, 0, 0]}>
        <RoundedBox args={[8.35, 5.12, .14]} radius={.23} smoothness={5} position={[0, 2.55, 0]}>
          <meshPhysicalMaterial color="#b7bbc2" metalness={.95} roughness={.18} clearcoat={.86} clearcoatRoughness={.14} />
        </RoundedBox>
        <RoundedBox args={[8.04, 4.8, .045]} radius={.17} smoothness={4} position={[0, 2.55, .09]}>
          <meshStandardMaterial color="#040506" metalness={.3} roughness={.3} />
        </RoundedBox>
        <RoundedBox
          ref={screenGlow}
          args={[7.78, 4.5, .025]}
          radius={.13}
          smoothness={4}
          position={[0, 2.55, .122]}
        >
          <meshStandardMaterial color="#09101f" emissive="#274892" emissiveIntensity={.025} roughness={.21} />
        </RoundedBox>
        <RoundedBox args={[1.02, .23, .035]} radius={.1} smoothness={4} position={[0, 4.75, .145]}>
          <meshStandardMaterial color="#020304" roughness={.22} />
        </RoundedBox>

        <Html
          transform
          center
          position={[0, 2.55, .155]}
          distanceFactor={1.02}
          zIndexRange={[120, 60]}
          style={{ pointerEvents: "auto" }}
        >
          <div className={`webgl-screen-ui ${ready ? "is-ready" : ""}`}>
            <span>KEYFLOW · FLOW STATE TRAINING</span>
            <h1>找到你的<em>击键节奏。</em></h1>
            <button
              type="button"
              disabled={!ready || leaving}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onEnter}
            >
              点击进入练习 <i>→</i>
            </button>
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function LaptopIntro({ ready, leaving, onEnter }) {
  return (
    <div className={`entry-laptop-webgl ${leaving ? "is-leaving" : ""}`}>
      <Canvas
        dpr={[1, 1.35]}
        camera={{ position: [0, 4.7, 14.2], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ camera }) => camera.lookAt(0, 1.35, 0)}
      >
        <ambientLight intensity={.86} />
        <hemisphereLight args={["#f1f4ff", "#111726", 1.45]} />
        <directionalLight position={[6, 10, 8]} intensity={2.8} color="#f5f7ff" />
        <directionalLight position={[-7, 4, 2]} intensity={1.5} color="#8293ff" />
        <pointLight position={[0, 3, -5]} intensity={14} color="#63e7c5" />
        <LaptopModel ready={ready} leaving={leaving} onEnter={onEnter} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.18, .32]} scale={[1.65, 1, 1]}>
          <circleGeometry args={[3.8, 64]} />
          <meshBasicMaterial color="#02050d" transparent opacity={.22} depthWrite={false} />
        </mesh>
      </Canvas>
      <p className="entry-webgl-caption">一台电脑，一段节奏。准备好后，从第一键开始。</p>
    </div>
  );
}
