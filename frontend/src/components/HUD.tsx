"use client";

import { useEffect, useState } from "react";

interface HUDProps {
  activeSection: number; // 0: Orbit, 1: Grid, 2: Tunnel
}

export default function HUD({ activeSection }: HUDProps) {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [time, setTime] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [connectionPulse, setConnectionPulse] = useState(true);

  // Form submission state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Calculate scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = (window.scrollY / docHeight) * 100;
      setScrollPercent(Math.min(100, Math.max(0, Math.round(progress))));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update real-time system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().split("T")[1].slice(0, 8));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate scrolling simulated log lines
  useEffect(() => {
    const logPool = [
      "SYNCHRONIZING ORBITAL SATELLITES...",
      "FETCHING AI NODES FROM GROUND STATION...",
      "ESTABLISHING SECURE GLSL LAYER...",
      "STREAMING METRIC PACKETS - CHUNK #4A9B",
      "INTEGRATING NEURAL DATA TOPOLOGY...",
      "BUFFER COMPLETED [200 OK]",
      "OPTIMIZING SHADER RENDER PASSES...",
      "DEEP TUNNEL CONNECTOR: STABLE",
      "PIPELINE INGESTION RATE: 4.8 GB/S",
      "VIRTUAL GRID COORDINATES LOCKED",
      "SATELLITE COMPILING LOCAL TELEMETRY...",
      "REALLOCATING COMPUTE INSTANCES...",
    ];

    // Seed initial logs
    setSystemLogs(
      Array.from({ length: 12 }, () => logPool[Math.floor(Math.random() * logPool.length)])
    );

    const interval = setInterval(() => {
      setSystemLogs((prev) => [
        ...prev.slice(1),
        logPool[Math.floor(Math.random() * logPool.length)],
      ]);
      setConnectionPulse((p) => !p);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Submit email lead to FastAPI backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatusMsg("INPUT REQUIRED");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    // Append initiation logs
    setSystemLogs((prev) => [
      ...prev.slice(2),
      "CONNECTING TO API PORT 8000...",
      "SUBMITTING PAYLOAD FOR VALIDATION...",
    ]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setSystemLogs((prev) => [
          ...prev.slice(2),
          `TRANSMISSION COMPLETE: 201 CREATED`,
          `SUBSCRIBED ADDRESS: ${email.toUpperCase()}`,
        ]);
        setStatusMsg("SUBSCRIBED!");
        setEmail("");
      } else {
        const errorDetail = data.detail || "TRANSMISSION_FAILED";
        setSystemLogs((prev) => [
          ...prev.slice(2),
          `REJECTED PACKET: ${errorDetail}`,
        ]);
        setStatusMsg(errorDetail === "EMAIL_ALREADY_SUBSCRIBED" ? "ALREADY SIGNED" : "INVALID FORMAT");
      }
    } catch (error) {
      setSystemLogs((prev) => [
        ...prev.slice(2),
        "FATAL: HANDSHAKE FAILED. BACKEND OFFLINE.",
        "CHECK PYTHON SERVER AT PORT 8000.",
      ]);
      setStatusMsg("CONNECT FAILED");
    } finally {
      setLoading(false);
    }
  };

  const sectionNames = [
    "01 // ORBITAL TELEMETRY",
    "02 // NEURAL CLUSTERING",
    "03 // DATASTREAM PIPELINE",
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 font-mono text-[10px] text-foreground/80 select-none scanlines">
      {/* HEADER HUD */}
      <header className="pointer-events-auto flex items-start justify-between w-full hud-glass p-4 rounded-sm border border-neon-cyan/20">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.3em] text-white glow-cyan">
              EDOLUS<span className="text-neon-cyan animate-pulse">_</span>
            </span>
            <span className="text-[8px] text-neon-cyan/60 tracking-wider">
              AI INFRASTRUCTURE JOURNEY
            </span>
          </div>
          <div className="h-6 w-[1px] bg-neon-cyan/20" />
          <div className="flex flex-col">
            <span className="text-[8px] text-neutral-400">CORE STATUS</span>
            <span className="flex items-center gap-1.5 font-bold text-neon-cyan">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  connectionPulse ? "bg-neon-cyan" : "bg-neon-cyan/40"
                } transition-all duration-300 shadow-[0_0_8px_var(--neon-cyan)]`}
              />
              SYSTEM LINK: ACTIVE
            </span>
          </div>
        </div>

        {/* Center telemetry */}
        <div className="hidden md:flex items-center gap-6 text-[8px] text-neutral-400">
          <div className="flex flex-col items-end">
            <span>GRID SYSTEM</span>
            <span className="font-bold text-white font-mono">NODE_VX_902</span>
          </div>
          <div className="flex flex-col items-end">
            <span>FPS</span>
            <span className="font-bold text-white font-mono">60.0 // R3F</span>
          </div>
          <div className="flex flex-col items-end">
            <span>LATENCY</span>
            <span className="font-bold text-neon-green font-mono">12 MS</span>
          </div>
        </div>

        {/* Right side metrics */}
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-[8px] text-neutral-400">UTC CLOCK</span>
            <span className="font-bold text-white tracking-widest">{time || "00:00:00"}</span>
          </div>
          <div className="h-6 w-[1px] bg-neon-cyan/20" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-neutral-400">RENDER</span>
            <span className="font-bold text-neon-orange">WEBGL_2.0</span>
          </div>
        </div>
      </header>

      {/* MID SECTION - HUD BORDERS AND RETICLES */}
      <div className="flex-1 flex justify-between my-4 relative">
        {/* Left Telemetry Sidebar */}
        <aside className="pointer-events-auto w-56 hud-glass p-3 rounded-sm border border-neon-cyan/15 flex flex-col justify-between hidden md:flex h-[60vh] self-center">
          <div className="flex flex-col gap-2 flex-1 justify-between mb-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between border-b border-neon-cyan/20 pb-1 text-white font-bold text-[8px]">
                <span>[SYSTEM LOG TELEMETRY]</span>
                <span className="text-neon-cyan animate-pulse">REC</span>
              </div>
              {/* Scrollable logs */}
              <div className="h-[120px] overflow-hidden relative text-[8px] leading-relaxed text-neon-cyan/70 font-mono">
                <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-end">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="truncate">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email form backend hook */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-1 border-t border-neon-cyan/15 pt-2">
              <span className="text-[7px] text-neutral-400 font-bold uppercase tracking-wider">
                SECURE DATA INGESTION
              </span>
              <div className="flex items-center gap-1 border border-neon-cyan/25 bg-background-dark/40 px-1 py-1 rounded-sm focus-within:border-neon-cyan transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter telemetry email..."
                  className="w-full bg-transparent text-[8px] text-white focus:outline-none placeholder-neutral-600 font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-1.5 py-0.5 border border-neon-cyan/40 text-[7px] text-neon-cyan font-bold hover:bg-neon-cyan/10 transition-colors uppercase disabled:opacity-40"
                  disabled={loading}
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
              {statusMsg && (
                <span className="text-[7px] text-neon-orange font-bold tracking-wider mt-0.5 font-mono">
                  &gt;&gt; {statusMsg}
                </span>
              )}
            </form>
          </div>

          <div className="flex flex-col gap-1 border-t border-neon-cyan/10 pt-2 text-[8px] text-neutral-400">
            <div className="flex justify-between">
              <span>LATITUDE:</span>
              <span className="text-white font-bold font-mono">35.6762° N</span>
            </div>
            <div className="flex justify-between">
              <span>LONGITUDE:</span>
              <span className="text-white font-bold font-mono">139.6503° E</span>
            </div>
            <div className="flex justify-between">
              <span>ELEVATION:</span>
              <span className="text-neon-orange font-bold font-mono">
                {235 + Math.round(scrollPercent * 3.5)} M
              </span>
            </div>
          </div>
        </aside>

        {/* Center reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="relative w-40 h-40 border border-dashed border-neon-cyan/20 rounded-full animate-[spin_60s_linear_infinite] flex items-center justify-center">
            <div className="w-36 h-36 border border-neon-cyan/10 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping" />
            </div>
            <div className="absolute top-1 w-0.5 h-2 bg-neon-cyan" />
            <div className="absolute bottom-1 w-0.5 h-2 bg-neon-cyan" />
            <div className="absolute left-1 w-2 h-0.5 bg-neon-cyan" />
            <div className="absolute right-1 w-2 h-0.5 bg-neon-cyan" />
          </div>
          <div className="absolute w-6 h-[1px] bg-neon-cyan/60" />
          <div className="absolute h-6 w-[1px] bg-neon-cyan/60" />
        </div>

        {/* Right Telemetry Sidebar */}
        <aside className="pointer-events-auto w-56 hud-glass p-3 rounded-sm border border-neon-cyan/15 flex flex-col justify-between hidden md:flex h-[60vh] self-center text-right">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-neon-cyan/20 pb-1 text-white font-bold text-[8px] flex-row-reverse">
              <span>[NODE STATUS DIAGNOSTICS]</span>
              <span className="text-neon-orange font-bold">100% SECURE</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-neutral-400">GPU BUFFER:</span>
                  <span className="text-white">{(45 + scrollPercent * 0.4).toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-neon-cyan/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-cyan transition-all duration-300"
                    style={{ width: `${45 + scrollPercent * 0.4}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-neutral-400">SHADERS:</span>
                  <span className="text-white">{(78 + scrollPercent * 0.15).toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-neon-cyan/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-orange transition-all duration-300"
                    style={{ width: `${78 + scrollPercent * 0.15}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-neutral-400">COMPUTE LOAD:</span>
                  <span className="text-white">{(32 + scrollPercent * 0.58).toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-neon-cyan/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-green transition-all duration-300"
                    style={{ width: `${32 + scrollPercent * 0.58}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-neon-cyan/10 pt-2 text-[8px] text-neutral-400 items-end">
            <span className="text-white font-bold">ACTIVE PHASE</span>
            <span className="text-neon-cyan font-bold tracking-wider">
              {sectionNames[activeSection]}
            </span>
            <span className="text-[7px] text-neutral-500 max-w-[150px] leading-relaxed">
              {activeSection === 0
                ? "Simulating orbital networks and ground telemetry interfaces."
                : activeSection === 1
                ? "Clustering data nodes into deep neural grid infrastructures."
                : "Routing massive datastreams through high-speed tunnel pipelines."}
            </span>
          </div>
        </aside>
      </div>

      {/* FOOTER HUD */}
      <footer className="pointer-events-auto flex flex-col md:flex-row items-center justify-between w-full hud-glass p-3.5 rounded-sm border border-neon-cyan/20 gap-4">
        {/* Navigation Phase Links */}
        <div className="flex gap-4">
          {sectionNames.map((name, index) => (
            <button
              key={index}
              onClick={() => {
                const scrollOffsets = [0, 0.5, 1];
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({
                  top: docHeight * scrollOffsets[index],
                  behavior: "smooth",
                });
              }}
              className={`text-[8px] tracking-widest font-bold px-2.5 py-1.5 border transition-all ${
                activeSection === index
                  ? "bg-neon-cyan/10 border-neon-cyan text-white shadow-[0_0_8px_rgba(0,243,255,0.15)]"
                  : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
              }`}
            >
              PHASE {index + 1}
            </button>
          ))}
        </div>

        {/* Scroll Bar and Percentage */}
        <div className="flex-1 max-w-xl mx-4 flex items-center gap-3 w-full md:w-auto">
          <span className="text-[8px] text-neutral-400 font-bold">NAV_PROGRESS</span>
          <div className="flex-1 h-1.5 bg-neon-cyan/10 border border-neon-cyan/15 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-neon-cyan/20" />
            <div className="absolute inset-y-0 left-2/3 w-[1px] bg-neon-cyan/20" />
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-orange transition-all duration-100 ease-out shadow-[0_0_8px_var(--neon-cyan)]"
              style={{ width: `${scrollPercent}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-white tracking-widest w-8 text-right font-mono">
            {scrollPercent}%
          </span>
        </div>

        {/* Build credentials */}
        <div className="text-[8px] text-neutral-500 tracking-wider hidden lg:block">
          REPLICA V1.0.0 // BY ANTIGRAVITY &copy; 2026
        </div>
      </footer>
    </div>
  );
}
