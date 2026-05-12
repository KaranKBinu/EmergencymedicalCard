"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Plus, Trash2, Droplets, User, Phone, Activity, Ruler, Scale, Camera, Image as ImageIcon, MapPin, Calendar, FileText, FilePlus, Edit3, Pill } from "lucide-react";
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
    medications: initialData.medicalNotes || "",
    allergies: initialData.allergies || [],
    medicalConditions: initialData.medicalConditions || [],
    history: initialData.history || []
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [isMedication, setIsMedication] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newHistory, setNewHistory] = useState({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [unitSystem, setUnitSystem] = useState("metric");
  const historyFileInputRef = useRef<HTMLInputElement>(null);



  const uploadFile = async (file: File, overwrite = false) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&overwrite=${overwrite}`, {
      method: "POST",
      body: file,
    });

    if (response.status === 409) {
      toast.error(`File "${file.name}" already exists. Overwriting...`, { duration: 3000 });
      return uploadFile(file, true);
    }

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

  const saveChanges = async (currentData = formData) => {
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

      toast.success("Medical record updated successfully!");
      router.refresh();
      onClose();
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

  const addArrayItem = (field: 'allergies' | 'medicalConditions', value: string, setter: (v: string) => void) => {
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

  const removeArrayItem = (field: 'allergies' | 'medicalConditions', index: number) => {
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
    
    let updatedHistory = [...formData.history];
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
      } catch (err) {
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
        setFormData({ ...formData, photoUrl: url });
        if (oldUrl) await deleteFile(oldUrl);
        toast.success("Photo uploaded!", { id: toastId });
      } catch (err) {
        toast.error("Photo upload failed", { id: toastId });
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex items-end sm:items-start justify-center p-0 sm:p-6 md:p-12 lg:p-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col mb-0 sm:mb-8"
            >
              {/* Premium Header */}
              <div className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 p-4 sm:p-10 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-white leading-tight">
                      Edit Medical Record
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium opacity-70">Securing your identity for emergency responders.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group"
                >
                  <X className="w-6 h-6 text-muted-foreground group-hover:text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="p-4 sm:p-12 space-y-12 sm:space-y-16">
                <form onSubmit={handleSubmit} className="space-y-16 pb-20">
            {/* Photo Section */}
            <section className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center transition-all group-hover:border-primary/50">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-white/20 mx-auto mb-1" />
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Optional</span>
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
                      setFormData({ ...formData, photoUrl: "" });
                      await deleteFile(urlToDelete);
                      toast.success("Photo removed");
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
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
                <p className="text-sm font-bold">Profile Photo</p>
                <p className="text-xs text-muted-foreground">Upload a clear photo for first responders</p>
              </div>
            </section>

            {/* Basic Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-primary/40 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-white/90">Identity & Vitals</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 opacity-60">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 opacity-60">Date of Birth</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium [color-scheme:dark] cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 opacity-60">Blood Group</label>
                  <div className="relative group">
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <select 
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium appearance-none"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                        <option key={bg} value={bg} className="bg-[#0a0a0c]">{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-accent/40 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-white/90">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Contact Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent transition-colors" />
                    <input 
                      type="tel" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Residential Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-accent group-focus-within:text-accent transition-colors" />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all text-sm font-medium resize-none"
                    placeholder="Enter permanent or home address..."
                  />
                </div>
              </div>
            </section>

            {/* Medical Data */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-blue-500/40 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-white/90">Critical Medical Data</h3>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Allergies & Reactions</label>
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
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isMed ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 pl-5' : 'bg-destructive/10 text-destructive border-destructive/10'}`}>
                          {displayName}
                          <button type="button" onClick={() => removeArrayItem('allergies', i)} className="ml-1 hover:scale-125 transition-transform">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    );
                  }) : <p className="text-xs text-muted-foreground italic ml-1">No allergies added yet.</p>}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="e.g. Peanuts, Penicillin..."
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', newAllergy, setNewAllergy))}
                    />
                    <button 
                      type="button"
                      onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)}
                      className="px-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-center group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMedication(!isMedication)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all self-start ${isMedication ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.05]'}`}
                  >
                    <Pill className={`w-4 h-4 ${isMedication ? 'animate-bounce' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                      {isMedication ? 'Tagged as Medication' : 'Tag as Medication'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Chronic Conditions</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.medicalConditions.length > 0 ? formData.medicalConditions.map((c: string, i: number) => (
                    <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                      {c}
                      <button type="button" onClick={() => removeArrayItem('medicalConditions', i)} className="hover:scale-125 transition-transform">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )) : <p className="text-xs text-muted-foreground italic ml-1">No chronic conditions listed.</p>}
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="e.g. Asthma, Type 2 Diabetes..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medicalConditions', newCondition, setNewCondition))}
                  />
                  <button 
                    type="button"
                    onClick={() => addArrayItem('medicalConditions', newCondition, setNewCondition)}
                    className="px-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all cursor-pointer flex items-center justify-center group"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Medications & Notes</label>
                  <span className={`text-[10px] font-bold ${(formData.medications?.length || 0) >= 365 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.medications?.length || 0}/375
                  </span>
                </div>
                <textarea 
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  maxLength={375}
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-5 px-6 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-sm font-medium resize-none leading-relaxed"
                  placeholder="List active medications or critical notes for responders..."
                />
              </div>
            </section>
            <section className="space-y-8">
              <div className="flex items-center gap-3 px-1 border-l-2 border-white/20 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-white/90">Measurements</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Height Input */}
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Height</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-primary text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder={unitSystem === "metric" ? "180 cm" : "5'11\""}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-4.5 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-bold"
                    />
                    <button 
                      type="button"
                      onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-inner"
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "metric" ? "text-primary" : "text-muted-foreground opacity-40"}`}>cm</span>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "imperial" ? "text-primary" : "text-muted-foreground opacity-40"}`}>ft</span>
                    </button>
                  </div>
                </div>

                {/* Weight Input */}
                <div className="space-y-3 group">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Weight</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-accent text-muted-foreground">
                      <Scale className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder={unitSystem === "metric" ? "75 kg" : "165 lbs"}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-4.5 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all text-sm font-bold"
                    />
                    <button 
                      type="button"
                      onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-inner"
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "metric" ? "text-accent" : "text-muted-foreground opacity-40"}`}>kg</span>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <span className={`text-[10px] font-black uppercase tracking-tight ${unitSystem === "imperial" ? "text-accent" : "text-muted-foreground opacity-40"}`}>lbs</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical History Section */}
            <section className="space-y-8 pt-10 border-t border-white/5">
              <div className="flex items-center gap-3 px-1 border-l-2 border-white/20 pl-4">
                <h3 className="text-xs font-black font-outfit uppercase tracking-[0.3em] text-white/90">Medical History Archive</h3>
              </div>
              
              {/* Add new history form */}
              <div id="medical-history-form" className="space-y-6 p-5 sm:p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Entry Title</label>
                    <input 
                      type="text" 
                      value={newHistory.title}
                      onChange={(e) => setNewHistory({...newHistory, title: e.target.value})}
                      placeholder="e.g. Major Heart Surgery"
                      className="w-full p-4 bg-[#0a0a0c] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Completion Date</label>
                    <input 
                      type="text" 
                      value={newHistory.date}
                      onChange={(e) => setNewHistory({...newHistory, date: e.target.value})}
                      placeholder="e.g. June 2023"
                      className="w-full p-4 bg-[#0a0a0c] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Detailed Description</label>
                  <textarea 
                    value={newHistory.description}
                    onChange={(e) => setNewHistory({...newHistory, description: e.target.value})}
                    placeholder="Brief details about the procedure, diagnosis, or outcome..."
                    className="w-full p-4 bg-[#0a0a0c] border border-white/10 rounded-2xl text-sm font-medium outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Document Attachments</label>
                    <button 
                      type="button"
                      onClick={() => historyFileInputRef.current?.click()}
                      className="flex items-center gap-2 text-[11px] font-black text-primary uppercase hover:opacity-80 transition-all cursor-pointer group/btn"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover/btn:bg-primary/20 transition-colors">
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
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">Uploading High-Res Documents...</span>
                        <span className="text-[11px] font-black text-primary">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary" 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {newHistory.files.length > 0 && !isUploading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newHistory.files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 group/file">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-white/80 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={async () => {
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
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={addHistoryItem}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_10px_30px_-10px_rgba(239,68,68,0.3)] hover:opacity-90"
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
                      className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* List of existing history */}
              <div className="grid grid-cols-1 gap-4">
                {formData.history.length > 0 ? formData.history.map((item: any, index: number) => (
                  <div key={index} className="p-4 sm:p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Activity className="w-6 h-6 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-base font-black tracking-tight">{item.title}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.files?.map((file: any, fIdx: number) => (
                            <span key={fIdx} className="text-[10px] px-2 py-1 bg-white/5 text-white/40 border border-white/5 rounded-lg truncate max-w-[120px]">
                              {file.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 opacity-60">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                      <button 
                        type="button"
                        onClick={() => startEditingHistory(index)}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeHistoryItem(index)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-sm text-muted-foreground italic">No medical history records found.</p>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>

              {/* Floating Action Bar */}
              <div className="sticky bottom-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-white/5 p-4 sm:p-8 flex items-center gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 sm:py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-4 sm:py-5 bg-primary text-white rounded-2xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-sm shadow-[0_10px_30px_-10px_rgba(239,68,68,0.4)]"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
