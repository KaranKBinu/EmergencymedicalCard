"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Phone, Droplets, User, ShieldAlert, Activity, Scale, Ruler, Info } from "lucide-react";
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
}

export default function EmergencyCard({ data }: { data: EmergencyData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    setPublicUrl(`${baseUrl}/v/${data.publicId || 'sample-id'}`);
  }, [data.publicId]);

  return (
    <div className="flex flex-col items-center gap-6 py-4 w-full">
      <div 
        className="relative w-full max-w-[480px] aspect-[1.58/1] cursor-pointer perspective-1000 shadow-[0_0_50px_-12px_rgba(255,77,77,0.3)] rounded-[2rem]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
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
                    </div>
                  </div>
                  
                  <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-white/20">
                    <QRCodeSVG value={publicUrl} size={80} level="H" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
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
                      <span className="text-xl font-black text-white tracking-tight">{data.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-[10px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span className="tracking-widest uppercase">Scannable Medical Identity</span>
                  </div>
                  <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] tracking-tighter">CLICK TO FLIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0d0d10]">
              <div className="relative h-full p-8 flex flex-col justify-between bg-white/[0.02] backdrop-blur-md">
                <div className="grid grid-cols-2 gap-8">
                  {/* Medical Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Allergies</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.allergies && data.allergies.length > 0 ? data.allergies.slice(0, 3).map(a => (
                          <span key={a} className="px-2 py-1 rounded-md bg-destructive/20 text-destructive text-[9px] font-bold border border-destructive/10">{a}</span>
                        )) : <span className="text-[10px] text-white/40 italic">None Registered</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Conditions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.medicalConditions && data.medicalConditions.length > 0 ? data.medicalConditions.slice(0, 3).map(c => (
                          <span key={c} className="px-2 py-1 rounded-md bg-accent/20 text-accent text-[9px] font-bold border border-accent/10">{c}</span>
                        )) : <span className="text-[10px] text-white/40 italic">No Chronic Conditions</span>}
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="space-y-4 border-l border-white/10 pl-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Height</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-white">
                          <Ruler className="w-4 h-4 text-muted-foreground" /> {data.height || "--"}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Weight</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-white">
                          <Scale className="w-4 h-4 text-muted-foreground" /> {data.weight || "--"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    <Info className="w-4 h-4 text-primary" /> Important Notes
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed italic line-clamp-2">
                    {data.medications || "No additional medications or special instructions provided by the user."}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-[10px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="tracking-widest uppercase">Detailed Medical Record</span>
                  </div>
                  <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] tracking-tighter">CLICK TO FLIP</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">Click card to flip and view safety details</p>
    </div>
  );
}
