"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlobeSceneProps {
  progress: number; // 0 to 1
  active: boolean;
}

export default function GlobeScene({ progress, active }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const palm1Ref = useRef<THREE.Group>(null);
  const palm2Ref = useRef<THREE.Group>(null);

  const ripples = useMemo(() => [
    { delay: 0 }, { delay: 1.5 }, { delay: 3.0 }
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Gently sway palm trees
    if (palm1Ref.current) {
      palm1Ref.current.rotation.z = Math.sin(time * 1.5) * 0.04;
      palm1Ref.current.rotation.x = Math.cos(time * 1.2) * 0.02;
    }
    if (palm2Ref.current) {
      palm2Ref.current.rotation.z = Math.cos(time * 1.3) * 0.05 + 0.15; // Sway from angled default
      palm2Ref.current.rotation.x = Math.sin(time * 1.0) * 0.03;
    }

    // 2. Animate global transitions
    if (groupRef.current) {
      const scale = active ? 1 - progress * 0.35 : 0.001;
      const posY = active ? -progress * 3.5 : -10;
      
      groupRef.current.scale.setScalar(Math.max(0.001, scale));
      groupRef.current.position.y = posY;
      groupRef.current.position.z = active ? -progress * 4 : -15;
      groupRef.current.rotation.y = time * 0.04; // Slow rotation of the island
    }
  });

  if (!active) return null;

  const opacity = active ? Math.max(0, 1 - progress) : 0;

  return (
    <group ref={groupRef}>
      {/* 1. Sand Bar Island Base (Solid Sandy Beige cylinder) */}
      <mesh position={[0, -1.0, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.8, 32]} />
        <meshStandardMaterial
          color="#f2d194"
          roughness={0.9}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 2. Concentric Wave Ripples */}
      {ripples.map((ripple, idx) => (
        <WaterRipple key={idx} delay={ripple.delay} progress={progress} active={active} />
      ))}

      {/* 3. Swaying Palm Tree 1 */}
      <group ref={palm1Ref} position={[-1.6, -0.6, -0.8]}>
        {/* Palm Trunk (Solid Brown segmented sections) */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.13, 2.4, 10]} />
          <meshStandardMaterial color="#5c3d18" roughness={0.8} transparent opacity={opacity} />
        </mesh>
        
        {/* Palm Leaves (Solid Green branching planes) */}
        <group position={[0, 2.4, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <group key={i} rotation={[0.3, angle, 0]}>
                {/* Curved leaf plane */}
                <mesh position={[0, -0.05, 0.55]} castShadow>
                  <boxGeometry args={[0.22, 0.03, 1.1]} />
                  <meshStandardMaterial color="#00c853" roughness={0.7} transparent opacity={opacity} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Swaying Palm Tree 2 (Angled / bent) */}
      <group ref={palm2Ref} position={[1.8, -0.6, -0.6]} rotation={[0, 0, 0.15]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.11, 2.0, 10]} />
          <meshStandardMaterial color="#5c3d18" roughness={0.8} transparent opacity={opacity} />
        </mesh>
        <group position={[0, 2.0, 0]}>
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <group key={i} rotation={[0.25, angle, 0]}>
                <mesh position={[0, -0.04, 0.45]} castShadow>
                  <boxGeometry args={[0.18, 0.02, 0.9]} />
                  <meshStandardMaterial color="#00c853" roughness={0.7} transparent opacity={opacity} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* 4. Hacker Desk Workspace */}
      <group position={[0, -0.6, 0.4]}>
        {/* Table Top (Solid Wood) */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.06, 0.85]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.65} transparent opacity={opacity} />
        </mesh>
        {/* Table Legs (Solid Metal) */}
        {[-0.68, 0.68].map((x, xi) => 
          [-0.35, 0.35].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0.3, z]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.6]} />
              <meshStandardMaterial color="#78909c" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
            </mesh>
          ))
        )}

        {/* 3D Solid Laptop */}
        <group position={[0, 0.65, 0]}>
          {/* Base (Metallic Gray) */}
          <mesh position={[0, 0.005, 0]} castShadow>
            <boxGeometry args={[0.34, 0.012, 0.24]} />
            <meshStandardMaterial color="#b0bec5" metalness={0.6} roughness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Keyboard panel (glowing cyan emissive) */}
          <mesh position={[0, 0.012, 0.02]}>
            <boxGeometry args={[0.3, 0.002, 0.12]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} transparent opacity={opacity} />
          </mesh>
          {/* Screen Lid (Metallic Back) */}
          <mesh position={[0, 0.11, -0.115]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.34, 0.22, 0.012]} />
            <meshStandardMaterial color="#b0bec5" metalness={0.6} roughness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Inside Screen (Dark glowing) */}
          <mesh position={[0, 0.11, -0.108]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.32, 0.2, 0.002]} />
            <meshStandardMaterial color="#111111" emissive="#00f0ff" emissiveIntensity={0.25} transparent opacity={opacity} />
          </mesh>
        </group>

        {/* 3D Solid Coconut Drink */}
        <group position={[0.48, 0.65, 0.16]}>
          {/* Shell (Dark Brown) */}
          <mesh castShadow>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color="#3e2723" roughness={0.9} transparent opacity={opacity} />
          </mesh>
          {/* Pulp (White Interior Cup) */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.07, 0.05, 0.04, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={opacity} />
          </mesh>
          {/* Straw (Solid Red) */}
          <mesh position={[0.05, 0.1, -0.02]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.007, 0.007, 0.16]} />
            <meshStandardMaterial color="#ff1744" roughness={0.5} transparent opacity={opacity} />
          </mesh>
        </group>
      </group>

      {/* 5. Solid Glowing Sunset Sun */}
      <mesh position={[0, 1.4, -3.5]}>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial
          color="#ff5100"
          transparent
          opacity={active ? Math.max(0, 0.2 * (1 - progress)) : 0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Inner Ripple component
interface RippleProps {
  delay: number;
  progress: number;
  active: boolean;
}

function WaterRipple({ delay, progress, active }: RippleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const cycle = (time + delay) % 4.5;
    const radius = 3.5 + cycle * 0.8;
    const opacityVal = active ? Math.max(0, 0.25 * (1 - radius / 7.2) * (1 - progress)) : 0;

    meshRef.current.scale.setScalar(radius / 3.5);
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.Material).opacity = opacityVal;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
      <ringGeometry args={[3.4, 3.44, 32]} />
      <meshBasicMaterial
        color="#00f0ff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
