"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TunnelSceneProps {
  progress: number; // 0 to 1
  active: boolean;
}

export default function TunnelScene({ progress, active }: TunnelSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<THREE.Points>(null);

  // 1. Generate underwater bubbles and plankton particles (Y: 2 to -25)
  const bubbleCount = 600;
  const { positions, speeds, colors } = useMemo(() => {
    const pos = new Float32Array(bubbleCount * 3);
    const spd = new Float32Array(bubbleCount);
    const col = new Float32Array(bubbleCount * 3);

    const aquaColor = new THREE.Color("#00e5ff");
    const pinkColor = new THREE.Color("#ff1744");
    const whiteColor = new THREE.Color("#ffffff");

    for (let i = 0; i < bubbleCount; i++) {
      // Scatter within a cylinder around the descent path
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5.0;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = -Math.random() * 25; // Depth span
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      spd[i] = 1.0 + Math.random() * 2.2; // Float speed

      const roll = Math.random();
      const mixedColor = roll > 0.7 
        ? aquaColor 
        : roll > 0.45 
        ? pinkColor 
        : whiteColor;

      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return { positions: pos, speeds: spd, colors: col };
  }, []);

  // 2. Generate schools of tropical fish (swimming at Y: -1 to -7)
  const fishSchool = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const orbitRadius = 1.5 + Math.random() * 1.5;
      const speed = 0.5 + Math.random() * 0.4;
      const phase = Math.random() * Math.PI * 2;
      const depthY = -1.5 - Math.random() * 4.5;
      const size = 0.08 + Math.random() * 0.05;
      const color = Math.random() > 0.5 ? "#ff9100" : "#00f0ff"; // Orange clownfish / Cyan damsels
      arr.push({ orbitRadius, speed, phase, depthY, size, color });
    }
    return arr;
  }, []);

  // 3. Generate sea turtles (gliding at Y: -4 to -12)
  const turtles = useMemo(() => [
    { x: -2.0, z: -1.0, depthY: -4.5, speed: 0.25, size: 0.65, color: "#2e7d32" },
    { x: 1.8, z: 1.2, depthY: -10.5, speed: 0.2, size: 0.75, color: "#1b5e20" }
  ], []);

  // 4. Generate manta rays (gliding at Y: -8 to -16)
  const mantas = useMemo(() => [
    { radius: 2.2, depthY: -8.0, speed: 0.35, phase: 0, color: "#1a237e" },
    { radius: 2.6, depthY: -14.5, speed: 0.3, phase: Math.PI, color: "#311b92" }
  ], []);

  // 5. Generate sharks (swimming at Y: -7 to -15)
  const sharks = useMemo(() => [
    { radius: 3.2, depthY: -7.0, speed: 0.4, phase: 0.5 },
    { radius: 2.8, depthY: -13.0, speed: 0.35, phase: Math.PI + 0.5 }
  ], []);

  // 6. Generate deep-sea jellyfish (pulsing at Y: -15 to -24)
  const jellyfish = useMemo(() => [
    { x: -1.4, z: -0.5, depthY: -16.5, pulseSpeed: 3.0, color: "#d500f9" },
    { x: 1.2, z: -1.0, depthY: -19.0, pulseSpeed: 2.5, color: "#00e5ff" },
    { x: -0.8, z: 1.5, depthY: -22.5, pulseSpeed: 3.4, color: "#ff1744" }
  ], []);

  useFrame((state, delta) => {
    // Float bubbles upwards
    if (bubblesRef.current) {
      const geometry = bubblesRef.current.geometry;
      const posArr = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < bubbleCount; i++) {
        posArr[i * 3 + 1] += delta * speeds[i]; // Float up along Y
        if (posArr[i * 3 + 1] > 2) {
          posArr[i * 3 + 1] = -24; // Recycle to deep bottom
        }
      }
      geometry.attributes.position.needsUpdate = true;
    }

    // Scale group in active stage
    if (groupRef.current) {
      const scale = active ? 1 : 0.001;
      groupRef.current.scale.setScalar(Math.max(0.001, scale));
    }
  });

  if (!active) return null;

  const opacity = active ? Math.min(0.95, progress * 3.5) : 0;

  return (
    <group ref={groupRef}>
      {/* Plankton & Rising Bubble Spheres */}
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* DEPTH ZONE 1: TROPICAL FISH SCHOOL (Y: -1 to -7) */}
      {fishSchool.map((fish, idx) => (
        <SwimmingFish key={`fish-${idx}`} fish={fish} opacity={opacity} />
      ))}

      {/* DEPTH ZONE 1/2: SEA TURTLES (Y: -4 to -12) */}
      {turtles.map((turtle, idx) => (
        <SeaTurtleEntity key={`turtle-${idx}`} turtle={turtle} opacity={opacity} />
      ))}

      {/* DEPTH ZONE 2: SHARKS (Y: -7 to -15) */}
      {sharks.map((shark, idx) => (
        <SharkEntity key={`shark-${idx}`} shark={shark} opacity={opacity} />
      ))}

      {/* DEPTH ZONE 2/3: MANTA RAYS (Y: -8 to -16) */}
      {mantas.map((manta, idx) => (
        <MantaRayEntity key={`manta-${idx}`} manta={manta} opacity={opacity} />
      ))}

      {/* DEPTH ZONE 3: BIOLUMINESCENT JELLYFISH (Y: -15 to -24) */}
      {jellyfish.map((jelly, idx) => (
        <JellyfishEntity key={`jelly-${idx}`} jelly={jelly} opacity={opacity} />
      ))}
    </group>
  );
}

// 3D Tropical Fish school element (Swims in circles, wiggles tail)
interface FishProps {
  orbitRadius: number;
  speed: number;
  phase: number;
  depthY: number;
  size: number;
  color: string;
}

function SwimmingFish({ fish, opacity }: { fish: FishProps; opacity: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const angle = time * fish.speed + fish.phase;

    if (meshRef.current) {
      meshRef.current.position.set(
        Math.cos(angle) * fish.orbitRadius,
        fish.depthY + Math.sin(time * 2.0 + fish.phase) * 0.1, // Slight vertical drift
        Math.sin(angle) * fish.orbitRadius
      );
      // Face direction of circle path
      meshRef.current.rotation.y = -angle + Math.PI / 2;
    }

    if (tailRef.current) {
      // Fast tail wiggle
      tailRef.current.rotation.y = Math.sin(time * 11 + fish.phase) * 0.38;
    }
  });

  const isOrange = fish.color === "#ff9100";

  return (
    <group ref={meshRef} scale={fish.size}>
      {/* Main Body */}
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.12, 0.06]} />
        <meshStandardMaterial color={fish.color} roughness={0.3} transparent opacity={opacity} />
      </mesh>

      {/* Realistic Fish Markings */}
      {isOrange ? (
        /* Clownfish White Stripes */
        <>
          <mesh position={[-0.04, 0, 0]}>
            <boxGeometry args={[0.03, 0.13, 0.07]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.03, 0.13, 0.07]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} transparent opacity={opacity} />
          </mesh>
        </>
      ) : (
        /* Blue Tang Yellow tail strip */
        <mesh position={[0.05, 0.015, 0]}>
          <boxGeometry args={[0.05, 0.03, 0.07]} />
          <meshStandardMaterial color="#ffd600" roughness={0.3} transparent opacity={opacity} />
        </mesh>
      )}

      {/* Fin Tail */}
      <mesh ref={tailRef} position={[0, 0, -0.1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[0.05, 0.13, 3]} />
        <meshStandardMaterial 
          color={isOrange ? "#ff9100" : "#ffd600"} 
          roughness={0.3} 
          transparent 
          opacity={opacity} 
        />
      </mesh>
    </group>
  );
}

// 3D Sea Turtle (Solid shell, brown body, flapping flippers)
interface TurtleProps {
  x: number;
  z: number;
  depthY: number;
  speed: number;
  size: number;
  color: string;
}

function SeaTurtleEntity({ turtle, opacity }: { turtle: TurtleProps; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const flipperLRef = useRef<THREE.Mesh>(null);
  const flipperRRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Glide back and forth
      groupRef.current.position.x = turtle.x + Math.sin(time * turtle.speed) * 1.5;
      groupRef.current.position.z = turtle.z + Math.cos(time * turtle.speed * 0.8) * 0.8;
      // Tilt slightly into directions
      groupRef.current.rotation.y = Math.cos(time * turtle.speed) * 0.4;
    }

    // Flap flippers slowly
    const flap = Math.sin(time * 2.2) * 0.3;
    if (flipperLRef.current) flipperLRef.current.rotation.z = flap - 0.2;
    if (flipperRRef.current) flipperRRef.current.rotation.z = -flap + 0.2;
  });

  return (
    <group ref={groupRef} position={[turtle.x, turtle.depthY, turtle.z]} scale={turtle.size}>
      {/* Turtle Shell (Olive Green dome) */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.26, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={turtle.color} roughness={0.85} transparent opacity={opacity} />
      </mesh>
      {/* Underbelly (Yellowish-beige) */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[0.38, 0.05, 0.42]} />
        <meshStandardMaterial color="#f1ebb4" roughness={0.8} transparent opacity={opacity} />
      </mesh>
      {/* Flipper Joints/Body (Brown) */}
      <mesh position={[0, -0.07, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} transparent opacity={opacity} />
      </mesh>
      {/* Left Flipper */}
      <mesh ref={flipperLRef} position={[-0.24, -0.02, 0.1]} rotation={[0.1, 0, -0.2]} castShadow>
        <boxGeometry args={[0.22, 0.015, 0.08]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} transparent opacity={opacity} />
      </mesh>
      {/* Right Flipper */}
      <mesh ref={flipperRRef} position={[0.24, -0.02, 0.1]} rotation={[0.1, 0, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.015, 0.08]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// 3D Manta Ray (Wide flat diamond wings, flaps up/down)
interface MantaProps {
  radius: number;
  depthY: number;
  speed: number;
  phase: number;
  color: string;
}

function MantaRayEntity({ manta, opacity }: { manta: MantaProps; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const angle = time * manta.speed + manta.phase;

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(angle) * manta.radius,
        manta.depthY + Math.sin(time * 1.5) * 0.15,
        Math.sin(angle) * manta.radius
      );
      groupRef.current.rotation.y = -angle + Math.PI / 2;
      groupRef.current.rotation.x = Math.sin(time * 1.5) * 0.08; // Pitch
    }

    // Flap wide wings
    const wingFlap = Math.sin(time * 3.0) * 0.25;
    if (leftWingRef.current) leftWingRef.current.rotation.z = -wingFlap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = wingFlap;
  });

  return (
    <group ref={groupRef}>
      {/* Central Countershaded Body */}
      {/* Black Top */}
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.3, 0.03, 0.8]} />
        <meshStandardMaterial color="#0a1128" roughness={0.5} transparent opacity={opacity} />
      </mesh>
      {/* White Underbelly */}
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.8]} />
        <meshStandardMaterial color="#eceff1" roughness={0.5} transparent opacity={opacity} />
      </mesh>

      {/* Left Wing (Black top, White belly) */}
      <group position={[-0.15, 0, 0]}>
        <group ref={leftWingRef}>
          {/* Top Wing */}
          <mesh position={[-0.25, 0.008, 0]} castShadow>
            <boxGeometry args={[0.5, 0.01, 0.6]} />
            <meshStandardMaterial color="#0a1128" roughness={0.5} transparent opacity={opacity} />
          </mesh>
          {/* Belly Wing */}
          <mesh position={[-0.25, -0.008, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.6]} />
            <meshStandardMaterial color="#eceff1" roughness={0.5} transparent opacity={opacity} />
          </mesh>
        </group>
      </group>

      {/* Right Wing (Black top, White belly) */}
      <group position={[0.15, 0, 0]}>
        <group ref={rightWingRef}>
          {/* Top Wing */}
          <mesh position={[0.25, 0.008, 0]} castShadow>
            <boxGeometry args={[0.5, 0.01, 0.6]} />
            <meshStandardMaterial color="#0a1128" roughness={0.5} transparent opacity={opacity} />
          </mesh>
          {/* Belly Wing */}
          <mesh position={[0.25, -0.008, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.6]} />
            <meshStandardMaterial color="#eceff1" roughness={0.5} transparent opacity={opacity} />
          </mesh>
        </group>
      </group>

      {/* String tail (Realistic Stingray tail) */}
      <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.003, 0.5, 6]} />
        <meshStandardMaterial color="#0a1128" roughness={0.5} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// 3D Shark Entity (Elongated gray body, large wiggling tail)
interface SharkProps {
  radius: number;
  depthY: number;
  speed: number;
  phase: number;
}

function SharkEntity({ shark, opacity }: { shark: SharkProps; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const angle = time * shark.speed + shark.phase;

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(angle) * shark.radius,
        shark.depthY + Math.sin(time * 1.2) * 0.1,
        Math.sin(angle) * shark.radius
      );
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    if (tailRef.current) {
      // Vertical tail fin wiggles
      tailRef.current.rotation.y = Math.sin(time * 6.5) * 0.28;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Countershaded body */}
      {/* Slate-gray top half */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.26, 0.1, 0.9]} />
        <meshStandardMaterial color="#4a5a64" roughness={0.4} transparent opacity={opacity} />
      </mesh>
      {/* White belly bottom half */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.9]} />
        <meshStandardMaterial color="#eceff1" roughness={0.4} transparent opacity={opacity} />
      </mesh>

      {/* Pectoral side fins */}
      <mesh position={[-0.18, -0.05, 0.15]} rotation={[0.2, 0, -0.35]} castShadow>
        <boxGeometry args={[0.15, 0.015, 0.28]} />
        <meshStandardMaterial color="#4a5a64" roughness={0.4} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.18, -0.05, 0.15]} rotation={[0.2, 0, 0.35]} castShadow>
        <boxGeometry args={[0.15, 0.015, 0.28]} />
        <meshStandardMaterial color="#4a5a64" roughness={0.4} transparent opacity={opacity} />
      </mesh>

      {/* Dorsal Fin on top */}
      <mesh position={[0, 0.2, -0.05]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.2, 0.16]} />
        <meshStandardMaterial color="#4a5a64" roughness={0.4} transparent opacity={opacity} />
      </mesh>

      {/* Tail Fin behind */}
      <group position={[0, 0, -0.45]}>
        <mesh ref={tailRef} position={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.02, 0.35, 0.18]} />
          <meshStandardMaterial color="#4a5a64" roughness={0.4} transparent opacity={opacity} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Bioluminescent Jellyfish (Pulsing pink/purple translucent bell)
interface JellyProps {
  x: number;
  z: number;
  depthY: number;
  pulseSpeed: number;
  color: string;
}

function JellyfishEntity({ jelly, opacity }: { jelly: JellyProps; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const bellRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (!groupRef.current || !bellRef.current || !coreRef.current) return;

    // Slight bobbing drift
    groupRef.current.position.y = jelly.depthY + Math.sin(time * 0.8) * 0.15;
    groupRef.current.position.x = jelly.x + Math.cos(time * 0.5) * 0.15;

    // Pulse contraction scale
    const pulseFactor = Math.sin(time * jelly.pulseSpeed) * 0.15 + 0.85;
    bellRef.current.scale.set(1 + (1 - pulseFactor), pulseFactor, 1 + (1 - pulseFactor));
    coreRef.current.scale.setScalar(pulseFactor * 0.8);
  });

  return (
    <group ref={groupRef} position={[jelly.x, jelly.depthY, jelly.z]}>
      {/* Bell dome */}
      <mesh ref={bellRef} castShadow>
        <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={jelly.color}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={opacity * 0.75}
        />
      </mesh>

      {/* Bioluminescent core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color={jelly.color}
          emissive={jelly.color}
          emissiveIntensity={1.5}
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>

      {/* Tubular tentacles */}
      <group position={[0, -0.05, 0]}>
        {Array.from({ length: 4 }).map((_, idx) => {
          const angle = (idx * Math.PI) / 2;
          const xOffset = Math.cos(angle) * 0.15;
          const zOffset = Math.sin(angle) * 0.15;
          return (
            <mesh key={idx} position={[xOffset, -0.22, zOffset]} castShadow>
              <cylinderGeometry args={[0.012, 0.008, 0.45, 6]} />
              <meshStandardMaterial
                color={jelly.color}
                roughness={0.2}
                transparent
                opacity={opacity * 0.6}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
