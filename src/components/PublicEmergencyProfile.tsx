"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Droplets, AlertCircle, Info, Activity, User, ShieldAlert, MapPin, Calendar, FileText, Download, Image as ImageIcon, Pill, X } from "lucide-react";

interface PublicMedicalRecord {
  fullName: string;
  photoUrl?: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyPhone: string;
  medicalConditions: string[];
  allergies: string[];
  currentMedications?: string[];
  medications?: string;
  address?: string;
  dob?: string;
  gender?: string;
  history: any[];
}

export default function PublicEmergencyProfile({ data }: { data: PublicMedicalRecord }) {
  const [activePreview, setActivePreview] = useState<{ name: string, url: string } | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Clinical Header Badge */}
      <div className="max-w-lg mx-auto pt-6 px-6">
        <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Emergency Medical ID</p>
              <p className="text-xs font-black text-slate-800 leading-none mt-0.5">PulseID Profile</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-black uppercase text-teal-600 tracking-wider">
            Verified Active
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-6 space-y-8">
        {/* Profile Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white border-2 border-slate-100 overflow-hidden shadow-2xl">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-200 m-8" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-[#ef4444] flex items-center justify-center border-4 border-white shadow-xl">
              <Droplets className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{data.fullName}</h1>
            <div className="flex items-center justify-center gap-4 mt-1.5 font-bold">
              <p className="text-[#ef4444] text-xl">{data.bloodGroup}</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="text-sm font-bold uppercase">{data.gender || "N/A"}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold">{data.dob || "Unknown DOB"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Action: Call Emergency Contact */}
        <a 
          href={`tel:${data.emergencyPhone}`}
          className="flex items-center justify-between p-6 bg-red-600 rounded-[2rem] shadow-lg shadow-red-500/20 hover:bg-red-700 hover:brightness-110 active:scale-95 transition-all"
        >
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-white/80 tracking-widest">Emergency Contact</span>
            <p className="text-lg font-black text-white leading-none mt-1">{data.emergencyName}</p>
            <p className="text-xs text-white/90 font-bold mt-1 tracking-wider">{data.emergencyPhone}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white fill-white" />
          </div>
        </a>

        {/* Medical Alerts Section */}
        <div className="space-y-4">
          <SectionTitle icon={<AlertCircle className="w-5 h-5 text-[#ef4444]" />} title="Critical Allergies" />
          <div className="grid grid-cols-2 gap-3">
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
                    className={`px-4 py-3 rounded-2xl border font-black text-sm text-center flex items-center justify-center gap-2 ${
                      isMed 
                        ? 'bg-sky-50 border-sky-200 text-sky-600 shadow-sm' 
                        : 'bg-red-50 border-red-200 text-[#ef4444] shadow-sm'
                    }`}
                  >
                    {displayName}
                  </div>
                </div>
              );
            }) : <p className="text-slate-400 text-sm italic font-medium col-span-2">No known allergies</p>}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle icon={<Activity className="w-5 h-5 text-teal-650" />} title="Medical Conditions" />
          <div className="grid grid-cols-2 gap-3">
            {data.medicalConditions.length > 0 ? data.medicalConditions.map((condition) => (
              <AlertCard key={condition} label={condition} variant="accent" />
            )) : <p className="text-slate-400 text-sm italic font-medium col-span-2">No chronic conditions</p>}
          </div>
        </div>

        {/* Current Medications Section */}
        {data.currentMedications && data.currentMedications.length > 0 && (
          <div className="space-y-4">
            <SectionTitle icon={<Pill className="w-5 h-5 text-sky-650" />} title="Current Medications" />
            <div className="grid grid-cols-2 gap-3">
              {data.currentMedications.map((m) => (
                <div key={m} className="px-4 py-3 rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 font-black text-sm text-center">
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-100 shadow-md rounded-[2rem] p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-extrabold tracking-widest px-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              Residential Address
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-sm text-slate-700 leading-relaxed border border-slate-200/60 font-medium">
              {data.address || "No address information provided."}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-extrabold tracking-widest px-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Additional Medical Notes
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-sm text-slate-700 leading-relaxed italic border border-slate-200/60 font-medium">
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
                <div key={idx} className="bg-white border border-slate-100 shadow-md rounded-[2rem] p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-sky-500/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-lg tracking-tight">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                      {item.date}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-slate-600 leading-relaxed italic mb-4 pl-10 border-l border-slate-200 ml-4">
                      {item.description}
                    </p>
                  )}
                  {item.files && item.files.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      {item.files.map((file: { name: string, url: string }, fIdx: number) => {
                        const url = file.url;
                        const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isPdf = url.match(/\.pdf$/i) || url.startsWith('data:application/pdf');

                        return (
                          <div 
                            key={fIdx}
                            onClick={() => setActivePreview({ name: file.name, url })}
                            className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all group/file cursor-pointer shadow-sm"
                          >
                            {/* File Info Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isImage ? <ImageIcon className="w-4 h-4 text-primary" /> : isPdf ? <FileText className="w-4 h-4 text-rose-500" /> : <FileText className="w-4 h-4 text-primary" />}
                                <span className="text-xs font-bold text-slate-700 group-hover/file:text-primary transition-colors">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover/file:text-primary transition-colors pr-1">Preview</span>
                                <a 
                                  href={url}
                                  download={file.name}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-650 transition-all"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            {/* Unified Preview Box inside Capsule */}
                            {isImage && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shadow-inner">
                                <img src={url} alt={file.name} className="w-full h-auto max-h-40 object-cover rounded-lg" />
                              </div>
                            )}
                            {isPdf && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shadow-inner h-40 relative flex items-center justify-center">
                                <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded-lg bg-white border-0 pointer-events-none select-none overflow-hidden" style={{ minHeight: '150px' }} />
                                {/* Overlay to block interaction and show indicator */}
                                <div className="absolute inset-0 bg-slate-950/[0.01] hover:bg-slate-950/[0.04] transition-colors rounded-lg flex items-end p-2.5">
                                  <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
                                    <FileText className="w-2.5 h-2.5" /> PDF Document
                                  </span>
                                </div>
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

      {/* ── File Preview Modal ── */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePreview(null)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">File Preview</p>
                    <h3 className="text-sm font-black text-slate-800 truncate max-w-[200px] sm:max-w-md">{activePreview.name}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a
                    href={activePreview.url}
                    download={activePreview.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button 
                    onClick={() => setActivePreview(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewport Content */}
              <div className="flex-1 p-6 bg-slate-950 flex items-center justify-center overflow-y-auto max-h-[70vh]">
                {(() => {
                  const url = activePreview.url;
                  const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  const isPdf = url.match(/\.pdf$/i) || url.startsWith('data:application/pdf');

                  if (isImage) {
                    return (
                      <img 
                        src={url} 
                        alt={activePreview.name} 
                        className="max-w-full max-h-[60vh] object-contain rounded-xl"
                      />
                    );
                  } else if (isPdf) {
                    return (
                      <iframe 
                        src={url} 
                        className="w-full h-[60vh] rounded-xl bg-white border-0" 
                        title={activePreview.name}
                      />
                    );
                  } else {
                    return (
                      <div className="text-center py-12 text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="font-bold">No preview available for this file type.</p>
                        <p className="text-xs mt-1">Please download the file to view it.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 px-2">
      {icon}
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-450">{title}</h2>
    </div>
  );
}

function AlertCard({ label, variant }: { label: string, variant: 'destructive' | 'accent' }) {
  const styles = variant === 'destructive' 
    ? 'bg-red-50 border-red-200 text-red-655' 
    : 'bg-teal-50 border-teal-200 text-teal-655';
  
  return (
    <div className={`px-4 py-3 rounded-2xl border font-bold text-sm text-center ${styles}`}>
      {label}
    </div>
  );
}
