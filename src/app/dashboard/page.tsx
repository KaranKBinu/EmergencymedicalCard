"use client";

import { useState } from "react";
import EmergencyCard from "@/components/EmergencyCard";
import { QrCode, Download, Share2, Edit3, Shield, Settings, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [userData] = useState({
    fullName: "Karan K Binu",
    bloodGroup: "O+",
    emergencyPhone: "+91 98765 43210",
    emergencyName: "Binu K",
    emergencyRelation: "Father",
    allergies: ["Peanuts", "Penicillin"],
    medicalConditions: ["Asthma"],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = () => {
    toast.success("Downloading your Emergency Identity Card...");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + "/v/sample-id");
    toast.success("Public URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      {/* Sidebar / Top Nav for Mobile */}
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
            <button className="p-2 hover:bg-destructive/10 rounded-xl transition-all group">
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Card Preview & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">Your Digital Identity</h1>
              <p className="text-muted-foreground">Keep this information up to date for your safety.</p>
            </div>

            <div className="glass rounded-[3rem] p-4 sm:p-12 flex flex-col items-center border-white/5">
              <EmergencyCard data={userData} />
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
                <ActionButton 
                  icon={<Download className="w-5 h-5" />} 
                  label="Download" 
                  onClick={handleDownload}
                  variant="primary"
                />
                <ActionButton 
                  icon={<Share2 className="w-5 h-5" />} 
                  label="Share Link" 
                  onClick={handleShare}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Vitals Summary */}
          <div className="space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" /> Quick Update
              </h3>
              
              <div className="space-y-6">
                <VitalsItem label="Blood Group" value={userData.bloodGroup} color="text-primary" />
                <VitalsItem label="Emergency Contact" value={userData.emergencyPhone} />
                <VitalsItem label="Primary Allergy" value={userData.allergies[0]} color="text-destructive" />
                <VitalsItem label="Active Condition" value={userData.medicalConditions[0]} color="text-accent" />
              </div>

              <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all border border-white/5">
                Edit Full Medical Record
              </button>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold">Public Safety URL</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                This URL can be scanned by medical staff. It only shows critical info, hiding your address and sensitive history.
              </p>
                <code className="block p-3 bg-black/40 rounded-xl text-[10px] text-primary/80 break-all border border-primary/5">
                  {mounted ? window.location.origin : ""}/v/sample-id
                </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, variant = 'secondary' }: { icon: React.ReactNode, label: string, onClick: () => void, variant?: 'primary' | 'secondary' }) {
  const styles = variant === 'primary' 
    ? 'bg-primary text-white hover:opacity-90' 
    : 'bg-white/5 text-white hover:bg-white/10 border border-white/5';

  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all ${styles}`}
    >
      {icon} {label}
    </button>
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
