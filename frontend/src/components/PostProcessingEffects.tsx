"use client";

import { EffectComposer, Bloom, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

export default function PostProcessingEffects() {
  return (
    <EffectComposer>
      {/* Intense glow for sunset/aqua neon outlines */}
      <Bloom
        luminanceThreshold={0.08}
        luminanceSmoothing={0.8}
        intensity={1.5}
        mipmapBlur
      />
      {/* Cinematic noise for pixel/film grain textures */}
      <Noise
        opacity={0.045}
        blendFunction={BlendFunction.OVERLAY}
      />
      {/* Subtle lens chromatic aberration (RGB fringe) */}
      <ChromaticAberration
        offset={new Vector2(0.0012, 0.0012)}
      />
    </EffectComposer>
  );
}
