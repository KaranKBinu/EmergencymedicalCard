"use client";

import { Phone, Droplets, AlertCircle, Info, Activity, User, ShieldAlert, MapPin, Calendar } from "lucide-react";

interface PublicMedicalRecord {
  fullName: string;
  photoUrl?: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyPhone: string;
  medicalConditions: string[];
  allergies: string[];
  medications?: string;
  address?: string;
  dob?: string;
}

export default function PublicEmergencyProfile({ data }: { data: PublicMedicalRecord }) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Critical Header */}
      <div className="bg-destructive/10 border-b border-destructive/20 py-4 px-6 sticky top-0 backdrop-blur-md z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-tighter text-destructive">Emergency Medical Profile</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-destructive text-white text-[10px] font-black uppercase">Critical</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-10 space-y-8">
        {/* Profile Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-card border-2 border-white/5 overflow-hidden shadow-2xl">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white/10 m-8" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-destructive flex items-center justify-center border-4 border-background shadow-xl">
              <Droplets className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{data.fullName}</h1>
            <div className="flex items-center justify-center gap-4 mt-1">
              <p className="text-destructive font-bold text-xl">{data.bloodGroup} Positive</p>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold">{data.dob || "Unknown DOB"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Action: Call Emergency Contact */}
        <a 
          href={`tel:${data.emergencyPhone}`}
          className="flex items-center justify-between p-6 bg-destructive rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.3)] emergency-pulse hover:brightness-110 active:scale-95 transition-all"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-white/60 tracking-widest">Emergency Contact</span>
            <p className="text-lg font-black text-white leading-none mt-1">{data.emergencyName}</p>
            <p className="text-xs text-white/70 font-bold mt-1 tracking-wider">{data.emergencyPhone}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white fill-white" />
          </div>
        </a>

        {/* Medical Alerts Section */}
        <div className="space-y-4">
          <SectionTitle icon={<AlertCircle className="w-5 h-5 text-destructive" />} title="Critical Allergies" />
          <div className="grid grid-cols-2 gap-3">
            {data.allergies.length > 0 ? data.allergies.map((allergy) => (
              <AlertCard key={allergy} label={allergy} variant="destructive" />
            )) : <p className="text-muted-foreground text-sm italic col-span-2">No known allergies</p>}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon={<Activity className="w-5 h-5 text-accent" />} title="Medical Conditions" />
          <div className="grid grid-cols-2 gap-3">
            {data.medicalConditions.length > 0 ? data.medicalConditions.map((condition) => (
              <AlertCard key={condition} label={condition} variant="accent" />
            )) : <p className="text-muted-foreground text-sm italic col-span-2">No chronic conditions</p>}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-widest px-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              Residential Address
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-sm text-white/80 leading-relaxed border border-white/5">
              {data.address || "No address information provided."}
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-widest px-1">
              <Info className="w-3.5 h-3.5" />
              Additional Medical Notes
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-sm text-white/80 leading-relaxed italic border border-white/5">
              {data.medications || "No additional medications or special instructions provided."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 px-2">
      {icon}
      <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{title}</h2>
    </div>
  );
}

function AlertCard({ label, variant }: { label: string, variant: 'destructive' | 'accent' }) {
  const styles = variant === 'destructive' 
    ? 'bg-destructive/10 border-destructive/20 text-destructive' 
    : 'bg-accent/10 border-accent/20 text-accent';
  
  return (
    <div className={`px-4 py-3 rounded-2xl border font-bold text-sm text-center ${styles}`}>
      {label}
    </div>
  );
}
