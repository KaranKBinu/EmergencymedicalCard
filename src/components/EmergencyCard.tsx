"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Phone, Droplets, User, Heart, ShieldAlert, Activity, Scale, Ruler, Info } from "lucide-react";
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
  organDonor?: boolean;
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
    <div className="flex flex-col items-center gap-6 py-4">
      <div 
        className="relative w-full max-w-[400px] aspect-[1.6/1] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0c]">
              {/* Background Accents */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full" />
              
              <div className="relative h-full p-6 flex flex-col justify-between bg-white/[0.02] backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                      {data.photoUrl ? (
                        <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white">{data.fullName}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Emergency ID</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20">
                    <QRCodeSVG value={publicUrl} size={64} level="H" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Blood Group</span>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span className="text-lg font-black text-white">{data.bloodGroup}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Emergency Call</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent" />
                      <span className="text-lg font-black text-white tracking-tight">{data.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-primary" />
                    SCANNABLE MEDICAL IDENTITY
                  </div>
                  <span>CLICK TO FLIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 rotate-y-180 backface-hidden">
            <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#0d0d10]">
              <div className="relative h-full p-6 flex flex-col justify-between bg-white/[0.02]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Medical Details */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Allergies</span>
                      <div className="flex flex-wrap gap-1">
                        {data.allergies?.slice(0, 3).map(a => (
                          <span key={a} className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive text-[8px] font-bold">{a}</span>
                        )) || <span className="text-[8px] text-white/40 italic">None</span>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Conditions</span>
                      <div className="flex flex-wrap gap-1">
                        {data.medicalConditions?.slice(0, 3).map(c => (
                          <span key={c} className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[8px] font-bold">{c}</span>
                        )) || <span className="text-[8px] text-white/40 italic">None</span>}
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="space-y-3 border-l border-white/5 pl-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Height</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                          <Ruler className="w-3 h-3 text-muted-foreground" /> {data.height || "--"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Weight</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                          <Scale className="w-3 h-3 text-muted-foreground" /> {data.weight || "--"}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-black">Donor Status</span>
                      <div className="flex items-center gap-1.5">
                        <Heart className={`w-3 h-3 ${data.organDonor ? 'text-primary fill-primary' : 'text-white/20'}`} />
                        <span className="text-[9px] font-black text-white">{data.organDonor ? "ORGAN DONOR" : "NOT LISTED"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                    <Info className="w-3 h-3" /> Important Notes
                  </div>
                  <p className="text-[9px] text-white/70 leading-relaxed italic line-clamp-2">
                    {data.medications || "No additional medications or special instructions provided."}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-accent" />
                    DETAILED MEDICAL RECORD
                  </div>
                  <span>CLICK TO FLIP</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <p className="text-[10px] text-muted-foreground/60 font-medium">Click card to flip and view details</p>
    </div>
  );
}
