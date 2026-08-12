import type { Metadata } from "next";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const imageUrl = `${apiBase}/api/results/${id}/image`;

  return {
    title: "HH GOA 2026 | Builder Card",
    description: "Framing my build on the sand at Hacker House Goa 2026.",
    openGraph: {
      title: "HH GOA 2026 | Builder Card",
      description: "Framing my build on the sand at Hacker House Goa 2026.",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1500,
          alt: "Hacker House Goa 2026 Builder Card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "HH GOA 2026 | Builder Card",
      description: "Framing my build on the sand at Hacker House Goa 2026.",
      images: [imageUrl],
    },
    other: {
      "robots": "noindex, nofollow", // Prevent crawler indexing
    }
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const imageUrl = `${apiBase}/api/results/${id}/image`;
  const downloadUrl = `${apiBase}/api/results/${id}/download`;

  // Fetch metadata details from FastAPI
  let format = "builder_card";
  let name = "HACKER HOUSE BUILDER";
  
  try {
    const res = await fetch(`${apiBase}/api/results/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      format = data.format;
      name = data.metadata?.name || name;
    }
  } catch (error) {
    console.error("Failed to fetch result metadata:", error);
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto px-6 py-12 md:py-20 select-none">
      <header className="flex justify-between items-center border-b border-sand/15 pb-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 font-bold font-mono uppercase">
            HH GOA 2026
          </span>
          <span className="text-[9px] text-white font-bold font-mono tracking-widest">
            // RESIDENCY PASS
          </span>
        </div>
        <Link
          href="/"
          className="text-[9px] font-mono font-bold text-muted hover:text-white border border-sand/15 hover:border-sand/45 px-2.5 py-1 transition-all uppercase rounded-sm"
        >
          &lt; Create Your Own
        </Link>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-12 items-center justify-center">
        {/* Output card rendering */}
        <div className="w-full max-w-sm border border-accent/20 rounded-sm overflow-hidden bg-background-card shadow-[0_0_40px_rgba(0,240,255,0.1)]">
          <img
            src={imageUrl}
            alt="Hacker House Goa Generated Card"
            className="w-full h-auto object-contain max-h-[70vh]"
          />
        </div>

        {/* Sidebar buttons */}
        <div className="flex flex-col gap-5 w-full max-w-sm md:max-w-xs p-6 border border-sand/10 bg-background-card/45 rounded-sm hh-glass">
          <div>
            <h2 className="text-white text-[12px] font-extrabold tracking-widest uppercase mb-1">
              BUILDER CREDENTIAL
            </h2>
            <span className="text-[8px] text-muted font-mono uppercase block">
              STATUS: REGISTERED IN MONGODB
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[9px] text-neutral-400">
            <div className="flex justify-between">
              <span>HACKER:</span>
              <span className="text-white font-bold truncate max-w-[150px]">{name.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>FORMAT:</span>
              <span className="text-accent font-bold uppercase">{format}</span>
            </div>
            <div className="flex justify-between">
              <span>RETENTION:</span>
              <span className="text-primary font-bold">30 DAYS EXPIRY</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <a
              href={downloadUrl}
              className="w-full py-3 px-4 bg-primary text-white font-bold tracking-[0.2em] text-[9px] hover:bg-primary/90 text-center uppercase transition-all rounded-sm shadow-[0_0_10px_rgba(255,81,0,0.1)]"
            >
              ↓ DOWNLOAD PNG
            </a>
            <Link
              href="/"
              className="w-full py-3 px-4 border border-sand/20 hover:border-sand/40 text-muted hover:text-white text-center font-bold tracking-widest text-[9px] uppercase transition-colors rounded-sm"
            >
              CREATE YOUR FRAME
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-12 pt-6 border-t border-sand/10 text-center font-mono text-[7px] text-muted uppercase">
        <span>© 2026 HACKER HOUSE GOA · LESS NOISE. MORE SIGNAL.</span>
      </footer>
    </div>
  );
}
