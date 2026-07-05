"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export default function GlobalLoader() {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Small delay to ensure the animations render nicely before fading out
    const fadeTimer = setTimeout(() => {
      setMounted(true);
    }, 1100);

    // Completely remove loader from DOM after transition completes
    const destroyTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#040814] via-[#091026] to-[#130a21] transition-opacity duration-700 ease-in-out select-none pointer-events-none ${
        mounted ? "opacity-0" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />

      {/* Cybernetic Grid Backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Pulsing logo icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/5 animate-[heartbeat_1.5s_infinite_ease-in-out]">
          <Activity className="w-8 h-8 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </div>

        {/* ECG SVG Drawing */}
        <div className="w-64 h-16 relative">
          <svg
            viewBox="0 0 160 80"
            width="100%"
            height="100%"
            fill="none"
            className="overflow-visible"
          >
            <path
              d="M 0 40 L 40 40 L 46 32 L 53 40 L 59 40 L 64 54 L 71 10 L 78 72 L 85 40 L 96 40 L 102 32 L 109 40 L 160 40"
              stroke="url(#ecg-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 350,
                animation: "draw-ecg 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
            <defs>
              <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Loading text with animated ellipsis */}
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="font-outfit font-black tracking-[0.2em] text-cyan-400 text-[10px] uppercase">
            Connecting PulseID
          </h2>
          <span className="text-[11px] font-medium text-slate-400/80 animate-pulse tracking-wide">
            Retrieving safety profile
          </span>
        </div>
      </div>

      <style>{`
        @keyframes draw-ecg {
          0% {
            stroke-dashoffset: 350;
          }
          100% {
            stroke-dashoffset: -350;
          }
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          20% {
            transform: scale(1.1);
            filter: brightness(1.2) drop-shadow(0 0 12px rgba(6, 182, 212, 0.4));
          }
          40% {
            transform: scale(1.02);
          }
          60% {
            transform: scale(1.15);
            filter: brightness(1.25) drop-shadow(0 0 16px rgba(6, 182, 212, 0.5));
          }
          80% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
