"use client";

import { useEffect, useState } from "react";

interface LoaderProps {
  step: number; // 0, 1, 2, 3
}

export default function Loader({ step }: LoaderProps) {
  const messages = [
    "SCANNING PHOTO DATA & EXIF ALIGNMENT...",
    "DETECTING FACIAL FOCUS COORDINATES...",
    "LAYERING GOA PALM CONTOURS & SUNSETS...",
    "COMPILING PNG CREDENTIAL FILE...",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-primary/25 bg-background-card/90 rounded-sm w-full max-w-md mx-auto text-center font-mono hh-glass relative overflow-hidden">
      {/* Laser scanner effect */}
      <div className="absolute inset-x-0 h-[1.5px] bg-primary/70 top-0 animate-[bounce_3s_infinite_linear] shadow-[0_0_8px_var(--hh-primary)] pointer-events-none" />

      <div className="relative mb-8 w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] text-primary animate-pulse font-bold font-mono">GOA</span>
      </div>

      <h3 className="text-white text-[11px] font-bold tracking-widest uppercase mb-4 glow-primary">
        TRANSMITTING ENCRYPTED MATRIX
      </h3>

      <div className="w-full flex flex-col gap-2.5 text-left text-[9px] border border-sand/10 p-4 bg-black/40 rounded-sm">
        {messages.map((msg, index) => {
          let status = "[ WAITING ]";
          let textColor = "text-muted";
          
          if (step > index) {
            status = "[ DONE ]";
            textColor = "text-accent";
          } else if (step === index) {
            status = "[ COMPILING ]";
            textColor = "text-primary animate-pulse";
          }

          return (
            <div key={index} className={`flex justify-between items-center ${textColor} font-bold font-mono`}>
              <span className="truncate max-w-[250px]">&gt; {msg}</span>
              <span className="whitespace-nowrap shrink-0">{status}</span>
            </div>
          );
        })}
      </div>

      <span className="text-[8px] text-muted font-bold tracking-wider mt-4">
        LESS NOISE. MORE SIGNAL. // PORT_8000
      </span>
    </div>
  );
}
