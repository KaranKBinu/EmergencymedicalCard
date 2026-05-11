"use client";

import { QrCode, Phone, Droplets, User, Calendar, MapPin, Activity, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface EmergencyData {
  fullName: string;
  bloodGroup: string;
  emergencyPhone: string;
  emergencyName: string;
  emergencyRelation: string;
  allergies?: string[];
  medicalConditions?: string[];
  photoUrl?: string;
}

export default function EmergencyCard({ data }: { data: EmergencyData }) {
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/v/sample-id` : "";

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* The Physical Card Mockup */}
      <div className="relative w-full max-w-[400px] aspect-[1.6/1] rounded-[1.5rem] overflow-hidden shadow-2xl group transition-all duration-500 hover:scale-[1.02]">
        {/* Background Design */}
        <div className="absolute inset-0 bg-[#0a0a0c]" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full" />
        
        {/* Card Content */}
        <div className="relative h-full p-6 flex flex-col justify-between border border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
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
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Emergency Identity</span>
                </div>
              </div>
            </div>
            
            <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20">
              <QRCodeSVG value={publicUrl} size={64} level="H" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Blood Group</span>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-lg font-bold text-white">{data.bloodGroup}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Emergency Call</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-lg font-bold text-white tracking-tight">{data.emergencyPhone}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-[9px] text-muted-foreground font-medium">SCAN FOR FULL MEDICAL HISTORY</span>
            <div className="flex gap-1">
              {data.allergies?.slice(0, 2).map((a) => (
                <div key={a} className="w-1.5 h-1.5 rounded-full bg-primary" />
              ))}
              {data.medicalConditions?.slice(0, 2).map((c) => (
                <div key={c} className="w-1.5 h-1.5 rounded-full bg-accent" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
