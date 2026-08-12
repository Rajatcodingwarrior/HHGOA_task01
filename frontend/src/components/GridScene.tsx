"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GridSceneProps {
  progress: number; // 0 to 1
  active: boolean;
}

export default function GridScene({ progress, active }: GridSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wavePlaneRef = useRef<THREE.Mesh>(null);

  // Generate surfboards/sailboats riding the waves
  const surfCount = 10;
  const surfboards = useMemo(() => {
    const arr = [];
    for (let i = 0; i < surfCount; i++) {
      const x = (Math.random() - 0.5) * 24;
      const z = (Math.random() - 0.5) * 24;
      const length = 0.95 + Math.random() * 0.35;
      const color = Math.random() > 0.5 ? "#ff5100" : "#00f0ff";
      const isCard = Math.random() > 0.5;
      arr.push({ x, z, length, color, isCard });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Deform solid ocean plane
    if (wavePlaneRef.current) {
      const geometry = wavePlaneRef.current.geometry as THREE.PlaneGeometry;
      const position = geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        // Waves deforms
        const z = Math.sin(x * 0.25 + time * 1.5) * Math.cos(y * 0.25 + time * 1.2) * 0.55;
        position.setZ(i, z);
      }
      position.needsUpdate = true;
    }

    // 2. Scene transitions
    if (groupRef.current) {
      const zOffset = (progress - 0.5) * 18;
      const yOffset = active ? -1.8 + (1 - progress) * 1.5 : -10;
      const scale = active ? (progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1) : 0.001;

      groupRef.current.position.set(0, yOffset, zOffset - 4);
      groupRef.current.scale.setScalar(Math.max(0.001, scale));
      groupRef.current.rotation.y = time * 0.015;
    }
  });

  if (!active) return null;

  const opacity = active ? Math.max(0, 1 - progress) : 0;

  return (
    <group ref={groupRef}>
      {/* Solid ocean waves with specular highlights (flatShading) */}
      <mesh ref={wavePlaneRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[35, 35, 22, 22]} />
        <meshStandardMaterial
          color="#002b49"
          roughness={0.05}
          metalness={0.6}
          flatShading
          transparent
          opacity={active ? Math.max(0, 0.95 * (1 - progress) * (progress > 0.08 ? 1 : progress / 0.08)) : 0}
        />
      </mesh>

      {/* Riding Surfboards & Sailboats */}
      {surfboards.map((board, i) => (
        <SurfboardRider key={i} board={board} progress={progress} active={active} />
      ))}
    </group>
  );
}

interface SurfStruct {
  x: number;
  z: number;
  length: number;
  color: string;
  isCard: boolean;
}

function SurfboardRider({ board, progress, active }: { board: SurfStruct; progress: number; active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const monitorRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const x = board.x;
    const z = board.z;

    // 1. Calculate wave height and slope at surfboard coordinates
    const waveY = Math.sin(x * 0.25 + time * 1.5) * Math.cos(z * 0.25 + time * 1.2) * 0.55;
    const waveXAhead = Math.sin((x + 0.25) * 0.25 + time * 1.5) * Math.cos(z * 0.25 + time * 1.2) * 0.55;
    const waveZAhead = Math.sin(x * 0.25 + time * 1.5) * Math.cos((z + 0.25) * 0.25 + time * 1.2) * 0.55;

    const slopeX = waveXAhead - waveY;
    const slopeZ = waveZAhead - waveY;

    // 2. Move and tilt surfboard to ride waves realistically
    groupRef.current.position.y = -1.8 + waveY;
    groupRef.current.rotation.x = -slopeZ * 2.2; // Pitch
    groupRef.current.rotation.z = slopeX * 2.2;  // Roll
  });

  const opacity = active ? Math.max(0, 1 - progress) : 0;

  return (
    <group ref={groupRef} position={[board.x, -1.8, board.z]}>
      {/* 3D Surfboard Mesh (Solid glossy board) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.04, board.length]} />
        <meshStandardMaterial
          color={board.color}
          roughness={0.06}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Decorative center stripe on surfboard */}
      <mesh position={[0, 0.021, 0]}>
        <boxGeometry args={[0.04, 0.002, board.length * 0.9]} />
        <meshStandardMaterial
          color={board.color === "#ff5100" ? "#00f0ff" : "#ff5100"}
          roughness={0.06}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Display screen or sailboat mast */}
      {board.isCard ? (
        /* Computer Monitor on surfboard! */
        <group position={[0, 0.2, 0]}>
          {/* Stand (Steel) */}
          <mesh position={[0, -0.09, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.16]} />
            <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Monitor back cover */}
          <mesh ref={monitorRef} castShadow>
            <boxGeometry args={[0.3, 0.2, 0.03]} />
            <meshStandardMaterial
              color="#37474f"
              roughness={0.4}
              transparent
              opacity={opacity}
            />
          </mesh>
          {/* Monitor Screen (emissive glowing front) */}
          <mesh position={[0, 0, 0.016]}>
            <boxGeometry args={[0.28, 0.18, 0.002]} />
            <meshStandardMaterial
              color="#111111"
              emissive={board.color}
              emissiveIntensity={0.8}
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>
      ) : (
        /* Low-Poly Sailboat mast and sail */
        <group position={[0, 0.05, 0]}>
          {/* Mast (Wood) */}
          <mesh position={[0, 0.3, 0.05]} castShadow>
            <cylinderGeometry args={[0.015, 0.018, 0.6]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.7} transparent opacity={opacity} />
          </mesh>
          {/* Triangular Sail (Solid Orange/Yellow) */}
          <mesh position={[0, 0.4, -0.1]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.25, 0.45, 3]} />
            <meshStandardMaterial
              color={board.color}
              roughness={0.6}
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
