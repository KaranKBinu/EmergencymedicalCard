"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Phone, Droplets, User, ShieldAlert, Activity, Scale, Ruler, Info, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface EmergencyData {
  fullName: string;
  bloodGroup: string;
  emergencyPhone: string;
  emergencyName: string;
  emergencyRelation: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string;
  height?: string;
  weight?: string;
  photoUrl?: string;
  publicId?: string;
  dob?: string;
  createdAt?: Date;
}

export default function EmergencyCard({ data, forcedSide }: { data: EmergencyData, forcedSide?: 'front' | 'back' }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Use forcedSide if provided, otherwise use internal state
  const currentFlipped = forcedSide ? (forcedSide === 'back') : isFlipped;
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    setPublicUrl(`${baseUrl}/v/${data.publicId || 'sample-id'}`);

    // Auto-flip animation on load
    const timer1 = setTimeout(() => setIsFlipped(true), 1200);
    const timer2 = setTimeout(() => setIsFlipped(false), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [data.publicId]);

  return (
    <div className="flex flex-col items-center gap-6 py-4 w-full">
      <div
        className="relative w-full max-w-[480px] aspect-[1.58/1] cursor-pointer perspective-1000 shadow-[0_0_50px_-12px_rgba(255,77,77,0.3)] rounded-[2rem]"
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
              className="absolute -top-14 left-1/2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/90 z-[100] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] pointer-events-none flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Click to flip card
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: currentFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0c]">
              {/* Background Accents */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />

              <div className="relative h-full p-8 flex flex-col justify-between bg-white/[0.02] backdrop-blur-md">
                <div className="flex justify-between items-start">
                  <div className="flex gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 overflow-hidden flex items-center justify-center shadow-inner">
                      {data.photoUrl ? (
                        <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white/20" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">{data.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Emergency ID</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-white/20" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{data.dob || "--"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-white/20">
                    <QRCodeSVG value={publicUrl} size={80} level="H" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Blood Group</span>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Droplets className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xl font-black text-white">{data.bloodGroup}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-black">Emergency Call</span>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-accent/10">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-lg font-black text-white tracking-tight whitespace-nowrap">{data.emergencyPhone}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pb-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-black">Height</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-black text-white">{data.height || "--"}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pb-2">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-black">Weight</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-black text-white">{data.weight || "--"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-muted-foreground border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span className="tracking-widest uppercase">Scannable Medical Identity</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="text-[8px] uppercase tracking-tighter">Issued:</span>
                    <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "2024"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0d0d10]">
              <div className="relative h-full p-8 flex flex-col bg-white/[0.02] backdrop-blur-md">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  {/* Medical Details */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-black">Critical Allergies</span>
                    <div className="flex flex-wrap gap-1">
                      {data.allergies && data.allergies.length > 0 ? data.allergies.slice(0, 4).map(a => (
                        <span key={a} className="px-1.5 py-0.5 rounded-md bg-destructive/20 text-destructive text-[8px] font-bold border border-destructive/10">{a}</span>
                      )) : <span className="text-[9px] text-white/30 italic">None</span>}
                    </div>
                  </div>
                  <div className="space-y-1.5 border-l border-white/5 pl-6">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-black">Medical Conditions</span>
                    <div className="flex flex-wrap gap-1">
                      {data.medicalConditions && data.medicalConditions.length > 0 ? data.medicalConditions.slice(0, 4).map(c => (
                        <span key={c} className="px-1.5 py-0.5 rounded-md bg-accent/20 text-accent text-[8px] font-bold border border-accent/10">{c}</span>
                      )) : <span className="text-[9px] text-white/30 italic">None</span>}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 h-full flex flex-col">
                    <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                      <Info className="w-3.5 h-3.5 text-primary" /> Important Medical Notes
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`leading-relaxed italic text-white/80 ${(data.medications?.length || 0) > 250 ? 'text-[9.5px]' : 'text-[11px]'}`}>
                        {data.medications || "No additional medications or special instructions provided by the user."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 text-[9px] font-bold text-muted-foreground mt-auto border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-accent" />
                    <span className="tracking-widest uppercase">Emergency Response Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
