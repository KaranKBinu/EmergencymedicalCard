"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  drift: number;
  type: "cross" | "cell" | "pill" | "dot" | "dna";
  rotation: number;
  rotationSpeed: number;
  delay: number;
}

interface MedicalAnimatedBgProps {
  /** Color theme: "blue" for dark, "light" for soft */
  theme?: "blue" | "light";
  /** If true, uses position:fixed so it sticks across the whole app */
  fixed?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 10;
const ECG_CYCLES = 3;

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 10 + Math.random() * 26,
    opacity: 0.04 + Math.random() * 0.09,
    speed: 20 + Math.random() * 30,
    drift: (Math.random() - 0.5) * 28,
    type: (["cross", "cell", "pill", "dot", "dna"] as const)[
      Math.floor(Math.random() * 5)
    ],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 60,
    delay: -(Math.random() * 20),
  }));
}

function buildEcgPath(width: number, height: number, cycles: number): string {
  const midY = height / 2;
  const segW = width / cycles;
  let d = `M 0 ${midY}`;
  for (let c = 0; c < cycles; c++) {
    const ox = c * segW;
    d += ` L ${ox + segW * 0.15} ${midY}`;
    d += ` Q ${ox + segW * 0.22} ${midY - height * 0.08} ${ox + segW * 0.28} ${midY}`;
    d += ` L ${ox + segW * 0.38} ${midY}`;
    d += ` L ${ox + segW * 0.43} ${midY + height * 0.12}`;
    d += ` L ${ox + segW * 0.48} ${midY - height * 0.55}`;
    d += ` L ${ox + segW * 0.53} ${midY + height * 0.18}`;
    d += ` L ${ox + segW * 0.58} ${midY}`;
    d += ` L ${ox + segW * 0.68} ${midY}`;
    d += ` Q ${ox + segW * 0.78} ${midY - height * 0.14} ${ox + segW * 0.88} ${midY}`;
    d += ` L ${ox + segW} ${midY}`;
  }
  return d;
}

export default function MedicalAnimatedBg({ theme = "light", fixed = false, className = "" }: MedicalAnimatedBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles] = useState<Particle[]>(generateParticles);
  const [dims, setDims] = useState({ w: 1440, h: 900 });
  const rectRef = useRef<{ left: number; top: number; width: number; height: number }>({ left: 0, top: 0, width: 1440, height: 900 });
  const rafRef = useRef<number | null>(null);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const [isReady, setIsReady] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const rect = rectRef.current;
    if (rect.width === 0 || rect.height === 0) return;
    targetMouse.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return;
    }
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const e = entries[0].contentRect;
      setDims({ w: e.width, h: e.height });
      el.style.setProperty("--bg-width", e.width.toString());
      el.style.setProperty("--bg-height", e.height.toString());

      const r = el.getBoundingClientRect();
      rectRef.current = {
        left: r.left,
        top: r.top,
        width: r.width || 1440,
        height: r.height || 900,
      };
    });
    ro.observe(el);

    const w = el.offsetWidth || 1440;
    const h = el.offsetHeight || 900;
    setDims({ w, h });
    el.style.setProperty("--bg-width", w.toString());
    el.style.setProperty("--bg-height", h.toString());
    el.style.setProperty("--mouse-x", "0.5");
    el.style.setProperty("--mouse-y", "0.5");

    const initialRect = el.getBoundingClientRect();
    rectRef.current = {
      left: initialRect.left,
      top: initialRect.top,
      width: initialRect.width || 1440,
      height: initialRect.height || 900,
    };

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      const lerp = 0.06;
      smoothMouse.current.x += (targetMouse.current.x - smoothMouse.current.x) * lerp;
      smoothMouse.current.y += (targetMouse.current.y - smoothMouse.current.y) * lerp;
      
      const container = containerRef.current;
      if (container) {
        container.style.setProperty("--mouse-x", smoothMouse.current.x.toFixed(4));
        container.style.setProperty("--mouse-y", smoothMouse.current.y.toFixed(4));
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onMouseMove, isReady]);

  const themes = {
    light: {
      bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 45%, #f8fafc 100%)",
      orb1: "rgba(14,165,233,0.14)",
      orb2: "rgba(13,148,136,0.10)",
      orb3: "rgba(239,68,68,0.07)",
      ecg: "rgba(14,165,233,0.20)",
      particle: "rgba(14,165,233,0.55)",
      grid: "rgba(14,165,233,0.06)",
      cross: "#0ea5e9",
      label: "rgba(14,165,233,0.22)",
    },
    blue: {
      bg: "linear-gradient(135deg, #0a1628 0%, #0d2540 45%, #0f172a 100%)",
      orb1: "rgba(14,165,233,0.25)",
      orb2: "rgba(13,148,136,0.20)",
      orb3: "rgba(239,68,68,0.15)",
      ecg: "rgba(56,189,248,0.32)",
      particle: "rgba(56,189,248,0.72)",
      grid: "rgba(56,189,248,0.07)",
      cross: "#38bdf8",
      label: "rgba(56,189,248,0.30)",
    },
  };
  const t = themes[theme];

  const ecgPath1 = buildEcgPath(dims.w, 80, ECG_CYCLES);
  const ecgPath2 = buildEcgPath(dims.w, 60, ECG_CYCLES);

  return (
    <div
      ref={containerRef}
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none select-none ${fixed ? 'z-0' : ''} ${className}`}
      aria-hidden="true"
      style={{ background: t.bg }}
    >
      {/* GPU Accelerated Color Orbs */}
      <div 
        className="absolute rounded-full pointer-events-none opacity-80"
        style={{
          left: "22%",
          top: "28%",
          width: "80vw",
          height: "92vh",
          transform: isReady 
            ? "translate(-50%, -50%) translate(calc((var(--mouse-x, 0.5) - 0.5) * 90px), calc((var(--mouse-y, 0.5) - 0.5) * 65px))"
            : "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${t.orb1} 0%, transparent 70%)`,
          filter: "blur(90px)",
          willChange: "transform",
          transition: isReady ? "none" : "transform 0.5s ease-out",
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none opacity-80"
        style={{
          left: "80%",
          top: "70%",
          width: "68vw",
          height: "76vh",
          transform: isReady 
            ? "translate(-50%, -50%) translate(calc((var(--mouse-x, 0.5) - 0.5) * 49.5px), calc((var(--mouse-y, 0.5) - 0.5) * 35.75px))"
            : "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${t.orb2} 0%, transparent 70%)`,
          filter: "blur(90px)",
          willChange: "transform",
          transition: isReady ? "none" : "transform 0.5s ease-out",
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none opacity-80"
        style={{
          left: "60%",
          top: "12%",
          width: "48vw",
          height: "56vh",
          transform: isReady 
            ? "translate(-50%, -50%) translate(calc((var(--mouse-x, 0.5) - 0.5) * -31.5px), calc((var(--mouse-y, 0.5) - 0.5) * -22.75px))"
            : "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${t.orb3} 0%, transparent 70%)`,
          filter: "blur(90px)",
          willChange: "transform",
          transition: isReady ? "none" : "transform 0.5s ease-out",
        }}
      />

      {/* GPU Accelerated Cursor Glow Orb */}
      {isReady && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "360px",
            height: "360px",
            left: "0",
            top: "0",
            transform: "translate(-50%, -50%) translate(calc(var(--mouse-x, 0.5) * var(--bg-width, 1440) * 1px), calc(var(--mouse-y, 0.5) * var(--bg-height, 900) * 1px))",
            background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)",
            filter: "blur(20px)",
            willChange: "transform",
          }}
        />
      )}

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern id="mbg-dot-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <circle cx="19" cy="19" r="1" fill={t.grid} />
          </pattern>
        </defs>

        {/* Dot grid pattern — replaces 1,400+ separate DOM nodes */}
        <rect width="100%" height="100%" fill="url(#mbg-dot-grid)" />

        {/* ECG Line 1 — 30% down with CSS-driven double path glow */}
        {isReady && dims.w >= 640 && (
          <g transform={`translate(0, ${dims.h * 0.3 - 40})`}>
            <path d={ecgPath1} fill="none" stroke={t.ecg} strokeWidth="5.5" opacity="0.22" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from={dims.w} to={-dims.w} dur="6s" repeatCount="indefinite" />
              <animate attributeName="stroke-dasharray" values={`0 ${dims.w * 2}; ${dims.w * 0.5} ${dims.w * 1.5}; 0 ${dims.w * 2}`} dur="6s" repeatCount="indefinite" />
            </path>
            <path d={ecgPath1} fill="none" stroke={t.ecg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from={dims.w} to={-dims.w} dur="6s" repeatCount="indefinite" />
              <animate attributeName="stroke-dasharray" values={`0 ${dims.w * 2}; ${dims.w * 0.5} ${dims.w * 1.5}; 0 ${dims.w * 2}`} dur="6s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* ECG Line 2 — 72% down with CSS-driven double path glow */}
        {isReady && dims.w >= 640 && (
          <g transform={`translate(0, ${dims.h * 0.72 - 30})`}>
            <path d={ecgPath2} fill="none" stroke={t.ecg} strokeWidth="4.0" opacity="0.12" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from={dims.w} to={-dims.w} dur="8s" begin="-3s" repeatCount="indefinite" />
              <animate attributeName="stroke-dasharray" values={`0 ${dims.w * 2}; ${dims.w * 0.5} ${dims.w * 1.5}; 0 ${dims.w * 2}`} dur="8s" begin="-3s" repeatCount="indefinite" />
            </path>
            <path d={ecgPath2} fill="none" stroke={t.ecg} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
              <animate attributeName="stroke-dashoffset" from={dims.w} to={-dims.w} dur="8s" begin="-3s" repeatCount="indefinite" />
              <animate attributeName="stroke-dasharray" values={`0 ${dims.w * 2}; ${dims.w * 0.5} ${dims.w * 1.5}; 0 ${dims.w * 2}`} dur="8s" begin="-3s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* Floating particles (optimized without SVG blur filters) */}
        {isReady && dims.w >= 640 && particles.map((p) => {
          const px = (p.x / 100) * dims.w;
          const py = (p.y / 100) * dims.h;
          const animDur = `${p.speed}s`;
          const animVals = `${px},${py}; ${px + p.drift},${py - p.speed * 0.7}; ${px},${py}`;

          return (
            <g key={p.id} opacity={p.opacity}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={animVals}
                dur={animDur}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
              <g transform={`translate(${px}, ${py})`}>
                {p.type === "cross" && (
                  <>
                    <rect x={-p.size * 0.14} y={-p.size * 0.44} width={p.size * 0.28} height={p.size * 0.88} rx={p.size * 0.08} fill={t.particle} />
                    <rect x={-p.size * 0.44} y={-p.size * 0.14} width={p.size * 0.88} height={p.size * 0.28} rx={p.size * 0.08} fill={t.particle} />
                  </>
                )}
                {p.type === "cell" && (
                  <>
                    <ellipse cx={0} cy={0} rx={p.size * 0.44} ry={p.size * 0.3} fill="none" stroke={t.particle} strokeWidth="1.5" />
                    <circle cx={0} cy={0} r={p.size * 0.12} fill={t.particle} opacity="0.7" />
                    {[0, 120, 240].map((deg) => (
                      <line
                        key={deg}
                        x1={0} y1={0}
                        x2={Math.cos((deg * Math.PI) / 180) * p.size * 0.38}
                        y2={Math.sin((deg * Math.PI) / 180) * p.size * 0.24}
                        stroke={t.particle} strokeWidth="0.8" opacity="0.4"
                      />
                    ))}
                  </>
                )}
                {p.type === "pill" && (
                  <>
                    <rect x={-p.size * 0.5} y={-p.size * 0.22} width={p.size} height={p.size * 0.44} rx={p.size * 0.22} fill="none" stroke={t.particle} strokeWidth="1.5" />
                    <line x1={0} y1={-p.size * 0.2} x2={0} y2={p.size * 0.2} stroke={t.particle} strokeWidth="1" opacity="0.4" />
                  </>
                )}
                {p.type === "dna" && (() => {
                  const pts = 6;
                  return (
                    <>
                      {Array.from({ length: pts }, (_, i) => {
                        const yy = ((i / (pts - 1)) - 0.5) * p.size;
                        const wave = Math.sin((i / (pts - 1)) * Math.PI * 2);
                        const lx = -p.size * 0.2 + wave * p.size * 0.18;
                        const rx2 = p.size * 0.2 - wave * p.size * 0.18;
                        return (
                          <g key={i}>
                            <circle cx={lx} cy={yy} r={1.8} fill={t.particle} />
                            <circle cx={rx2} cy={yy} r={1.8} fill={t.particle} />
                            <line x1={lx} y1={yy} x2={rx2} y2={yy} stroke={t.particle} strokeWidth="0.7" opacity="0.35" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
                {p.type === "dot" && (
                  <>
                    <circle cx={0} cy={0} r={p.size * 0.42} fill="none" stroke={t.particle} strokeWidth="1.5" />
                    <circle cx={0} cy={0} r={p.size * 0.18} fill={t.particle} opacity="0.5" />
                  </>
                )}
              </g>
            </g>
          );
        })}

        {/* Big background medical cross — bottom right */}
        <g opacity="0.04" transform={`translate(${dims.w - 110}, ${dims.h - 110})`}>
          <rect x={-22} y={-66} width={44} height={132} rx={12} fill={t.cross} />
          <rect x={-66} y={-22} width={132} height={44} rx={12} fill={t.cross} />
        </g>
        {/* Small medical cross — top left */}
        <g opacity="0.04" transform="translate(80, 90)">
          <rect x={-14} y={-42} width={28} height={84} rx={8} fill={t.cross} />
          <rect x={-42} y={-14} width={84} height={28} rx={8} fill={t.cross} />
        </g>

        {/* Watermark label */}
        <text
          x={dims.w - 16}
          y={dims.h - 14}
          textAnchor="end"
          fontSize={8}
          fill={t.label}
          fontFamily="monospace"
          letterSpacing="2"
        >
          ♥ PULSEID — MEDICAL PROFILE SYSTEM
        </text>
      </svg>

      <style>{`
        @keyframes mbg-grain {
          0%,100% { background-position: 0 0; }
          20% { background-position: -4% -8%; }
          40% { background-position: 6% 3%; }
          60% { background-position: -2% 9%; }
          80% { background-position: 8% -4%; }
        }
      `}</style>
      {/* Noise grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          opacity: 0.028,
          animation: "mbg-grain 8s steps(10) infinite",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
