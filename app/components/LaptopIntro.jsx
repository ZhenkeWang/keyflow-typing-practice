"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
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
        position={[x * .48, .34, -1.52 + rowIndex * .61]}
        ref={(node) => { keyRefs.current[absoluteIndex] = node; }}
      >
        <RoundedBox args={[width * .45, .19, .48]} radius={.055} smoothness={3}>
          <meshStandardMaterial
            color="#10151e"
            metalness={.48}
            roughness={.34}
            emissive="#5577c8"
            emissiveIntensity={.035}
          />
        </RoundedBox>
        <Html
          transform
          center
          position={[0, .106, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          distanceFactor={4.7}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span className="webgl-key-label">{key}</span>
        </Html>
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
      key.position.y = .34 - press * .105;
      const material = key.children[0]?.material;
      if (material) material.emissiveIntensity = .035 + press * .32;
    });

    if (screenGlow.current) {
      screenGlow.current.material.emissiveIntensity = THREE.MathUtils.damp(
        screenGlow.current.material.emissiveIntensity,
        time > 2.3 ? .62 : .04,
        3.2,
        delta
      );
    }

    if (root.current) {
      const fittedScale = Math.min(1.32, state.viewport.width / 9);
      const targetScale = leaving ? fittedScale * 1.72 : fittedScale;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, targetScale, leaving ? 3.8 : 2.8, delta));
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, leaving ? 4.8 : 0, 3.6, delta);
      root.current.position.y = THREE.MathUtils.damp(
        root.current.position.y,
        leaving ? .65 : Math.sin(time * .72) * .045,
        3.4,
        delta
      );
      root.current.rotation.y = THREE.MathUtils.damp(
        root.current.rotation.y,
        leaving ? 0 : state.pointer.x * .09,
        2.6,
        delta
      );
      root.current.rotation.x = THREE.MathUtils.damp(
        root.current.rotation.x,
        leaving ? -.035 : state.pointer.y * -.035,
        2.6,
        delta
      );
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <group>
        <RoundedBox args={[8.75, .36, 5.35]} radius={.24} smoothness={5}>
          <meshPhysicalMaterial color="#59616f" metalness={.92} roughness={.23} clearcoat={.7} clearcoatRoughness={.22} />
        </RoundedBox>
        <RoundedBox args={[8.15, .08, 4.66]} radius={.15} smoothness={4} position={[0, .22, -.08]}>
          <meshStandardMaterial color="#202633" metalness={.62} roughness={.36} />
        </RoundedBox>

        {KEY_ROWS_3D.map((row, rowIndex) => (
          <KeyRow row={row} rowIndex={rowIndex} key={rowIndex} keyRefs={keyRefs} />
        ))}

        <RoundedBox args={[3.15, .035, 1.2]} radius={.12} smoothness={4} position={[0, .285, 1.82]}>
          <meshPhysicalMaterial color="#68717f" metalness={.82} roughness={.31} />
        </RoundedBox>
        <mesh position={[0, .05, 2.69]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[.65, 1.9, 8, 24]} />
          <meshStandardMaterial color="#252b36" metalness={.8} roughness={.28} />
        </mesh>
      </group>

      <group ref={lid} position={[0, .08, -2.62]} rotation={[-Math.PI / 2 + .025, 0, 0]}>
        <RoundedBox args={[8.45, 5.18, .24]} radius={.25} smoothness={5} position={[0, 2.55, 0]}>
          <meshPhysicalMaterial color="#515967" metalness={.94} roughness={.2} clearcoat={.85} clearcoatRoughness={.18} />
        </RoundedBox>
        <RoundedBox
          ref={screenGlow}
          args={[7.92, 4.65, .055]}
          radius={.16}
          smoothness={4}
          position={[0, 2.55, .145]}
        >
          <meshStandardMaterial color="#0b1121" emissive="#304e9e" emissiveIntensity={.04} roughness={.24} />
        </RoundedBox>
        <mesh position={[0, 4.73, .19]}>
          <sphereGeometry args={[.035, 18, 18]} />
          <meshStandardMaterial color="#05070b" roughness={.2} />
        </mesh>

        <Html
          transform
          center
          position={[0, 2.55, .19]}
          distanceFactor={1.22}
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
        dpr={[1, 1.7]}
        camera={{ position: [0, 5.6, 12.6], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <ambientLight intensity={.72} />
        <hemisphereLight args={["#dbe6ff", "#10131e", 1.6]} />
        <spotLight
          castShadow
          position={[7, 11, 8]}
          intensity={65}
          angle={.36}
          penumbra={.78}
          decay={2}
          color="#e8eeff"
        />
        <spotLight position={[-8, 6, 3]} intensity={38} angle={.48} penumbra={1} decay={2} color="#7c8fff" />
        <pointLight position={[0, 2, -7]} intensity={22} color="#5ee9c5" />
        <LaptopModel ready={ready} leaving={leaving} onEnter={onEnter} />
        <ContactShadows position={[0, -.31, 0]} opacity={.5} scale={13} blur={2.9} far={7} color="#030714" />
        <Environment resolution={96}>
          <Lightformer form="rect" intensity={4} color="#dfe8ff" position={[0, 8, 4]} scale={[12, 6, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#7585ff" position={[-7, 3, 1]} rotation={[0, Math.PI / 2, 0]} scale={[8, 4, 1]} />
          <Lightformer form="ring" intensity={2} color="#5ee9c5" position={[6, 2, -4]} scale={5} />
        </Environment>
      </Canvas>
      <p className="entry-webgl-caption">一台电脑，一段节奏。准备好后，从第一键开始。</p>
    </div>
  );
}
