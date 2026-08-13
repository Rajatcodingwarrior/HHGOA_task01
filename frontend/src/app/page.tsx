"use client";

import { useEffect, useState, useRef } from "react";
import Lenis from "lenis";
import Experience from "@/components/Experience";
import UploadZone from "@/components/UploadZone";
import FormCard from "@/components/FormCard";
import PreviewFrame from "@/components/PreviewFrame";
import Loader from "@/components/Loader";
import EventTimer from "@/components/EventTimer";

type AppState = "IDLE" | "PHOTO_SELECTED" | "PROCESSING" | "GENERATED" | "ERROR";

export default function Home() {
  const lenisRef = useRef<any>(null);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { offset: -30, duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [format, setFormat] = useState<"pfp" | "builder_card">("pfp");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loaderStep, setLoaderStep] = useState(0);

  // Scroll states for 3D camera
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Form Metadata
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    teamName: "",
    age: "",
    teamMembers: [] as string[],
  });

  // Generated result
  const [resultData, setResultData] = useState<{
    result_id: string;
    image_url: string;
    download_url: string;
    share_url: string;
  } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const FRONTEND_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sync scroll positioning
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = window.scrollY / docHeight; // 0 to 1
      
      setScrollPercent(Math.min(100, Math.max(0, Math.round(progress * 100))));

      let section = 0;
      let subProgress = 0;

      if (progress < 0.33) {
        section = 0;
        subProgress = progress / 0.33;
      } else if (progress < 0.66) {
        section = 1;
        subProgress = (progress - 0.33) / 0.33;
      } else {
        section = 2;
        subProgress = (progress - 0.66) / 0.34;
      }

      setActiveSection(section);
      setSectionProgress(Math.min(1, Math.max(0, subProgress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg("");
    setAppState("PHOTO_SELECTED");
    
    // Auto scroll down based on format selected
    if (format === "builder_card") {
      setTimeout(() => scrollToSection("step-3"), 500);
    } else {
      setTimeout(() => scrollToSection("step-4"), 500);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultData(null);
    setErrorMsg("");
    setLoaderStep(0);
    setAppState("IDLE");
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerate = async () => {
    if (!file) {
      setErrorMsg("Please upload a photo first (Scroll to Step 2).");
      return;
    }

    if (format === "builder_card" && (!formData.name.trim() || !formData.role.trim())) {
      setErrorMsg("Name and Stack/Role are required for Builder Card.");
      return;
    }

    setAppState("PROCESSING");
    setLoaderStep(0); // 0: Scanning file

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadResponse = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: uploadForm,
      }).catch(err => {
        throw new Error("Could not connect to the backend server. Please make sure the FastAPI backend uvicorn server is running on http://127.0.0.1:8000 and the MongoDB database is active.");
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.detail || "File upload failed.");
      }

      const { original_image_id } = uploadData;
      
      setLoaderStep(1); // 1: Detecting faces
      await new Promise((r) => setTimeout(r, 650));
      setLoaderStep(2); // 2: Compositing Goa theme

      const generatePayload = {
        original_image_id,
        format,
        name: formData.name,
        role: formData.role,
        team_name: formData.teamName,
        age: formData.age ? parseInt(formData.age) : null,
        team_members: formData.teamMembers,
      };

      await new Promise((r) => setTimeout(r, 650));
      setLoaderStep(3); // 3: Rendering output PNG

      const generateResponse = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generatePayload),
      }).catch(err => {
        throw new Error("Could not connect to the backend server. Please make sure uvicorn is running on http://127.0.0.1:8000 and the MongoDB database is active.");
      });

      const generateData = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(generateData.detail || "Image generation failed.");
      }

      setResultData({
        result_id: generateData.result_id,
        image_url: `${API_BASE}${generateData.image_url}`,
        download_url: `${API_BASE}${generateData.download_url}`,
        share_url: `${FRONTEND_BASE}${generateData.share_url}`,
      });
      setAppState("GENERATED");
      setTimeout(() => scrollToSection("step-4"), 500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to compile graphic.");
      setAppState("ERROR");
    }
  };

  const handleXShare = () => {
    if (!resultData) return;
    const shareText = `Just framed my build for HH Goa 2026.\n\n#FrameInGoa\n\n`;
    const shareUrl = encodeURIComponent(resultData.share_url);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`,
      "_blank"
    );
  };

  return (
    <div className="relative w-full min-h-[300vh] bg-background text-foreground font-sans">
      
      {/* 3D WebGL Background Scene */}
      <Experience activeSection={activeSection} sectionProgress={sectionProgress} />

      {/* Floating HUD status telemetry */}
      <div className="fixed top-6 left-6 z-20 font-mono text-[9px] text-muted pointer-events-none select-none">
        <span className="text-white font-bold tracking-widest block">HH GOA '26 SYSTEM</span>
        <span>LATENCY: 12ms // COORDINATES LOADED</span>
      </div>

      <div className="fixed top-6 right-6 z-20 font-mono text-[9px] text-primary pointer-events-none select-none text-right">
        <span className="font-bold tracking-widest block glow-primary">PHASE 0{activeSection + 1}</span>
        <span className="text-white">{scrollPercent}% NAV_COORD</span>
      </div>

      {/* Main layout wrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16 pb-20">
        
        {/* LEFT COLUMN: SCROLLING CONTROLS */}
        <div className="lg:col-span-7 flex flex-col">
          
          {/* STEP 1: HERO OVERLAY (0% to 25% scroll) */}
          <section id="step-1" className="min-h-screen flex flex-col justify-center items-start pt-10">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 font-bold font-mono tracking-[0.2em] uppercase mb-3">
              HACKER HOUSE GOA · 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 uppercase leading-[1.1] glow-primary">
              FRAME <br />
              YOUR BUILD.
            </h1>

            {/* Event Countdown Timer */}
            <EventTimer />

            <p className="text-xs md:text-sm text-neutral-400 font-mono leading-relaxed mb-6 max-w-md border-l border-primary/20 pl-4 mt-2">
              Turn your photo into an HH Goa branded social badge. Show your stack, log your team, and lock in your credentials on the sand.
            </p>

            {/* Action buttons including Devfolio application link */}
            <div className="flex flex-wrap gap-4 items-center mb-12">
              <a
                href="https://hacker-house-goa-2026.devfolio.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#3770FF] text-white font-bold font-mono tracking-widest text-[9px] hover:bg-[#2c5ccb] hover:shadow-[0_0_20px_rgba(55,112,255,0.4)] transition-all uppercase rounded-sm flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                APPLY ON DEVFOLIO
              </a>
            </div>

            <div className="animate-bounce font-mono text-[9px] text-accent tracking-widest font-bold cursor-pointer" onClick={() => scrollToSection("step-2")}>
              SCROLL DOWN TO INITIATE INGESTION ↓
            </div>
          </section>

          {/* STEP 2: FILE UPLOAD & SELECT (25% to 50% scroll) */}
          <section id="step-2" className="min-h-screen flex flex-col justify-center items-start py-10 w-full">
            <div className="mb-6 w-full">
              <span className="text-[10px] text-primary font-bold font-mono tracking-widest block mb-1">
                STEP 02 // SELECTION & INGESTION
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase mb-2">
                UPLOAD PHOTO & SELECT FORMAT
              </h2>
            </div>

            {/* Selection */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6 font-mono">
              <button
                onClick={() => {
                  setFormat("pfp");
                  if (file) setTimeout(() => scrollToSection("step-4"), 400);
                }}
                className={`flex flex-col p-4 border rounded-sm text-left transition-all cursor-pointer ${
                  format === "pfp" ? "border-primary bg-primary/5 text-white" : "border-sand/15 text-muted"
                }`}
              >
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  [ PFP Frame ]
                </span>
                <span className="text-[8px] leading-normal uppercase">Square PFP borders.</span>
              </button>

              <button
                onClick={() => {
                  setFormat("builder_card");
                  if (file) setTimeout(() => scrollToSection("step-3"), 400);
                }}
                className={`flex flex-col p-4 border rounded-sm text-left transition-all cursor-pointer ${
                  format === "builder_card" ? "border-primary bg-primary/5 text-white" : "border-sand/15 text-muted"
                }`}
              >
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-1">
                  [ Builder ID ]
                </span>
                <span className="text-[8px] leading-normal uppercase">Boarding credentials pass.</span>
              </button>
            </div>

            <div className="w-full">
              <UploadZone onFileSelect={handleFileSelect} errorMsg={errorMsg} />
            </div>

            {/* Mobile-only inline preview */}
            <div className="w-full mt-6 lg:hidden">
              <PreviewFrame file={file} format={format} metadata={formData} />
            </div>
          </section>

          {/* STEP 3: DETAILS CONFIG (50% to 75% scroll) */}
          <section id="step-3" className="min-h-screen flex flex-col justify-center items-start py-10 w-full">
            <div className="mb-6 w-full">
              <span className="text-[10px] text-primary font-bold font-mono tracking-widest block mb-1">
                STEP 03 // METADATA ENGRAVING
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
                {format === "pfp" ? "PFP READY" : "ENTER CARD DETAILS"}
              </h2>
            </div>

            {format === "pfp" ? (
              <div className="p-6 border border-sand/15 bg-background-card/50 rounded-sm w-full font-mono text-[10px] text-neutral-400 leading-relaxed uppercase">
                &gt; PFP requires no text details. You are ready to compile. Scroll down to trigger generation.
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <FormCard formData={formData} setFormData={setFormData} />
                {formData.name.trim() !== "" && formData.role.trim() !== "" && (
                  <button
                    onClick={() => scrollToSection("step-4")}
                    className="w-full mt-2 py-3.5 px-6 bg-primary text-white font-mono font-bold tracking-[0.25em] text-[9px] hover:bg-primary/95 disabled:opacity-40 transition-all uppercase rounded-sm cursor-pointer border border-primary/20 hover:shadow-[0_0_15px_rgba(255,81,0,0.2)]"
                  >
                    NEXT: COMPILE HH GOA GRAPHIC &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Mobile-only inline preview */}
            <div className="w-full mt-6 lg:hidden">
              <PreviewFrame file={file} format={format} metadata={formData} />
            </div>
          </section>

          {/* STEP 4: COMPILATION & RESULT (75% to 100% scroll) */}
          <section id="step-4" className="min-h-screen flex flex-col justify-center items-start py-10 w-full">
            <div className="mb-6 w-full">
              <span className="text-[10px] text-primary font-bold font-mono tracking-widest block mb-1">
                STEP 04 // FINAL COMPILE
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
                {appState === "GENERATED" ? "BADGE SHIPPED" : "TRIGGER GENERATOR"}
              </h2>
            </div>

            {/* If idle or select */}
            {(appState === "IDLE" || appState === "PHOTO_SELECTED" || appState === "ERROR") && (
              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={handleGenerate}
                  disabled={!file}
                  className="w-full py-4 px-6 bg-primary text-white font-bold tracking-[0.25em] text-[10px] hover:bg-primary/95 disabled:opacity-40 hover:shadow-[0_0_20px_rgba(255,81,0,0.3)] transition-all uppercase rounded-sm cursor-pointer"
                >
                  COMPILE HH GOA GRAPHIC &rarr;
                </button>
                {!file && (
                  <span className="text-[8px] text-primary font-bold font-mono uppercase tracking-wider block text-center">
                    &gt; PLEASE UPLOAD A PHOTO FIRST (SCROLL UP TO STEP 2)
                  </span>
                )}
              </div>
            )}

            {/* Loader during processing */}
            {appState === "PROCESSING" && (
              <div className="w-full">
                <Loader step={loaderStep} />
              </div>
            )}

            {/* Result display on success */}
            {appState === "GENERATED" && resultData && (
              <div className="flex flex-col gap-5 p-6 border border-accent/20 bg-background-card/40 rounded-sm w-full hh-glass">
                <div>
                  <h3 className="text-white text-[12px] font-bold tracking-[0.25em] uppercase mb-1">
                    TICKET SHIPPED SUCCESSFULLY.
                  </h3>
                  <span className="text-[8px] text-muted font-mono uppercase">
                    Your HH Goa 2026 digital badge is finalized. Share on X to register your radar.
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleXShare}
                    className="w-full py-3.5 px-6 bg-accent text-background font-bold tracking-[0.25em] text-[10px] hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all uppercase rounded-sm cursor-pointer"
                  >
                    𝕏 SHARE TO X
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={resultData.download_url}
                      className="py-3 px-4 bg-transparent border border-sand/30 hover:border-sand/60 text-white font-bold text-[9px] tracking-widest text-center uppercase transition-colors rounded-sm"
                    >
                      ↓ DOWNLOAD
                    </a>
                    <button
                      onClick={handleReset}
                      className="py-3 px-4 bg-transparent border border-sand/20 hover:border-sand/40 text-muted hover:text-white font-bold text-[9px] tracking-widest uppercase transition-colors rounded-sm"
                    >
                      RESET
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile-only inline preview */}
            <div className="w-full mt-6 lg:hidden">
              {appState === "GENERATED" && resultData ? (
                <div className="border border-accent/30 rounded-sm overflow-hidden bg-background-card w-full">
                  <img src={resultData.image_url} alt="Result" className="w-full h-auto" />
                </div>
              ) : (
                <PreviewFrame file={file} format={format} metadata={formData} />
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW (lg:col-span-5) */}
        <div className="hidden lg:block lg:col-span-5 h-[80vh] sticky top-20 self-start flex items-center justify-center z-10 pointer-events-none">
          {appState === "GENERATED" && resultData ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <span className="text-[8px] text-accent font-bold tracking-widest font-mono uppercase animate-pulse">
                ✓ COMPILE SUCCESSFUL [201 CREATED]
              </span>
              <div className="relative w-full border border-accent/30 rounded-sm shadow-[0_0_40px_rgba(0,240,255,0.1)] overflow-hidden bg-background-card">
                <img
                  src={resultData.image_url}
                  alt="Final Badge"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <PreviewFrame file={file} format={format} metadata={formData} />
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-sand/10 max-w-6xl mx-auto w-full py-8 mt-12 flex flex-col md:flex-row justify-between items-center text-muted font-mono text-[8px] gap-4">
        <span>© 2026 HACKER HOUSE GOA · RESIDENCY RESORT</span>
        <div className="flex gap-4">
          <span>Less Noise. More Signal.</span>
          <span>•</span>
          <span>DEV BY ANTIGRAVITY</span>
        </div>
      </footer>

    </div>
  );
}
