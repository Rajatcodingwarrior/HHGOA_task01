"use client";

import React, { useEffect, useState } from "react";

interface PreviewFrameProps {
  file: File | null;
  format: "pfp" | "builder_card";
  metadata: {
    name: string;
    role: string;
    teamName: string;
    age: string;
    teamMembers: string[];
  };
}

export default function PreviewFrame({ file, format, metadata }: PreviewFrameProps) {
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    // Free memory when component unmounts or file changes
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const nameDisplay = (metadata.name || "ANONYMOUS BUILDER").toUpperCase();
  const roleDisplay = (metadata.role || "BUILDER").toUpperCase();
  const teamDisplay = (metadata.teamName || "AI & FULL-STACK").toUpperCase();
  const quoteDisplay = '"I BUILD INTERFACES THAT INSPIRE"';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <span className="text-[8px] text-accent font-bold font-mono tracking-[0.25em] uppercase mb-3 animate-pulse">
        ⚡︎ LIVE RENDER PREVIEW
      </span>

      {format === "pfp" ? (
        /* ================== BEIGE RETRO BEACH PFP FRAME PREVIEW ================== */
        <div 
          className="relative w-full aspect-square overflow-hidden rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.6)] select-none border border-sand/10 bg-cover bg-center"
          style={{ backgroundImage: "url('/templates/pfp_frame_template.jpg')" }}
        >
          {/* User Photo Cutout (Position matched to 210,210 to 870,870 on 1080x1080 canvas) */}
          <div className="absolute top-[19.44%] left-[19.44%] w-[61.11%] h-[61.11%] rounded-full overflow-hidden bg-[#f7f4eb]">
            {objectUrl ? (
              <img
                src={objectUrl}
                alt="PFP Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 font-mono text-[7px] p-4 text-center leading-normal">
                <span>DRAFT IMAGE</span>
                <span className="text-[6px] opacity-70 mt-1 uppercase">[ Ingest photo at Step 2 ]</span>
              </div>
            )}
          </div>

          {/* Yellow border ring with pink tabs on top for identical rendering */}
          <div className="absolute top-[18.9%] left-[18.9%] w-[62.2%] h-[62.2%] rounded-full border-[6px] border-[#ebb614] pointer-events-none">
            {/* Pink tab corners */}
            <div className="absolute top-[3%] left-[3%] w-4.5 h-4.5 rounded-full bg-[#d81b60]" />
            <div className="absolute top-[3%] right-[3%] w-4.5 h-4.5 rounded-full bg-[#d81b60]" />
            <div className="absolute bottom-[3%] left-[3%] w-4.5 h-4.5 rounded-full bg-[#d81b60]" />
            <div className="absolute bottom-[3%] right-[3%] w-4.5 h-4.5 rounded-full bg-[#d81b60]" />
          </div>
        </div>
      ) : (
        /* ================== GREEN FOREST BUILDER CARD PREVIEW ================== */
        <div 
          className="relative w-full aspect-[4/5] overflow-hidden rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.6)] select-none border border-sand/10 bg-cover bg-center"
          style={{ backgroundImage: "url('/templates/builder_card_template.jpg')" }}
        >
          {/* User Photo Cutout (Position matched to 320,440 to 880,1000 on 1200x1500 canvas) */}
          <div className="absolute top-[29.33%] left-[26.67%] w-[46.67%] h-[37.33%] rounded-full overflow-hidden bg-[#f7f4eb]">
            {objectUrl ? (
              <img
                src={objectUrl}
                alt="Card Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center text-neutral-500 font-mono text-[7px] p-2 leading-relaxed">
                INGEST PHOTO DRAFT
              </div>
            )}
          </div>

          {/* Yellow outer outline */}
          <div className="absolute top-[28.93%] left-[26.17%] w-[47.67%] h-[38.13%] rounded-full border-[5px] border-[#ebb614] pointer-events-none" />

          {/* Live credentials text overlays positioned at exact Y coordinates */}
          
          {/* 1. Name: Y=1030 (68.67% from top) */}
          <div className="absolute top-[68.67%] inset-x-0 flex justify-center items-center pointer-events-none px-4">
            <span className="text-[#0d1e19] text-[15px] sm:text-[18px] font-extrabold tracking-wider truncate uppercase">
              {nameDisplay}
            </span>
          </div>

          {/* 2. Role: Y=1100 (73.33% from top) */}
          <div className="absolute top-[73.33%] inset-x-0 flex justify-center items-center pointer-events-none px-4">
            <span className="text-[#d81b60] font-mono text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wide leading-none">
              {roleDisplay}
            </span>
          </div>

          {/* 3. Team Name: Y=1195 (79.67% from top) */}
          <div className="absolute top-[79.67%] inset-x-0 flex justify-center items-center pointer-events-none px-4">
            <span className="text-[#0d1e19] text-[13px] sm:text-[15px] font-extrabold uppercase tracking-wider leading-none">
              {teamDisplay}
            </span>
          </div>

          {/* 4. Custom Quote / Team Members: Y=1295 (86.33% from top) */}
          <div className="absolute top-[84.67%] inset-x-0 flex justify-center items-center pointer-events-none px-4">
            {metadata.teamMembers && metadata.teamMembers.length > 0 ? (
              <div className="flex flex-col items-center leading-tight gap-[1px]">
                <span className="text-[#d81b60] font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-[2px]">
                  TEAM MEMBERS
                </span>
                <span className="text-[#0d1e19] font-mono text-[10px] sm:text-[11px] font-bold uppercase truncate max-w-[190px]">
                  {nameDisplay}
                </span>
                {metadata.teamMembers.map((member, idx) => (
                  <span key={idx} className="text-[#0d1e19] font-mono text-[10px] sm:text-[11px] font-bold uppercase truncate max-w-[190px]">
                    {member.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[#0d1e19] text-[9px] sm:text-[10px] font-mono font-bold leading-none truncate">
                {quoteDisplay}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
