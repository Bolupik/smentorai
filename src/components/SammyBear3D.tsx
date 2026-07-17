import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type BearAction = "idle" | "wave" | "talk" | "point";

interface Props {
  action?: BearAction;
  /** Wardrobe accent — brand color of the scarf/beanie */
  accent?: string;
  /** Render just the head (smaller footprint for corner/companion use) */
  headOnly?: boolean;
  /** Skip idle bob/blink loops for prefers-reduced-motion users */
  reducedMotion?: boolean;
}

/**
 * Procedural low-poly bear narrator built from Three.js primitives.
 * No external GLB required — everything is generated at runtime.
 */
const SammyBear3D = ({ action = "idle", accent = "#F97316", headOnly = false, reducedMotion = false }: Props) => {
  const group = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);

  // Palette (kept inside the file since 3D materials aren't tailwind)
  const fur = "#8B5A2B";
  const furDark = "#5C3A1A";
  const cream = "#F5E6D3";
  const nose = "#1F1912";

  // Talk = rapid mouth open/close, wave = swinging right arm, point = raised right arm, idle = calm bob
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      if (reducedMotion) {
        group.current.position.y = headOnly ? 0 : -0.25;
        group.current.rotation.y = 0;
      } else {
        group.current.position.y = Math.sin(t * 1.6) * 0.05 + (headOnly ? 0 : -0.25);
        group.current.rotation.y = Math.sin(t * 0.6) * 0.15;
      }
    }

    if (head.current && !reducedMotion) {
      head.current.rotation.z = Math.sin(t * 1.2) * 0.06;
      head.current.rotation.x = Math.sin(t * 0.9) * 0.04;
    }

    if (rightArm.current) {
      if (action === "wave") {
        rightArm.current.rotation.z = -1.4 + Math.sin(t * 8) * 0.35;
        rightArm.current.rotation.x = -0.3;
      } else if (action === "point") {
        rightArm.current.rotation.z = -1.1;
        rightArm.current.rotation.x = -0.4;
      } else if (!reducedMotion) {
        rightArm.current.rotation.z = Math.sin(t * 1.6) * 0.1 - 0.05;
        rightArm.current.rotation.x = 0;
      }
    }

    if (leftArm.current && !reducedMotion) {
      leftArm.current.rotation.z = -Math.sin(t * 1.6) * 0.1 + 0.05;
    }

    if (mouth.current) {
      if (action === "talk" && !reducedMotion) {
        const s = 0.6 + Math.abs(Math.sin(t * 12)) * 0.7;
        mouth.current.scale.set(1, s, 1);
      } else {
        mouth.current.scale.set(1, 0.35, 1);
      }
    }
  });

  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.055, 12, 12), []);
  const eyeShineGeo = useMemo(() => new THREE.SphereGeometry(0.018, 8, 8), []);

  return (
    <group ref={group} position={[0, -0.25, 0]}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color={fur} roughness={0.85} />
      </mesh>
      {/* Belly patch */}
      <mesh position={[0, 0.3, 0.42]} castShadow>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color={cream} roughness={0.9} />
      </mesh>

      {/* Scarf */}
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[0.34, 0.08, 12, 24]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>

      {/* Head group */}
      <group ref={head} position={[0, 1.05, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.48, 28, 28]} />
          <meshStandardMaterial color={fur} roughness={0.85} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.36, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={fur} roughness={0.85} />
        </mesh>
        <mesh position={[-0.36, 0.34, 0.02]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </mesh>
        <mesh position={[0.36, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={fur} roughness={0.85} />
        </mesh>
        <mesh position={[0.36, 0.34, 0.02]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={furDark} roughness={0.9} />
        </mesh>

        {/* Muzzle */}
        <mesh position={[0, -0.1, 0.38]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0.02, 0.58]}>
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshStandardMaterial color={nose} roughness={0.4} />
        </mesh>
        {/* Mouth (a small dark ellipse that scales on talk) */}
        <mesh ref={mouth} position={[0, -0.18, 0.55]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial color={nose} roughness={0.5} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.17, 0.1, 0.42]} geometry={eyeGeo}>
          <meshStandardMaterial color={nose} roughness={0.3} />
        </mesh>
        <mesh position={[0.17, 0.1, 0.42]} geometry={eyeGeo}>
          <meshStandardMaterial color={nose} roughness={0.3} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.15, 0.13, 0.475]} geometry={eyeShineGeo}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.19, 0.13, 0.475]} geometry={eyeShineGeo}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Left arm */}
      <group ref={leftArm} position={[-0.5, 0.55, 0]}>
        <mesh position={[-0.12, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.42, 8, 12]} />
          <meshStandardMaterial color={fur} roughness={0.85} />
        </mesh>
        {/* paw */}
        <mesh position={[-0.18, -0.52, 0.05]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
      </group>

      {/* Right arm (waves / points) */}
      <group ref={rightArm} position={[0.5, 0.55, 0]}>
        <mesh position={[0.12, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.42, 8, 12]} />
          <meshStandardMaterial color={fur} roughness={0.85} />
        </mesh>
        <mesh position={[0.18, -0.52, 0.05]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.22, -0.25, 0.05]} castShadow>
        <capsuleGeometry args={[0.16, 0.3, 8, 12]} />
        <meshStandardMaterial color={fur} roughness={0.85} />
      </mesh>
      <mesh position={[0.22, -0.25, 0.05]} castShadow>
        <capsuleGeometry args={[0.16, 0.3, 8, 12]} />
        <meshStandardMaterial color={fur} roughness={0.85} />
      </mesh>
      {/* Feet pads */}
      <mesh position={[-0.22, -0.45, 0.18]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color={cream} roughness={0.9} />
      </mesh>
      <mesh position={[0.22, -0.45, 0.18]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color={cream} roughness={0.9} />
      </mesh>
    </group>
  );
};

export default SammyBear3D;
