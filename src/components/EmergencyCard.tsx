"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Droplets, User, Activity, Scale, Ruler, Info, Calendar, AlertTriangle, Mars, Venus, Transgender } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import Image from "next/image";

interface EmergencyData {
  fullName: string;
  bloodGroup: string;
  emergencyPhone: string;
  emergencyName: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string;
  currentMedications?: string[];
  height?: string;
  weight?: string;
  photoUrl?: string;
  publicId?: string;
  dob?: string;
  gender?: string;
  createdAt?: Date;
}

/* ── Card visual constants ── */
const CARD_BG = 'linear-gradient(135deg, #040814 0%, #091026 40%, #130a21 80%, #1f0b20 100%)';
const CARD_SHADOW = 'none';

/** Ambient glow layers inside the card */
function CardGlows() {
  return (
    <>
      {/* Cybernetic Medical Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }} />
      
      {/* Top-right cyan bloom */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none filter blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />
      
      {/* Bottom-left rose bloom */}
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none filter blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)' }} />

      {/* Shimmer light streak */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)' }} />
    </>
  );
}

const formatHeight = (h?: string) => {
  if (!h) return "—";
  const trimmed = h.trim();
  if (!trimmed) return "—";
  if (trimmed.includes("cm") || trimmed.includes("ft") || trimmed.includes("'") || trimmed.includes("\"") || trimmed.includes("in") || trimmed.includes("m")) {
    return trimmed;
  }
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    if (num < 10) return `${trimmed} ft`;
    return `${trimmed} cm`;
  }
  return trimmed;
};

const formatWeight = (w?: string) => {
  if (!w) return "—";
  const trimmed = w.trim();
  if (!trimmed) return "—";
  if (trimmed.toLowerCase().includes("kg") || trimmed.toLowerCase().includes("lbs") || trimmed.toLowerCase().includes("lb") || trimmed.toLowerCase().includes("g")) {
    return trimmed;
  }
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    if (num > 300) return `${trimmed} lbs`; // reasonable threshold to guess scale
    return `${trimmed} kg`;
  }
  return trimmed;
};

/** Front face */
function FrontContent({ data, publicUrl, priority = false }: { data: EmergencyData; publicUrl: string; priority?: boolean }) {
  const [isImgLoading, setIsImgLoading] = useState(true);

  useEffect(() => {
    setIsImgLoading(true);
  }, [data.photoUrl]);

  return (
    <div className="relative h-full flex flex-col p-5 gap-2.5 select-none">
      {/* ── ROW 1: Premium Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="absolute w-3 h-3 bg-cyan-400/30 rounded-full animate-ping" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 font-sans">Emergency Medical ID</span>
        </div>
      </div>

      {/* ── ROW 2: Identity & QR ── */}
      <div className="flex items-stretch gap-4 my-0.5">
        {/* Photo with tech frame */}
        <div className="relative shrink-0">
          <div className="w-[76px] h-[76px] rounded-2xl overflow-hidden border-2 border-cyan-500/25 bg-slate-900/50 flex items-center justify-center shadow-lg shadow-cyan-500/5">
            {data.photoUrl ? (
              <div className="relative w-full h-full">
                {isImgLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-600/50" />
                  </div>
                )}
                <Image 
                  src={data.photoUrl} 
                  alt={data.fullName} 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
                  width={76}
                  height={76}
                  priority={priority}
                  onLoad={() => setIsImgLoading(false)}
                />
              </div>
            ) : (
              <User className="w-9 h-9 text-slate-400" />
            )}
          </div>
          {data.gender && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-center backdrop-blur-md shadow-md">
              {data.gender.toUpperCase() === "MALE" && <Mars className="w-4 h-4 text-blue-300" aria-label="Male" />}
              {data.gender.toUpperCase() === "FEMALE" && <Venus className="w-4 h-4 text-pink-300" aria-label="Female" />}
              {data.gender.toUpperCase() === "OTHER" && <Transgender className="w-4 h-4 text-purple-300" aria-label="Other Gender" />}
            </div>
          )}
        </div>

        {/* Name and Basic Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <h3 className="text-xl font-extrabold text-white leading-tight tracking-tight truncate drop-shadow-sm font-sans">
            {data.fullName}
          </h3>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            {data.dob && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-cyan-300 shrink-0" />
                <span className="text-[9px] font-semibold text-slate-300">{data.dob}</span>
              </div>
            )}
            {data.emergencyName && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md max-w-full">
                <span className="text-[9px] text-slate-300 truncate">Contact: <strong className="text-white">{data.emergencyName}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="shrink-0 self-center flex flex-col items-center gap-1.5">
          <div className="p-1.5 bg-white rounded-2xl shadow-lg border border-cyan-500/10">
            <QRCodeSVG value={publicUrl} size={62} level="H" />
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-cyan-400">Scan Profile</span>
        </div>
      </div>

      {/* ── ROW 2.5: Front Allergies & Conditions ── */}
      <div className="grid grid-cols-2 gap-3 my-0.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[7.5px] uppercase tracking-wider text-rose-300 font-extrabold">Allergies</span>
          <div className="flex flex-wrap gap-1 max-h-[36px] overflow-y-auto pr-0.5 custom-scrollbar">
            {data.allergies && data.allergies.length > 0
              ? data.allergies.slice(0, 4).map(a => {
                  const isMed = a.startsWith('💊 ');
                  const label = isMed ? a.replace('💊 ', '') : a;
                  return (
                    <span key={a} className="px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 truncate max-w-[85px]">{label}</span>
                  );
                })
              : <span className="text-[7.5px] text-slate-400 italic">None</span>
            }
          </div>
        </div>

        <div className="flex flex-col gap-0.5 border-l border-white/5 pl-3">
          <span className="text-[7.5px] uppercase tracking-wider text-cyan-300 font-extrabold">Conditions</span>
          <div className="flex flex-wrap gap-1 max-h-[36px] overflow-y-auto pr-0.5 custom-scrollbar">
            {data.medicalConditions && data.medicalConditions.length > 0
              ? data.medicalConditions.slice(0, 4).map(c => (
                  <span key={c} className="px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 truncate max-w-[85px]">{c}</span>
                ))
              : <span className="text-[7.5px] text-slate-400 italic">None</span>
            }
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0), rgba(6,182,212,0.25), rgba(6,182,212,0))' }} />

      {/* ── ROW 3: Vitals / Emergency Actions ── */}
      <div className="flex items-stretch gap-3">
        {/* Blood Group */}
        <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-2 shrink-0 bg-rose-500/10 border border-rose-500/30 shadow-inner">
          <Droplets className="w-4 h-4 text-rose-400 mb-0.5 animate-pulse" />
          <span className="text-2xl font-black text-rose-500 leading-none tracking-tight">{data.bloodGroup}</span>
          <span className="text-[7px] uppercase tracking-[0.2em] text-rose-400 font-bold mt-1">Blood</span>
        </div>

        {/* Emergency Call Box */}
        <div className="flex-1 flex flex-col justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-rose-950/20 to-red-950/20 border border-rose-500/30">
          <span className="text-[7.5px] uppercase tracking-[0.2em] text-rose-400 font-extrabold mb-1">Emergency Call</span>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
            <span className="text-[13.5px] font-black text-white tracking-tight leading-none">{data.emergencyPhone}</span>
          </div>
        </div>

        {/* Height / Weight */}
        <div className="flex gap-4 shrink-0 rounded-2xl px-4 py-2 bg-slate-900/50 border border-white/5">
          <div className="flex flex-col justify-center gap-0.5">
            <span className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">Height</span>
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-white whitespace-nowrap">{formatHeight(data.height)}</span>
            </div>
          </div>
          <div className="w-[1px] bg-white/10" />
          <div className="flex flex-col justify-center gap-0.5">
            <span className="text-[7px] uppercase tracking-widest text-slate-400 font-bold">Weight</span>
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-white whitespace-nowrap">{formatWeight(data.weight)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="mt-auto pt-2 flex items-center justify-between border-t border-white/5">
        <span className="text-[8px] font-semibold text-slate-400">Secure Emergency Identity Card</span>
        <span className="text-[8px] text-slate-400 font-medium">
          REF: #{data.publicId?.substring(0, 8).toUpperCase() || 'SAMPLE'}
        </span>
      </div>
    </div>
  );
}

/** Back face */
function BackContent({ data }: { data: EmergencyData }) {
  return (
    <div className="relative h-full flex flex-col p-5 gap-3 select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">Medical History &amp; Medications</span>
        </div>
      </div>

      {/* ── Current Medications ── */}
      <div className="flex flex-col gap-1 my-1">
        <span className="text-[8px] uppercase tracking-[0.15em] text-cyan-300 font-extrabold">Current Medications</span>
        <div className="flex flex-wrap gap-1 content-start max-h-[56px] overflow-y-auto pr-1 custom-scrollbar">
          {data.currentMedications && data.currentMedications.length > 0
            ? data.currentMedications.slice(0, 12).map(m => (
                <span key={m} className="px-2 py-0.5 rounded-md text-[8px] font-bold border bg-cyan-500/10 text-cyan-300 border-cyan-500/25 shadow-sm">{m}</span>
              ))
            : <span className="text-[9px] text-slate-400 italic">No medications recorded</span>
          }
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0), rgba(6,182,212,0.25), rgba(6,182,212,0))' }} />

      {/* Notes / Meds */}
      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-cyan-300">Notes &amp; Special Instructions</span>
        </div>
        <div className="flex-1 rounded-xl p-3 overflow-y-auto bg-slate-950/45 border border-white/5 custom-scrollbar">
          <p className={`leading-relaxed text-slate-300 font-medium ${
            (data.medications?.length || 0) > 150 ? 'text-[9.5px]' : 'text-[10.5px]'
          }`}>
            {data.medications || "No special instructions noted."}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[8px] font-semibold text-slate-400">Scan QR Code on front for active updates</span>
        <span className="text-[8px] text-slate-400 font-medium">EMERGENCY FIRST RESPONSE</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main component
 ══════════════════════════════════════════════ */
export default function EmergencyCard({ data, forcedSide, priority = false, disableResponsive = false, innerRef }: { data: EmergencyData; forcedSide?: 'front' | 'back'; priority?: boolean; disableResponsive?: boolean; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  const [isFlipped, setIsFlipped]   = useState(false);
  const [isHovered, setIsHovered]   = useState(false);
  const currentFlipped              = forcedSide ? (forcedSide === 'back') : isFlipped;
  const [isMounted, setIsMounted] = useState(false);
  const [scale, setScale]           = useState(1);
  const [isMobile, setIsMobile]     = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);

  const publicUrl = isMounted && typeof window !== "undefined"
    ? `${window.location.origin}/v/${data.publicId || 'sample-id'}`
    : "";

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);

    if (disableResponsive) {
      setIsMobile(false);
      setScale(1);
      return;
    }

    const resize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const mob = window.innerWidth < 640;
      setIsMobile(mob);
      setScale(mob ? Math.min(1.1, (w - 32) / 304) : Math.min(1, w / 480));
    };

    resize();
    window.addEventListener('resize', resize);
    
    let t1: NodeJS.Timeout | undefined;
    let t2: NodeJS.Timeout | undefined;
    let th: NodeJS.Timeout | undefined;
    let th2: NodeJS.Timeout | undefined;

    if (window.innerWidth >= 640) {
      t1 = setTimeout(() => setIsFlipped(true),  1200);
      t2 = setTimeout(() => setIsFlipped(false), 2800);
    } else {
      th  = setTimeout(() => setIsHovered(true),  3500);
      th2 = setTimeout(() => setIsHovered(false), 8500);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (th) clearTimeout(th);
      if (th2) clearTimeout(th2);
    };
  }, [data.publicId, disableResponsive]);

  const wrapperStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    transform: `scale(${scale}) ${isMobile ? 'rotate(90deg)' : ''}`,
    marginBottom: isMobile ? `${(480 * scale - 304 * scale) / 2 + 10}px` : `-${304 * (1 - scale)}px`,
    marginTop:    isMobile ? `${(480 * scale - 304 * scale) / 2 + 10}px` : '0px',
    boxShadow: CARD_SHADOW,
    ...extra,
  });

  /* ── Static (forcedSide) ── */
  if (forcedSide) {
    return (
      <div ref={containerRef} className="flex flex-col items-center justify-center min-h-[320px] sm:min-h-[350px] py-4 w-full overflow-x-hidden relative">
        <div
          ref={innerRef}
          className={`relative w-[480px] h-[304px] rounded-[2rem] ${isMobile ? 'origin-center' : 'origin-top'}`}
          style={wrapperStyle()}
        >
          <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-cyan-500/25 text-white" style={{ background: CARD_BG }}>
            <CardGlows />
            {forcedSide === 'front'
              ? <FrontContent data={data} publicUrl={publicUrl} priority={priority} />
              : <BackContent data={data} />
            }
          </div>
        </div>
      </div>
    );
  }

  /* ── Interactive flip ── */
  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-[320px] sm:min-h-[350px] py-4 w-full overflow-x-hidden relative">
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
            className="absolute -top-14 left-1/2 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-cyan-400 z-[100] shadow-xl pointer-events-none flex items-center gap-2 whitespace-nowrap"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Click to flip card
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative w-[480px] h-[304px] cursor-pointer perspective-1000 rounded-[2rem] ${isMobile ? 'origin-center' : 'origin-top'}`}
        style={wrapperStyle()}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: currentFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-cyan-500/25 text-white" style={{ background: CARD_BG }}>
              <CardGlows />
              <FrontContent data={data} publicUrl={publicUrl} priority={priority} />
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-cyan-500/25 text-white" style={{ background: CARD_BG }}>
              <CardGlows />
              <BackContent data={data} />
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isHovered && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-cyan-400 z-[100] shadow-xl pointer-events-none flex items-center gap-2 whitespace-nowrap mt-4"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Tap to flip card
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
