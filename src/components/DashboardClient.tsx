"use client";

import { useState, useEffect, useRef } from "react";
import EmergencyCard from "@/components/EmergencyCard";
import { QrCode, Download, Share2, Edit3, Shield, Settings, LogOut, Droplets, Calendar, Phone, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import { signOut } from "next-auth/react";
import EditRecordModal from "@/components/EditRecordModal";

export default function DashboardClient({ initialData, userId }: { initialData: any, userId: string }) {
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    const toastId = toast.loading("Generating your high-res card...");
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Emergency-Card-${initialData.fullName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate image. Please try again.", { id: toastId });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/v/${initialData.publicId}`;
    navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold tracking-tight text-xl">Life ID</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-destructive/10 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">Your Digital Identity</h1>
              <p className="text-muted-foreground">Welcome back, {initialData.fullName.split(' ')[0]}. Your card is ready.</p>
            </div>

            <div className="glass rounded-[3rem] p-6 sm:p-16 flex flex-col items-center border-white/5 w-full">
              <div ref={cardRef} className="w-full flex justify-center perspective-1000">
                <EmergencyCard data={initialData} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-10">
                <button 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download PNG
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 text-white rounded-2xl text-sm font-bold transition-all hover:bg-white/10 border border-white/5 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" /> Copy Link
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> 
                <span className="tracking-tight">Current Status</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <StatusCard 
                  icon={<Droplets className="w-4 h-4 text-primary" />} 
                  label="Blood Group" 
                  value={initialData.bloodGroup} 
                  accent="border-primary/20 bg-primary/5"
                />
                <StatusCard 
                  icon={<Calendar className="w-4 h-4 text-accent" />} 
                  label="Date of Birth" 
                  value={initialData.dob || "Not Set"} 
                  accent="border-accent/20 bg-accent/5"
                />
                <StatusCard 
                  icon={<Phone className="w-4 h-4 text-green-500" />} 
                  label="Emergency Call" 
                  value={initialData.emergencyPhone} 
                  accent="border-green-500/20 bg-green-500/5"
                />
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5" />
                    Key Medical Data
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {initialData.allergies.length > 0 ? (
                      initialData.allergies.map((a: string) => (
                        <span key={a} className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-bold border border-destructive/20">{a}</span>
                      ))
                    ) : <span className="text-[10px] text-muted-foreground italic">No Allergies</span>}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Medical Record
              </button>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold">Public URL</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 italic">
                {mounted ? `${window.location.origin}/v/${initialData.publicId}` : "Loading URL..."}
              </p>
              <button 
                onClick={handleShare}
                className="w-full py-3 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
              >
                Copy Public Safety Link
              </button>
            </div>
          </div>
        </div>
      </div>
      <EditRecordModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={initialData} 
      />
    </div>
  );
}

function StatusCard({ icon, label, value, accent }: { icon: React.ReactNode, label: string, value: string, accent: string }) {
  return (
    <div className={`p-4 rounded-2xl border ${accent} flex items-center justify-between group/card transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className="text-sm font-black tracking-tight">{value}</span>
        </div>
      </div>
    </div>
  );
}

function VitalsItem({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{label}</span>
      <span className={`text-sm font-black tracking-tight ${color}`}>{value}</span>
    </div>
  );
}
