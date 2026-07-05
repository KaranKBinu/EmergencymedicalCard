"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, AlertCircle, Info, Activity, User, MapPin, Calendar,
  FileText, Download, Image as ImageIcon, Pill, X,
  Shield, Clock
} from "lucide-react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } }
};

const glass = {
  background: "rgba(255,255,255,0.045)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
} as React.CSSProperties;

const glassDark = {
  background: "rgba(255,255,255,0.025)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
} as React.CSSProperties;

export default function PublicEmergencyProfile({ data }: { data: PublicMedicalRecord }) {
  const [activePreview, setActivePreview] = useState<{ name: string, url: string } | null>(null);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="min-h-screen text-white font-sans"
    >
      {/* ─────────────────────────────────────────────
          DESKTOP LAYOUT: two-column grid
          MOBILE: single stacked column
      ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ══════════════════════════════════════
              LEFT SIDEBAR — sticky on desktop
          ══════════════════════════════════════ */}
          <motion.aside
            variants={itemVariants}
            className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-8 space-y-4"
          >
            {/* Profile card */}
            <div
              className="rounded-[2rem] border border-white/8 p-6 flex flex-col items-center text-center space-y-4"
              style={glass}
            >
              {/* Avatar */}
              <div
                className="w-28 h-28 lg:w-36 lg:h-36 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/40 flex items-center justify-center"
                style={glassDark}
              >
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-white/15" />
                )}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white leading-tight">
                  {data.fullName}
                </h1>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-red-400 font-black text-base">{data.bloodGroup}</span>
                  {data.gender && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                      <span className="text-xs font-extrabold uppercase text-white/40 tracking-wider">{data.gender}</span>
                    </>
                  )}
                </div>
                {data.dob && (
                  <div className="flex items-center justify-center gap-1.5 text-white/35">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-bold">{data.dob}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Emergency call CTA */}
            <motion.a
              variants={itemVariants}
              href={`tel:${data.emergencyPhone}`}
              className="flex items-center justify-between p-5 rounded-[1.75rem] border border-red-500/30 hover:border-red-400/50 active:scale-95 transition-all cursor-pointer group shadow-xl shadow-red-500/10 w-full"
              style={{ background: "rgba(239,68,68,0.10)", backdropFilter: "blur(20px)" }}
            >
              <div className="text-left min-w-0 pr-3">
                <span className="text-[9px] uppercase font-black text-white/35 tracking-widest block mb-1">Emergency Contact</span>
                <p className="text-sm lg:text-base font-black text-white leading-tight group-hover:text-red-300 transition-colors truncate">{data.emergencyName}</p>
                <p className="text-xs text-red-300/65 font-bold mt-0.5 tracking-wider">{data.emergencyPhone}</p>
              </div>
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-red-500/15 border border-red-400/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-500/20">
                <Phone className="w-5 h-5 text-red-300 fill-red-300/20" />
              </div>
            </motion.a>


            {/* Address — sidebar desktop only */}
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-white/7 p-5 hidden lg:block"
              style={glass}
            >
              <div className="space-y-2">
                <SectionLabel icon={<MapPin className="w-3 h-3 text-teal-400/70" />} title="Address" />
                <div className="p-3 rounded-xl text-sm text-white/55 leading-relaxed border border-white/5 font-medium" style={glassDark}>
                  {data.address || "No address provided."}
                </div>
              </div>
            </motion.div>

            {/* PulseID badge */}
            <div className="flex items-center gap-2 justify-center pt-1">
              <Shield className="w-3 h-3 text-white/15" />
              <p className="text-[9px] text-white/18 font-bold uppercase tracking-widest">PulseID · Verified Emergency Profile</p>
            </div>
          </motion.aside>

          {/* ══════════════════════════════════════
              RIGHT MAIN CONTENT
          ══════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Critical Allergies ── */}
            <motion.div variants={itemVariants} className="space-y-3">
              <SectionTitle icon={<AlertCircle className="w-4 h-4 text-red-400" />} title="Critical Allergies" />
              {data.allergies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.allergies.map((a) => {
                    const isMed = a.startsWith('💊 ');
                    const displayName = isMed ? a.replace('💊 ', '') : a;
                    return (
                      <div key={a} className="relative">
                        {isMed && (
                          <div className="absolute -top-1 -left-1 z-10">
                            <div className="w-4 h-2 bg-sky-400 rounded-full border border-sky-300/20 flex items-center overflow-hidden rotate-[-35deg]">
                              <div className="w-1/2 h-full bg-sky-400" />
                              <div className="w-1/2 h-full bg-white/80" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl border font-black text-sm text-center hover:scale-[1.02] transition-transform ${
                            isMed ? 'border-sky-500/20 text-sky-300' : 'border-red-500/20 text-red-300'
                          }`}
                          style={{
                            background: isMed ? 'rgba(14,165,233,0.08)' : 'rgba(239,68,68,0.08)',
                            backdropFilter: 'blur(14px)',
                          }}
                        >
                          {displayName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="No known allergies recorded." />
              )}
            </motion.div>

            {/* ── Medical Conditions ── */}
            <motion.div variants={itemVariants} className="space-y-3">
              <SectionTitle icon={<Activity className="w-4 h-4 text-teal-400" />} title="Medical Conditions" />
              {data.medicalConditions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.medicalConditions.map((c) => (
                    <AlertCard key={c} label={c} variant="accent" />
                  ))}
                </div>
              ) : (
                <EmptyState text="No chronic conditions on record." />
              )}
            </motion.div>

            {/* ── Current Medications ── */}
            {data.currentMedications && data.currentMedications.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3">
                <SectionTitle icon={<Pill className="w-4 h-4 text-sky-400" />} title="Current Medications" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.currentMedications.map((m) => (
                    <div
                      key={m}
                      className="px-4 py-3 rounded-2xl border border-sky-500/18 text-sky-300 font-black text-sm text-center hover:scale-[1.02] transition-transform"
                      style={{ background: 'rgba(14,165,233,0.07)', backdropFilter: 'blur(14px)' }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Address — mobile only ── */}
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-white/7 p-5 lg:hidden"
              style={glass}
            >
              <div className="space-y-2">
                <SectionLabel icon={<MapPin className="w-3 h-3 text-teal-400/70" />} title="Address" />
                <div className="p-3 rounded-xl text-sm text-white/55 leading-relaxed border border-white/5 font-medium" style={glassDark}>
                  {data.address || "No address provided."}
                </div>
              </div>
            </motion.div>

            {/* ── Medical Notes — always visible, above history ── */}
            {data.medications && (
              <motion.div variants={itemVariants} className="space-y-3">
                <SectionTitle icon={<Info className="w-4 h-4 text-white/40" />} title="Medical Notes" />
                <div
                  className="rounded-[2rem] border border-white/7 p-5"
                  style={glass}
                >
                  <p className="text-sm text-white/60 leading-relaxed italic font-medium">
                    {data.medications}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Medical History ── */}
            {data.history && data.history.length > 0 && (
              <div className="space-y-3">
                <SectionTitle icon={<Clock className="w-4 h-4 text-sky-400" />} title="Medical History" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {data.history.map((item: any, idx: number) => (
                    <motion.div
                      variants={itemVariants}
                      key={idx}
                      className="rounded-[2rem] border border-white/7 p-5 lg:p-6 relative overflow-hidden group hover:border-sky-500/18 transition-colors"
                      style={glass}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/4 blur-2xl -mr-10 -mt-10 group-hover:bg-sky-500/6 transition-colors" />

                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 shrink-0 rounded-xl border border-sky-500/18 flex items-center justify-center"
                            style={{ background: 'rgba(14,165,233,0.09)' }}
                          >
                            <Activity className="w-4 h-4 text-sky-400" />
                          </div>
                          <h4 className="font-extrabold text-white text-sm lg:text-base tracking-tight leading-tight">{item.title}</h4>
                        </div>
                        <span
                          className="text-[9px] font-black text-white/35 uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/7 shrink-0 whitespace-nowrap"
                          style={glassDark}
                        >
                          {item.date}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-white/45 leading-relaxed italic mb-3 pl-10 border-l border-white/8 ml-4">
                          {item.description}
                        </p>
                      )}

                      {item.files && item.files.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 mt-3">
                          {item.files.map((file: { name: string, url: string }, fIdx: number) => {
                            const url = file.url;
                            const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const isPdf = url.match(/\.pdf$/i) || url.startsWith('data:application/pdf');
                            return (
                              <div
                                key={fIdx}
                                onClick={() => setActivePreview({ name: file.name, url })}
                                className="flex flex-col p-3 rounded-xl border border-white/7 hover:border-white/14 hover:scale-[1.005] transition-all group/file cursor-pointer"
                                style={glassDark}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isImage ? <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                                    <span className="text-xs font-bold text-white/50 group-hover/file:text-white/80 transition-colors truncate">{file.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] font-black uppercase text-white/25 group-hover/file:text-sky-400 transition-colors">Preview</span>
                                    <a
                                      href={url}
                                      download={file.name}
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 hover:bg-white/8 rounded-md text-white/25 hover:text-white/60 transition-all"
                                    >
                                      <Download className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                                {isImage && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-white/7">
                                    <img src={url} alt={file.name} className="w-full h-auto max-h-36 object-cover" />
                                  </div>
                                )}
                                {isPdf && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-white/7 h-36 relative flex items-center justify-center">
                                    <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded-lg border-0 pointer-events-none select-none" style={{ minHeight: '130px' }} />
                                    <div className="absolute bottom-2 left-2">
                                      <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500/80 text-white px-1.5 py-0.5 rounded flex items-center gap-1 border border-rose-400/20">
                                        <FileText className="w-2 h-2" /> PDF
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
          {/* end right content */}
        </div>
      </div>

      {/* ── File Preview Modal ── */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 lg:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePreview(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-4xl border border-white/10 rounded-[1.75rem] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
              style={{ background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(32px)' }}
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/7">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-xl border border-sky-500/20 flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <FileText className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/30">File Preview</p>
                    <h3 className="text-sm font-black text-white truncate max-w-[200px] sm:max-w-md lg:max-w-xl">{activePreview.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activePreview.url}
                    download={activePreview.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-white/20"
                    style={glassDark}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    onClick={() => setActivePreview(null)}
                    className="p-2 hover:bg-white/8 rounded-xl transition-all cursor-pointer text-white/40 hover:text-white border border-transparent hover:border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6 flex items-center justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,0.25)', maxHeight: '75vh' }}>
                {(() => {
                  const url = activePreview.url;
                  const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  const isPdf = url.match(/\.pdf$/i) || url.startsWith('data:application/pdf');
                  if (isImage) return <img src={url} alt={activePreview.name} className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl" />;
                  if (isPdf) return <iframe src={url} className="w-full h-[65vh] rounded-xl bg-white border-0" title={activePreview.name} />;
                  return (
                    <div className="text-center py-16 text-white/30">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-white/15" />
                      <p className="font-bold">No preview available.</p>
                      <p className="text-xs mt-1 text-white/20">Download the file to view it.</p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Sub-components ─── */

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-1">
      {icon}
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-white/35">{title}</h2>
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/28 text-[10px] uppercase font-extrabold tracking-widest">
      {icon}
      {title}
    </div>
  );
}


function AlertCard({ label, variant }: { label: string, variant: 'destructive' | 'accent' }) {
  const isDestructive = variant === 'destructive';
  return (
    <div
      className={`px-4 py-3 rounded-2xl border font-black text-sm text-center hover:scale-[1.02] transition-transform ${
        isDestructive ? 'border-red-500/18 text-red-300' : 'border-teal-500/18 text-teal-300'
      }`}
      style={{
        background: isDestructive ? 'rgba(239,68,68,0.07)' : 'rgba(13,148,136,0.07)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {label}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-white/25 text-sm italic font-medium px-1 py-3">{text}</p>
  );
}
