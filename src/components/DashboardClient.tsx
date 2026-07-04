"use client";

import { useState, useEffect, useRef } from "react";
import EmergencyCard from "@/components/EmergencyCard";
import { QrCode, Download, Share2, Edit3, Shield, LogOut, Droplets, Calendar, Phone, Activity, Pill, ChevronDown, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import { signOut } from "next-auth/react";
import EditRecordModal from "@/components/EditRecordModal";
import { jsPDF } from "jspdf";

export default function DashboardClient({ initialData, userId }: { initialData: any, userId: string }) {
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const isProfileIncomplete = !initialData.fullName || 
                            !initialData.bloodGroup || 
                            !initialData.emergencyName || 
                            !initialData.emergencyPhone || 
                            !initialData.dob || 
                            !initialData.gender;

  // 3D Tilt Hook Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const shineOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0.2, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-sky-500/10">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black font-outfit tracking-tight text-xl text-slate-800">
              Pulse<span className="text-primary">ID</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-950 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Edit Card</span>
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-destructive/10 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-destructive" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight leading-tight text-slate-900">Your Digital Identity</h1>
              <p className="text-slate-500 text-sm font-medium">Welcome back, {initialData.fullName.split(' ')[0]}. Your card is ready.</p>
              
              {isProfileIncomplete && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3"
                >
                  <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Profile Incomplete</p>
                    <p className="text-[11px] text-sky-600 font-medium leading-relaxed">
                      Please complete your medical details (DOB, Gender, and Emergency Name) to enable sharing and high-resolution downloads.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-4 sm:p-16 flex flex-col items-center border border-slate-100 shadow-md w-full overflow-hidden">
              <div 
                className="w-full flex justify-center perspective-1000"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div 
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                  className="relative group cursor-pointer transition-shadow"
                >
                  <EmergencyCard data={initialData} />
                  
                  {/* Premium Shine Effect */}
                  <motion.div 
                    style={{ opacity: shineOpacity }}
                    className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" 
                  />
                  
                  {/* Subtle Floating Shadow */}
                  <div className="absolute -inset-4 bg-sky-500/10 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity -z-10 rounded-full" />
                </motion.div>
              </div>
              
              <div className="flex flex-col gap-4 w-full max-w-md mt-10">
                <div className="relative w-full" ref={dropdownRef}>
                  <button 
                    onClick={() => !isProfileIncomplete && setIsDownloadOpen(!isDownloadOpen)}
                    disabled={isProfileIncomplete}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl text-sm font-bold transition-all shadow-[0_10px_20px_-10px_rgba(14,165,233,0.4)] ${isDownloadOpen ? 'ring-2 ring-primary/50' : ''} ${isProfileIncomplete ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'cursor-pointer hover:bg-sky-600 hover:scale-[1.02]'}`}
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Your Card</span>
                    <ChevronDown className={`w-5 h-5 ml-1 transition-transform duration-300 ${isDownloadOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDownloadOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 w-full mb-3 p-2 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[60] overflow-hidden"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              handleDownloadPDF();
                              setIsDownloadOpen(false);
                            }}
                            className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-all group text-left w-full cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-white transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">Download PDF Document</span>
                              <span className="text-[10px] text-slate-500 font-medium">Ready for high-quality printing</span>
                            </div>
                          </button>

                          <div className="h-px bg-slate-100 mx-2" />

                          <button
                            onClick={() => {
                              handleDownloadPNG();
                              setIsDownloadOpen(false);
                            }}
                            className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-all group text-left w-full cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white transition-colors">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">Export PNG Images</span>
                              <span className="text-[10px] text-slate-500 font-medium">Front & Back high-res files</span>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={() => !isProfileIncomplete && handleShare()}
                  disabled={isProfileIncomplete}
                  className={`w-full relative overflow-hidden group p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm transition-all ${isProfileIncomplete ? 'opacity-40 grayscale cursor-not-allowed font-medium' : 'hover:border-slate-300 hover:bg-slate-50 cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform duration-300 ${!isProfileIncomplete && 'group-hover:scale-110'}`}>
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-sm font-bold text-slate-800 transition-colors ${!isProfileIncomplete && 'group-hover:text-primary'}`}>Share Your Public Profile</span>
                      <span className="text-[10px] text-slate-500 font-medium">Copy a scannable link for first responders</span>
                    </div>
                  </div>
                  {!isProfileIncomplete && <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
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
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors" />
              
              <h3 className="text-lg font-black font-outfit mb-8 flex items-center gap-2 text-slate-800">
                <Shield className="w-4 h-4 text-primary" /> 
                <span className="tracking-tight uppercase text-xs">Current Status</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <StatusCard 
                  icon={<Droplets className="w-4 h-4 text-primary fill-primary/10" />} 
                  label="Blood Group" 
                  value={initialData.bloodGroup} 
                  accent="border-slate-100 bg-slate-50/50"
                />
                <StatusCard 
                  icon={<Calendar className="w-4 h-4 text-teal-600" />} 
                  label="Date of Birth" 
                  value={initialData.dob || "Not Set"} 
                  accent="border-slate-100 bg-slate-50/50"
                />
                <StatusCard 
                  icon={<Phone className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />} 
                  label="Emergency Call" 
                  value={initialData.emergencyPhone} 
                  accent="border-slate-100 bg-slate-50/50"
                />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                                  ? 'bg-sky-50 text-sky-600 border-sky-200 pl-3' 
                                  : 'bg-red-50 text-red-600 border-red-200'
                              }`}
                            >
                              {displayName}
                            </span>
                          </div>
                        );
                      })
                    ) : <span className="text-[10px] text-slate-400 italic font-medium">No Allergies</span>}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 text-sm font-bold transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Medical Record
              </button>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-sm tracking-tight text-sky-800">Safety Profile</h4>
              </div>

              <p className="text-[11px] text-sky-600 font-medium leading-relaxed mb-6 italic opacity-90">
                This is the live profile that first responders will see when scanning your digital identity card.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => !isProfileIncomplete && window.open(`${window.location.origin}/v/${initialData.publicId}`, '_blank')}
                  disabled={isProfileIncomplete}
                  className={`w-full py-4 bg-primary text-white text-xs font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 ${isProfileIncomplete ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'hover:bg-sky-600 cursor-pointer'}`}
                >
                  See Your Public Data <ExternalLink className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => !isProfileIncomplete && handleShare()}
                  disabled={isProfileIncomplete}
                  className={`w-full py-3 bg-white text-slate-600 text-[10px] font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 ${isProfileIncomplete ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:text-slate-800 hover:bg-slate-50 cursor-pointer'}`}
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy Profile URL
                </button>
              </div>
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
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className="text-sm font-black tracking-tight text-slate-800">{value}</span>
        </div>
      </div>
    </div>
  );
}

function VitalsItem({ label, value, color = "text-slate-800" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">{label}</span>
      <span className={`text-sm font-black tracking-tight ${color}`}>{value}</span>
    </div>
  );
}
