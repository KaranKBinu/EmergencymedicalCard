"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Plus, Trash2, Droplets, User, Phone, Activity, Ruler, Scale, Camera, Image as ImageIcon, MapPin, Calendar, FileText, FilePlus, Edit3, Pill, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
}

export default function EditRecordModal({ isOpen, onClose, initialData }: EditRecordModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...initialData,
    photoUrl: initialData.photoUrl || "",
    address: initialData.address || "",
    dob: initialData.dob || "",
    gender: initialData.gender || "",
    height: initialData.height || "",
    weight: initialData.weight || "",
    medications: initialData.medications || initialData.medicalNotes || "",
    allergies: initialData.allergies || [],
    medicalConditions: initialData.medicalConditions || [],
    currentMedications: initialData.currentMedications || [],
    history: initialData.history || []
  });



  const [newAllergy, setNewAllergy] = useState("");
  const [isMedication, setIsMedication] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newHistory, setNewHistory] = useState({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [activePreview, setActivePreview] = useState<{ name: string, url: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [unitSystem, setUnitSystem] = useState("metric");
  const historyFileInputRef = useRef<HTMLInputElement>(null);



  const uploadFile = async (file: File) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const blob = await response.json();
    return { name: file.name, url: blob.url };
  };

  const deleteFile = async (url: string) => {
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const saveChanges = async (currentData = formData, { silent = false } = {}) => {
    setLoading(true);
    try {
      const response = await fetch("/api/record", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData)
      });

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      router.refresh();
      if (!silent) {
        toast.success("Medical record updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChanges();
  };

  const addArrayItem = (field: 'allergies' | 'medicalConditions' | 'currentMedications', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    let finalValue = value.trim();
    if (field === 'allergies' && isMedication) {
      finalValue = `💊 ${finalValue}`;
    }
    setFormData({
      ...formData,
      [field]: [...formData[field], finalValue]
    });
    setter("");
    if (field === 'allergies') setIsMedication(false);
  };

  const removeArrayItem = (field: 'allergies' | 'medicalConditions' | 'currentMedications', index: number) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData({ ...formData, [field]: newList });
  };

  const startEditingHistory = (index: number) => {
    setNewHistory(formData.history[index]);
    setEditingHistoryIndex(index);
    const historyForm = document.getElementById('medical-history-form');
    if (historyForm) historyForm.scrollIntoView({ behavior: 'smooth' });
  };

  const addHistoryItem = async () => {
    if (!newHistory.title || !newHistory.date) {
      toast.error("Please provide at least a title and date");
      return;
    }
    
    const updatedHistory = [...formData.history];
    if (editingHistoryIndex !== null) {
      updatedHistory[editingHistoryIndex] = newHistory;
      const updatedData = { ...formData, history: updatedHistory };
      setFormData(updatedData);
      setEditingHistoryIndex(null);
      setNewHistory({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
      
      toast.loading("Updating record...", { id: "save-progress" });
      await saveChanges(updatedData);
      toast.dismiss("save-progress");
    } else {
      const updatedData = {
        ...formData,
        history: [...formData.history, newHistory]
      };
      setFormData(updatedData);
      setNewHistory({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
      
      toast.loading("Adding to history...", { id: "save-progress" });
      await saveChanges(updatedData);
      toast.dismiss("save-progress");
    }
  };

  const removeHistoryItem = async (index: number) => {
    const item = formData.history[index];
    
    // Delete associated files from blob storage
    if (item.files && item.files.length > 0) {
      toast.loading("Cleaning up files...", { id: "delete-progress" });
      await Promise.all(item.files.map((file: any) => deleteFile(file.url)));
      toast.dismiss("delete-progress");
    }

    const updatedHistory = formData.history.filter((_: any, i: number) => i !== index);
    const updatedData = { ...formData, history: updatedHistory };
    setFormData(updatedData);
    
    // Auto-save the record update
    toast.loading("Updating record...", { id: "save-progress" });
    await saveChanges(updatedData);
    toast.dismiss("save-progress");
  };

  const handleHistoryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const uploadPromises = fileList.map(async (file, index) => {
          const result = await uploadFile(file);
          setUploadProgress(Math.round(((index + 1) / fileList.length) * 100));
          return result;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        setNewHistory(prev => ({ 
          ...prev, 
          files: [...prev.files, ...uploadedFiles] 
        }));
        toast.success("Files uploaded successfully");
      } catch {
        toast.error("Failed to upload files");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (e.target) e.target.value = "";
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const oldUrl = formData.photoUrl;
      const toastId = toast.loading("Uploading photo...");
      try {
        const { url } = await uploadFile(file);
        const updatedData = { ...formData, photoUrl: url };
        setFormData(updatedData);
        // Auto-save so the new photoUrl is persisted to the database immediately
        await saveChanges(updatedData, { silent: true });
        // Delete the old photo from blob storage only after the new URL is saved
        if (oldUrl) await deleteFile(oldUrl);
        toast.success("Photo uploaded!", { id: toastId });
      } catch {
        toast.error("Photo upload failed", { id: toastId });
      }
    }
  };  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full h-full max-h-screen sm:max-h-[90vh] sm:h-[90vh] sm:w-[95vw] sm:max-w-7xl border-0 sm:border-2 border-cyan-500/25 rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
            style={{ background: 'linear-gradient(135deg, #040814 0%, #091026 40%, #130a21 80%, #1f0b20 100%)' }}
          >
            {/* Cybernetic Medical Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }} />
            
            {/* Cyan bloom */}
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />
            
            {/* Rose bloom */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-50"
              style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)' }} />
            {/* Absolute Floating Close Button at Top Right of Modal */}
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-6 z-30 p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-white/15 hover:border-white/30 rounded-2xl shadow-md transition-all cursor-pointer group flex items-center justify-center hover:scale-105"
              title="Close"
            >
              <X className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
            </button>

            <div className="sticky top-0 z-20 bg-slate-950/40 backdrop-blur-xl border-b border-cyan-500/15 p-4 sm:p-6 pr-16 sm:pr-24 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0 shadow-sm">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black font-outfit tracking-tight text-white leading-tight truncate">
                    Edit Medical Record
                  </h2>
                  <p className="text-slate-400 text-[9px] sm:text-xs font-medium opacity-80 truncate">Securing your identity for emergency responders.</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar space-y-10 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-12 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Basic Info (Left) */}
              <div className="lg:col-span-2 space-y-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 px-1 border-l-2 border-cyan-500/50 pl-4 mb-6">
                    <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-slate-200">Identity & Vitals</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                        <input 
                          type="text" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                        <input 
                          type="date" 
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                          className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold [color-scheme:dark] cursor-pointer shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                      <div className="relative group">
                        <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                        <select 
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold appearance-none cursor-pointer shadow-sm"
                        >
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                            <option key={bg} value={bg} className="bg-slate-900 text-white">{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["MALE", "FEMALE", "OTHER"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-black shadow-sm' : 'bg-slate-950/30 border border-white/10 text-slate-400 hover:bg-white/5 shadow-sm'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>              {/* Profile Photo Card (Right) */}
              <div className="lg:col-span-1 bg-slate-950/30 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 shadow-sm min-h-[220px]">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2.25rem] bg-slate-950/40 border border-dashed border-white/15 overflow-hidden flex items-center justify-center transition-all group-hover:border-cyan-500/50 shadow-inner">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-7 h-7 text-slate-600 mx-auto mb-1" />
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Optional</span>
                      </div>
                    )}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" /> Change
                      </span>
                    </div>
                  </div>
                  {formData.photoUrl && (
                    <button 
                      type="button"
                      onClick={async () => {
                        const urlToDelete = formData.photoUrl;
                        const updatedData = { ...formData, photoUrl: "" };
                        setFormData(updatedData);
                        await saveChanges(updatedData, { silent: true });
                        await deleteFile(urlToDelete);
                        toast.success("Photo removed");
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-destructive text-white rounded-xl shadow-lg hover:scale-110 transition-all animate-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-200">Profile Photo</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">Upload a photo for first responders</p>
                </div>
              </div>
            </div>
            {/* Emergency Contact */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-slate-200">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 transition-colors" />
                    <input 
                      type="tel" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-cyan-400 group-focus-within:text-cyan-400 transition-colors" />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold resize-none shadow-sm"
                    placeholder="Enter permanent or home address..."
                  />
                </div>
              </div>
            </section>

            {/* Medical Data */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-slate-200">Critical Medical Data</h3>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allergies & Reactions</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.allergies.length > 0 ? formData.allergies.map((a: string, i: number) => {
                    const isMed = a.startsWith('💊 ');
                    const displayName = isMed ? a.replace('💊 ', '') : a;
                    return (
                      <div key={i} className="relative group">
                        {isMed && (
                          <div className="absolute -top-1 -left-1 z-10">
                            <div className="w-4 h-2 bg-blue-500 rounded-full shadow-md border border-blue-100 flex items-center overflow-hidden rotate-[-35deg] relative">
                              <div className="w-1/2 h-full bg-blue-500" />
                              <div className="w-1/2 h-full bg-white" />
                            </div>
                          </div>
                        )}
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isMed ? 'bg-sky-500/10 text-sky-300 border-sky-500/20 pl-5' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                          {displayName}
                          <button type="button" onClick={() => removeArrayItem('allergies', i)} className="ml-1 hover:scale-125 transition-transform cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    );
                  }) : <p className="text-xs text-slate-500 italic ml-1 font-medium">No allergies added yet.</p>}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="e.g. Peanuts, Penicillin..."
                      className="flex-1 bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm placeholder:text-slate-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', newAllergy, setNewAllergy))}
                    />
                    <button 
                      type="button"
                      onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)}
                      className="px-6 bg-slate-950/30 hover:bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center group shadow-sm"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMedication(!isMedication)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all self-start ${isMedication ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-sm' : 'bg-slate-950/30 border border-white/10 text-slate-400 hover:bg-white/5'}`}
                  >
                    <Pill className={`w-4 h-4 ${isMedication ? 'animate-bounce' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                      {isMedication ? 'Tagged as Medication' : 'Tag as Medication'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chronic Conditions</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.medicalConditions.length > 0 ? formData.medicalConditions.map((c: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 text-teal-300 text-xs font-bold border border-teal-200/30">
                      {c}
                      <button type="button" onClick={() => removeArrayItem('medicalConditions', i)} className="hover:scale-125 transition-transform cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )) : <p className="text-xs text-slate-500 italic ml-1 font-medium">No chronic conditions listed.</p>}
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="e.g. Asthma, Type 2 Diabetes..."
                    className="flex-1 bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm placeholder:text-slate-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medicalConditions', newCondition, setNewCondition))}
                  />
                  <button 
                    type="button"
                    onClick={() => addArrayItem('medicalConditions', newCondition, setNewCondition)}
                    className="px-6 bg-slate-950/30 hover:bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center group shadow-sm"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Medications</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.currentMedications && formData.currentMedications.length > 0 ? formData.currentMedications.map((m: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-505/10 text-blue-300 text-xs font-bold border border-blue-200/30">
                      {m}
                      <button type="button" onClick={() => removeArrayItem('currentMedications', i)} className="hover:scale-125 transition-transform cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )) : <p className="text-xs text-slate-500 italic ml-1 font-medium">No current medications listed.</p>}
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="e.g. Paracetamol, Insulin..."
                    className="flex-1 bg-slate-950/40 border border-white/10 text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold shadow-sm placeholder:text-slate-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('currentMedications', newMedication, setNewMedication))}
                  />
                  <button 
                    type="button"
                    onClick={() => addArrayItem('currentMedications', newMedication, setNewMedication)}
                    className="px-6 bg-slate-950/30 hover:bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center group shadow-sm"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medications & Notes</label>
                  <span className={`text-[10px] font-bold ${(formData.medications?.length || 0) >= 365 ? 'text-destructive' : 'text-slate-500'}`}>
                    {formData.medications?.length || 0}/375
                  </span>
                </div>
                <textarea 
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  maxLength={375}
                  rows={4}
                  className="w-full bg-slate-950/40 border border-white/10 text-white rounded-[1.5rem] py-5 px-6 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-semibold resize-none leading-relaxed shadow-sm placeholder:text-slate-500"
                  placeholder="List active medications or critical notes for responders..."
                />
              </div>
            </section>
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-slate-200">Measurements</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Height Input */}
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-cyan-400 text-slate-500">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder={unitSystem === "metric" ? "180 cm" : "5'11\""}
                      className="w-full bg-slate-950/40 border border-white/10 text-white rounded-[1.25rem] py-4.5 pl-14 pr-24 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-bold shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-3 rounded-xl bg-slate-950/50 border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "metric" ? "text-cyan-400" : "text-slate-500 opacity-50"}`}>cm</span>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "imperial" ? "text-cyan-400" : "text-slate-500 opacity-50"}`}>ft</span>
                    </button>
                  </div>
                </div>

                {/* Weight Input */}
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-cyan-400 text-slate-500">
                      <Scale className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder={unitSystem === "metric" ? "75 kg" : "165 lbs"}
                      className="w-full bg-slate-950/40 border border-white/10 text-white rounded-[1.25rem] py-4.5 pl-14 pr-24 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm font-bold shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-3 rounded-xl bg-slate-950/50 border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "metric" ? "text-cyan-400" : "text-slate-500 opacity-50"}`}>kg</span>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "imperial" ? "text-cyan-400" : "text-slate-500 opacity-50"}`}>lbs</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical History Section */}
            <section className="space-y-8 pt-10 border-t border-white/10">
              <div className="flex items-center gap-3 px-1 border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-slate-200">Medical History Archive</h3>
              </div>
              
              {/* Add new history form */}
              <div id="medical-history-form" className="space-y-6 p-8 rounded-[2.5rem] bg-slate-950/30 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry Title</label>
                    <input 
                      type="text" 
                      value={newHistory.title}
                      onChange={(e) => setNewHistory({...newHistory, title: e.target.value})}
                      placeholder="e.g. Major Heart Surgery"
                      className="w-full p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-white text-sm font-bold outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Completion Date</label>
                    <input 
                      type="text" 
                      value={newHistory.date}
                      onChange={(e) => setNewHistory({...newHistory, date: e.target.value})}
                      placeholder="e.g. June 2023"
                      className="w-full p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-white text-sm font-bold outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea 
                    value={newHistory.description}
                    onChange={(e) => setNewHistory({...newHistory, description: e.target.value})}
                    placeholder="Brief details about the procedure, diagnosis, or outcome..."
                    className="w-full p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-white text-sm font-medium outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 min-h-[100px] resize-none shadow-sm placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Attachments</label>
                    <button 
                      type="button"
                      onClick={() => historyFileInputRef.current?.click()}
                      className="flex items-center gap-2 text-[11px] font-black text-cyan-400 uppercase hover:opacity-80 transition-all cursor-pointer group/btn"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover/btn:bg-cyan-500/20 transition-colors">
                        <FilePlus className="w-4 h-4" />
                      </div>
                      Add Files
                    </button>
                  </div>
                  
                  <input 
                    type="file"
                    ref={historyFileInputRef}
                    onChange={handleHistoryFileChange}
                    multiple
                    className="hidden"
                  />
                  
                  {isUploading && (
                    <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Uploading High-Res Documents...</span>
                        <span className="text-[11px] font-black text-cyan-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyan-400" 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {newHistory.files.length > 0 && !isUploading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newHistory.files.map((file, i) => {
                        const url = file.url;
                        const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isPdf = url.match(/\.pdf$/i) || url.startsWith('data:application/pdf');

                        return (
                          <div 
                            key={i}
                            onClick={() => setActivePreview({ name: file.name, url })}
                            className="flex flex-col p-3 rounded-2xl bg-slate-950/40 border border-white/10 hover:bg-slate-900 hover:border-white/20 transition-all group/file cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {isImage ? <ImageIcon className="w-4 h-4 text-cyan-400" /> : isPdf ? <FileText className="w-4 h-4 text-rose-500" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                                <span className="text-xs font-bold text-slate-200 truncate">{file.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover/file:text-cyan-400 transition-colors pr-1">Preview</span>
                                <button 
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const fileToDelete = newHistory.files[i];
                                    const updatedFiles = newHistory.files.filter((_, idx) => idx !== i);
                                    const updatedHistoryItem = { ...newHistory, files: updatedFiles };
                                    setNewHistory(updatedHistoryItem);
                                    if (editingHistoryIndex !== null) {
                                      const updatedHistory = [...formData.history];
                                      updatedHistory[editingHistoryIndex] = updatedHistoryItem;
                                      setFormData({ ...formData, history: updatedHistory });
                                    }
                                    await deleteFile(fileToDelete.url);
                                    toast.success("File removed");
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Mini Image Preview */}
                            {isImage && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 p-0.5 shadow-inner">
                                <img src={url} alt={file.name} className="w-full h-auto max-h-40 object-cover rounded-lg" loading="lazy" />
                              </div>
                            )}
                            {/* Mini PDF Preview */}
                            {isPdf && (
                              <div className="mt-2.5 rounded-xl overflow-hidden border border-white/5 bg-slate-950/85 p-0.5 shadow-inner h-40 relative flex items-center justify-center">
                                <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded-lg bg-white border-0 pointer-events-none select-none overflow-hidden" style={{ minHeight: '150px' }} loading="lazy" />
                                <div className="absolute inset-0 bg-slate-950/[0.01] hover:bg-slate-950/[0.04] transition-colors rounded-lg flex items-end p-2.5">
                                  <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
                                    <FileText className="w-2.5 h-2.5" /> PDF Preview
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

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={addHistoryItem}
                    className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)] hover:bg-cyan-600 border border-cyan-500/30"
                  >
                    {editingHistoryIndex !== null ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingHistoryIndex !== null ? "Update History Item" : "Add to Medical Archive"}
                  </button>
                  {editingHistoryIndex !== null && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingHistoryIndex(null);
                        setNewHistory({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
                      }}
                      className="px-6 py-4 bg-slate-950/30 hover:bg-white/5 text-slate-350 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* List of existing history */}
              <div className="grid grid-cols-1 gap-4">
                {formData.history.length > 0 ? formData.history.map((item: any, index: number) => (
                  <div key={index} className="p-6 rounded-[2rem] bg-slate-950/20 border border-white/5 flex items-center justify-between group hover:bg-slate-950/40 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 transition-colors">
                        <Activity className="w-6 h-6 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-base font-black tracking-tight text-slate-200">{item.title}</h4>
                        {item.files && item.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.files.map((file: any, fIdx: number) => (
                              <span key={fIdx} className="text-[10px] px-2 py-1 bg-slate-950/40 text-slate-300 border border-white/10 rounded-lg truncate max-w-[150px] font-medium">
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                      <button 
                        type="button"
                        onClick={() => startEditingHistory(index)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeHistoryItem(index)}
                        className="p-2 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/10 bg-slate-950/10 rounded-[2.5rem]">
                    <p className="text-sm text-slate-500 italic font-medium">No medical history records found.</p>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>

        {/* Floating Save Button at Bottom Right */}
        <div className="absolute bottom-5 right-6 sm:bottom-8 sm:right-10 z-30">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-cyan-500 text-white rounded-2xl px-8 py-3.5 sm:py-4 font-black uppercase tracking-wider transition-all hover:bg-cyan-600 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer text-xs sm:text-sm shadow-xl shadow-cyan-500/20 border border-cyan-500/30 hover:scale-[1.02]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>

        {/* ── File Preview Modal inside Edit Modal ── */}
        <AnimatePresence>
          {activePreview && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10">
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
                className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[85vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">File Preview</p>
                      <h3 className="text-sm font-black text-slate-200 truncate max-w-[200px] sm:max-w-md">{activePreview.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={activePreview.url}
                      download={activePreview.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/10"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button 
                      onClick={() => setActivePreview(null)}
                      className="p-2 hover:bg-slate-900 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-205 border border-transparent hover:border-white/10"
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
                          loading="lazy"
                        />
                      );
                    } else if (isPdf) {
                      return (
                        <iframe 
                          src={url} 
                          className="w-full h-[60vh] rounded-xl bg-white border-0" 
                          title={activePreview.name}
                          loading="lazy"
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
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
