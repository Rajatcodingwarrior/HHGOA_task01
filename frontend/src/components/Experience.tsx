"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import GlobeScene from "./GlobeScene";
import GridScene from "./GridScene";
import TunnelScene from "./TunnelScene";
import PostProcessingEffects from "./PostProcessingEffects";

interface ExperienceProps {
  activeSection: number;
  sectionProgress: number;
}

// Subcomponent in the Canvas to handle smooth camera path movements
function CameraController({ activeSection, sectionProgress }: ExperienceProps) {
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();

    // 1. Establish Camera Paths
    if (activeSection === 0) {
      // Phase 1: Rotate around the Beach Island
      const angle = sectionProgress * Math.PI * 0.35 + 0.5;
      targetPos.set(Math.sin(angle) * 7.5, 1.8, Math.cos(angle) * 7.5);
      targetLook.set(0, -0.2, 0);
    } else if (activeSection === 1) {
      // Phase 2: Pan low over deforming ocean wave grid
      targetPos.set(0, 0.45, 9.5 - sectionProgress * 7);
      targetLook.set(0, -0.4, -20);
    } else {
      // Phase 3: Sink vertically downwards into the deep sea abyss
      targetPos.set(0, -sectionProgress * 22, 3.8);
      targetLook.set(0, -sectionProgress * 22 - 3, 0);
    }

    // Smoothly lerp camera position and focus target vectors
    state.camera.position.lerp(targetPos, 0.055);
    currentTarget.current.lerp(targetLook, 0.055);
    state.camera.lookAt(currentTarget.current);

    // 2. Dynamically interpolate Fog Color & Density based on depth
    if (state.scene.fog) {
      const fogExp = state.scene.fog as THREE.FogExp2;
      
      if (activeSection === 0 || activeSection === 1) {
        // Deep Teal surface fog
        const startColor = new THREE.Color("#00283d");
        fogExp.color.lerp(startColor, 0.06);
        fogExp.density = 0.045;
      } else {
        // Deepening Abyss Fog transition
        const deepTeal = new THREE.Color("#00283d"); // Y = 0 (66% scroll)
        const navyBlue = new THREE.Color("#072a45"); // Y = -11 (83% scroll)
        const midnight = new THREE.Color("#0b1f36"); // Y = -22 (100% scroll)

        let targetColor = new THREE.Color();
        if (sectionProgress < 0.5) {
          // Fade from Deep Teal to Navy
          targetColor.copy(deepTeal).lerp(navyBlue, sectionProgress * 2);
        } else {
          // Fade from Navy to Midnight Abyss
          targetColor.copy(navyBlue).lerp(midnight, (sectionProgress - 0.5) * 2);
        }

        fogExp.color.lerp(targetColor, 0.06);
        fogExp.density = 0.045 + sectionProgress * 0.04; // Fog thickens as you sink
      }
    }
  });

  return null;
}

export default function Experience({ activeSection, sectionProgress }: ExperienceProps) {
  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-[radial-gradient(circle_at_top,#0c3854_0%,#051d2e_50%,#020f1a_100%)] pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 7.5], fov: 60, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        {/* Dynamic fog attached to the scene */}
        <fogExp2 attach="fog" args={["#002233", 0.045]} />

        {/* Ambient and sun lights */}
        <ambientLight intensity={0.65} />
        
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={30}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />

        {/* Core point reflection lights */}
        <pointLight position={[0, -2, -5]} intensity={1.2} color="#00f0ff" />
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#ff5100" />

        {/* 3D Sun Shafts / God Rays in the water column */}
        <GodRays active={activeSection === 2} progress={sectionProgress} />

        {/* Phase 1: Solid Beach Island */}
        <GlobeScene
          progress={activeSection === 0 ? sectionProgress : 0}
          active={activeSection === 0}
        />

        {/* Phase 2: Shaded Low-Poly Ocean waves */}
        <GridScene
          progress={activeSection === 1 ? sectionProgress : 0}
          active={activeSection === 1}
        />

        {/* Phase 3: Deep Sea Descent (Water Animals & Abyss) */}
        <TunnelScene
          progress={activeSection === 2 ? sectionProgress : 0}
          active={activeSection === 2}
        />

        {/* Camera Controller */}
        <CameraController activeSection={activeSection} sectionProgress={sectionProgress} />

        {/* Cinematic post processing */}
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
}

// Procedural God Rays (Light Shafts) filtering down through water
function GodRays({ active, progress }: { active: boolean; progress: number }) {
  const meshLRef = useRef<THREE.Mesh>(null);
  const meshRRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle swaying of the light shafts in water currents
    if (meshLRef.current) {
      meshLRef.current.rotation.z = Math.sin(time * 0.8) * 0.05 - 0.1;
      meshLRef.current.rotation.x = Math.cos(time * 0.5) * 0.03;
    }
    if (meshRRef.current) {
      meshRRef.current.rotation.z = Math.cos(time * 0.7) * 0.04 + 0.1;
      meshRRef.current.rotation.x = Math.sin(time * 0.6) * 0.03;
    }
  });

  if (!active) return null;

  // Rays fade out as camera descends into the dark Midnight zone (progress > 0.6)
  const opacity = Math.max(0, 0.08 * (1 - progress * 1.5));

  return (
    <group position={[0, -progress * 22, 0]}>
      {/* Light Shaft 1 (Left) */}
      <mesh ref={meshLRef} position={[-2.5, 4, -2]} rotation={[0, 0, -0.1]}>
        <coneGeometry args={[1.5, 12, 16, 1, true]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Light Shaft 2 (Right) */}
      <mesh ref={meshRRef} position={[2.5, 4, -3]} rotation={[0, 0, 0.1]}>
        <coneGeometry args={[1.8, 12, 16, 1, true]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={opacity * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
