"use client";

import { useState } from "react";
import { X, Save, Plus, Trash2, Droplets, User, Phone, Activity, Ruler, Scale, Camera, Image as ImageIcon, MapPin, Calendar, FileText, FilePlus, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useRef } from "react";

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
    allergies: initialData.allergies || [],
    medicalConditions: initialData.medicalConditions || [],
    history: initialData.history || []
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newHistory, setNewHistory] = useState({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const historyFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    setFormData({
      ...formData,
      [field]: [...formData[field], value.trim()]
    });
    setter("");
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

  const removeHistoryItem = (index: number) => {
    setFormData({
      ...formData,
      history: formData.history.filter((_: any, i: number) => i !== index)
    });
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
      const toastId = toast.loading("Uploading photo...");
      try {
        const { url } = await uploadFile(file);
        setFormData({ ...formData, photoUrl: url });
        toast.success("Photo uploaded!", { id: toastId });
      } catch (err) {
        toast.error("Photo upload failed", { id: toastId });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Edit Medical Record
            </h2>
            <p className="text-muted-foreground text-sm">Keep your emergency information up to date.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
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
                    onClick={() => setFormData({ ...formData, photoUrl: "" })}
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
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 px-1">Basic Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Date of Birth</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm [color-scheme:dark] cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Blood Group</label>
                  <div className="relative">
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <select 
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                        <option key={bg} value={bg} className="bg-[#0a0a0c]">{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0c]">Select Gender</option>
                    <option value="MALE" className="bg-[#0a0a0c]">Male</option>
                    <option value="FEMALE" className="bg-[#0a0a0c]">Female</option>
                    <option value="OTHER" className="bg-[#0a0a0c]">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent/60 px-1">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Contact Name</label>
                  <input 
                    type="text" 
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                    <input 
                      type="tel" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground ml-1">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-4 h-4 text-accent" />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm resize-none"
                    placeholder="Enter permanent or home address..."
                  />
                </div>
              </div>
            </section>

            {/* Medical Data */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-1">Medical Details</h3>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground ml-1">Allergies</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.allergies.map((a: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/10 group">
                      {a}
                      <button type="button" onClick={() => removeArrayItem('allergies', i)} className="hover:text-destructive/50">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', newAllergy, setNewAllergy))}
                  />
                  <button 
                    type="button"
                    onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground ml-1">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.medicalConditions.map((c: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold border border-accent/10">
                      {c}
                      <button type="button" onClick={() => removeArrayItem('medicalConditions', i)} className="hover:text-accent/50">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medicalConditions', newCondition, setNewCondition))}
                  />
                  <button 
                    type="button"
                    onClick={() => addArrayItem('medicalConditions', newCondition, setNewCondition)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-muted-foreground">Medical Notes / Medications</label>
                  <span className={`text-[10px] font-bold ${(formData.medications?.length || 0) >= 365 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.medications?.length || 0}/375
                  </span>
                </div>
                <textarea 
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  maxLength={375}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm resize-none"
                  placeholder="List medications or any critical medical notes first responders should know about..."
                />
              </div>
            </section>

            {/* Vitals */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-1">Vitals & Other</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Height (e.g. 180 cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Weight (e.g. 75 kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Medical History Section */}
            <section className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-1">Medical History Records</h3>
              
              {/* Add new history form */}
              <div id="medical-history-form" className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Title</label>
                    <input 
                      type="text" 
                      value={newHistory.title}
                      onChange={(e) => setNewHistory({...newHistory, title: e.target.value})}
                      placeholder="e.g. Heart Surgery"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="text" 
                      value={newHistory.date}
                      onChange={(e) => setNewHistory({...newHistory, date: e.target.value})}
                      placeholder="e.g. May 2023"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea 
                    value={newHistory.description}
                    onChange={(e) => setNewHistory({...newHistory, description: e.target.value})}
                    placeholder="Brief details about the procedure or diagnosis..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Attached Files</label>
                    <button 
                      type="button"
                      onClick={() => historyFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase hover:opacity-80 transition-all cursor-pointer"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
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
                    <div className="col-span-2 p-4 rounded-2xl bg-primary/5 border border-primary/20 animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading Files...</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {newHistory.files.length > 0 && !isUploading && (
                    <div className="grid grid-cols-2 gap-2">
                      {newHistory.files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-[10px] font-medium text-white/60 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setNewHistory({
                              ...newHistory,
                              files: newHistory.files.filter((_, idx) => idx !== i)
                            })}
                            className="p-1 text-destructive opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={addHistoryItem}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {editingHistoryIndex !== null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingHistoryIndex !== null ? "Update Item" : "Add to History"}
                  </button>
                  {editingHistoryIndex !== null && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingHistoryIndex(null);
                        setNewHistory({ title: '', date: '', description: '', files: [] as { name: string, url: string }[] });
                      }}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* List of existing history */}
              <div className="space-y-4">
                {formData.history.map((item: any, index: number) => (
                  <div key={index} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.files?.map((file: any, fIdx: number) => (
                            <span key={fIdx} className="text-[8px] px-1.5 py-0.5 bg-primary/5 text-primary/60 border border-primary/10 rounded-md truncate max-w-[100px]">
                              {file.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => startEditingHistory(index)}
                        className="p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeHistoryItem(index)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
