"use client";

import { Phone, Droplets, AlertCircle, Info, Activity, User, ShieldAlert, MapPin, Calendar, FileText, Download, Image as ImageIcon, Pill } from "lucide-react";

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
  gender?: string;
  history: any[];
}

export default function PublicEmergencyProfile({ data }: { data: PublicMedicalRecord }) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">


      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Profile Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2.5rem] bg-card border-2 border-white/5 overflow-hidden shadow-2xl">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 sm:w-16 sm:h-16 text-white/10 m-7 sm:m-8" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-destructive flex items-center justify-center border-4 border-background shadow-xl">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{data.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-1">
              <p className="text-destructive font-bold text-lg sm:text-xl">{data.bloodGroup}</p>
              <div className="hidden xs:block w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-xs sm:text-sm font-bold uppercase">{data.gender || "N/A"}</span>
              </div>
              <div className="hidden xs:block w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">{data.dob || "Unknown DOB"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Action: Call Emergency Contact */}
        <a 
          href={`tel:${data.emergencyPhone}`}
          className="flex items-center justify-between p-5 sm:p-6 bg-destructive rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.3)] emergency-pulse hover:brightness-110 active:scale-95 transition-all"
        >
          <div className="text-left">
            <span className="text-[11px] sm:text-[12px] uppercase font-black text-white/60 tracking-[0.1em]">Emergency Contact</span>
            <p className="text-base sm:text-lg font-black text-white leading-none mt-1">{data.emergencyName}</p>
            <p className="text-[11px] sm:text-xs text-white/70 font-bold mt-1 tracking-wider">{data.emergencyPhone}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
        </a>

        {/* Medical Alerts Section */}
        <div className="space-y-4">
          <SectionTitle icon={<AlertCircle className="w-5 h-5 text-destructive" />} title="Critical Allergies" />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            {data.allergies.length > 0 ? data.allergies.map((a) => {
              const isMed = a.startsWith('💊 ');
              const displayName = isMed ? a.replace('💊 ', '') : a;
              return (
                <div key={a} className="relative">
                  {isMed && (
                    <div className="absolute -top-1 -left-1 z-10">
                      <div className="w-5 h-2.5 bg-blue-500 rounded-full shadow-md border border-blue-100 flex items-center overflow-hidden rotate-[-35deg] relative">
                        <div className="w-1/2 h-full bg-blue-500" />
                        <div className="w-1/2 h-full bg-white" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/10 pointer-events-none" />
                      </div>
                    </div>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl border font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 ${
                      isMed 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}
                  >
                    {displayName}
                  </div>
                </div>
              );
            }) : <p className="text-muted-foreground text-sm italic col-span-2">No known allergies</p>}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon={<Activity className="w-5 h-5 text-accent" />} title="Medical Conditions" />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            {data.medicalConditions.length > 0 ? data.medicalConditions.map((condition) => (
              <AlertCard key={condition} label={condition} variant="accent" />
            )) : <p className="text-muted-foreground text-sm italic col-span-2">No chronic conditions</p>}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase font-bold tracking-[0.15em] px-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              Residential Address
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-sm text-white/80 leading-relaxed border border-white/5">
              {data.address || "No address information provided."}
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase font-bold tracking-[0.15em] px-1">
              <Info className="w-3.5 h-3.5" />
              Additional Medical Notes
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-sm text-white/80 leading-relaxed italic border border-white/5">
              {data.medications || "No additional medications or special instructions provided."}
            </div>
          </div>
        </div>

        {/* Medical History Timeline */}
        {data.history && data.history.length > 0 && (
          <div className="space-y-4">
            <SectionTitle icon={<FileText className="w-5 h-5 text-primary" />} title="Medical History" />
            <div className="space-y-4">
              {data.history.map((item: any, idx: number) => (
                <div key={idx} className="glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg tracking-tight">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      {item.date}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-white/60 leading-relaxed italic mb-4 pl-10 border-l border-white/5 ml-4">
                      {item.description}
                    </p>
                  )}
                  {item.files && item.files.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      {item.files.map((file: { name: string, url: string }, fIdx: number) => {
                        const url = file.url;
                        const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const extension = url.startsWith('data:') 
                          ? (url.match(/data:image\/(\w+)/)?.[1] || url.match(/data:application\/(\w+)/)?.[1] || 'bin')
                          : url.split('.').pop()?.split('?')[0] || 'file';

                        return (
                          <div key={fIdx} className="flex flex-col gap-2">
                            <a 
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={file.name}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/file cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                {isImage ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                                <span className="text-xs font-bold text-white/80">{file.name}</span>
                              </div>
                              <Download className="w-4 h-4 text-muted-foreground group-hover/file:text-white transition-colors" />
                            </a>
                            {isImage && (
                              <div className="mt-1 rounded-xl overflow-hidden border border-white/5 bg-white/5 p-1">
                                <img src={url} alt={file.name} className="w-full h-auto max-h-40 object-cover rounded-lg" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 px-2">
      {icon}
      <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
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
