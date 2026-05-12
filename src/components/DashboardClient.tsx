"use client";

import { useState, useEffect, useRef } from "react";
import EmergencyCard from "@/components/EmergencyCard";
import { QrCode, Download, Share2, Edit3, Shield, LogOut, Droplets, Calendar, Phone, Activity, Pill } from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import { signOut } from "next-auth/react";
import EditRecordModal from "@/components/EditRecordModal";
import { jsPDF } from "jspdf";

export default function DashboardClient({ initialData, userId }: { initialData: any, userId: string }) {
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadPNG = async () => {
    const toastId = toast.loading("Generating high-resolution PNGs...");
    try {
      if (!frontRef.current || !backRef.current) return;
      
      const frontDataUrl = await toPng(frontRef.current, { pixelRatio: 3 });
      const backDataUrl = await toPng(backRef.current, { pixelRatio: 3 });
      
      const download = (url: string, side: string) => {
        const link = document.createElement('a');
        link.download = `Emergency-Card-${side}-${initialData.fullName.replace(/\s+/g, '-')}.png`;
        link.href = url;
        link.click();
      };
      
      download(frontDataUrl, 'Front');
      setTimeout(() => download(backDataUrl, 'Back'), 500);
      
      toast.success("PNGs downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate PNGs.", { id: toastId });
    }
  };

  const handleDownloadPDF = async () => {
    const toastId = toast.loading("Preparing your PDF document...");
    try {
      if (!frontRef.current || !backRef.current) return;
      
      // Capture both sides
      const frontImg = await toPng(frontRef.current, { pixelRatio: 2 });
      const backImg = await toPng(backRef.current, { pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const cardWidth = 120; // 12cm
      const cardHeight = (cardWidth / 1.582);
      const margin = (pageWidth - cardWidth) / 2;
      
      // Add Title (Centered)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(30, 30, 30);
      const title = "Emergency Medical Identity";
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 35);
      
      // Add Subtitle
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const subtitle = `Digital Safety Profile for ${initialData.fullName}`;
      const subtitleWidth = pdf.getTextWidth(subtitle);
      pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 42);

      // Add a subtle line
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, 48, pageWidth - margin, 48);
      
      // Add Front Card
      pdf.addImage(frontImg, 'PNG', margin, 60, cardWidth, cardHeight);
      
      // Add Back Card
      pdf.addImage(backImg, 'PNG', margin, 70 + cardHeight, cardWidth, cardHeight);
      
      // Add Instructions Box
      const footerY = 85 + (cardHeight * 2);
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, footerY, cardWidth, 25, 3, 3, 'F');
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      pdf.text("PRINTING INSTRUCTIONS", margin + 5, footerY + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const instructions = [
        "1. Print this document on high-quality A4 paper or cardstock.",
        "2. Carefully cut along the edges of both card sides.",
        "3. Fold or glue the sides together to create your double-sided emergency card.",
        "4. Place in your wallet or behind your phone case for easy access."
      ];
      instructions.forEach((line, i) => {
        pdf.text(line, margin + 5, footerY + 14 + (i * 3.5));
      });
      
      // Add Metadata
      pdf.setFontSize(7);
      pdf.text(`Issued: ${new Date().toLocaleDateString()}  |  ID: ${initialData.publicId.slice(0, 8)}`, margin, 280);
      
      pdf.save(`Medical-ID-${initialData.fullName.replace(/\s+/g, '-')}.pdf`);
      toast.success("PDF document ready!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: toastId });
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
            <span className="font-black font-outfit tracking-tight text-xl">Life ID</span>
          </div>
          <div className="flex items-center gap-4">

            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-destructive/10 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight leading-tight">Your Digital Identity</h1>
              <p className="text-muted-foreground text-sm">Welcome back, {initialData.fullName.split(' ')[0]}. Your card is ready.</p>
            </div>

            <div className="glass rounded-[2.5rem] sm:rounded-[3rem] p-4 sm:p-16 flex flex-col items-center border-white/5 w-full">
              <div ref={cardRef} className="w-full flex justify-center perspective-1000">
                <EmergencyCard data={initialData} />
              </div>
              
              <div className="flex flex-col gap-4 w-full max-w-md mt-10">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-sm font-bold transition-all hover:opacity-90 cursor-pointer shadow-[0_10px_20px_-10px_rgba(239,68,68,0.5)]"
                  >
                    <Download className="w-5 h-5" /> Download PDF
                  </button>
                  <button 
                    onClick={handleDownloadPNG}
                    className="flex items-center justify-center gap-2 py-4 bg-white/5 text-white rounded-2xl text-sm font-bold transition-all hover:bg-white/10 border border-white/5 cursor-pointer"
                  >
                    <QrCode className="w-5 h-5" /> Export PNGs
                  </button>
                </div>
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-white transition-colors text-xs font-medium"
                >
                  <Share2 className="w-4 h-4" /> Share Scannable Profile URL
                </button>
              </div>

              <div className="fixed -left-[4000px] top-0 pointer-events-none opacity-0">
                <div ref={frontRef} style={{ width: '480px' }}>
                  <EmergencyCard data={initialData} forcedSide="front" />
                </div>
                <div ref={backRef} style={{ width: '480px' }} className="mt-4">
                  <EmergencyCard data={initialData} forcedSide="back" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <h3 className="text-lg font-black font-outfit mb-8 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> 
                <span className="tracking-tight uppercase text-xs">Current Status</span>
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
                      initialData.allergies.map((a: string) => {
                        const isMed = a.startsWith('💊 ');
                        const displayName = isMed ? a.replace('💊 ', '') : a;
                        return (
                          <div key={a} className="relative">
                            {isMed && (
                              <div className="absolute -top-0.5 -left-0.5 z-10">
                                <div className="w-3.5 h-1.5 bg-blue-500 rounded-full shadow-sm border border-blue-100 flex items-center overflow-hidden rotate-[-35deg] relative">
                                  <div className="w-1/2 h-full bg-blue-500" />
                                  <div className="w-1/2 h-full bg-white" />
                                </div>
                              </div>
                            )}
                            <span 
                              className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                                isMed 
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] pl-3' 
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }`}
                            >
                              {displayName}
                            </span>
                          </div>
                        );
                      })
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
