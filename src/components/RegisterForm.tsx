"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, Droplets,
  ChevronRight, ChevronLeft, CheckCircle2,
  Calendar, MapPin, Ruler, Scale, Activity,
  Stethoscope, FileText, Camera, Globe, Home, Eye, EyeOff, X, Plus, Pill, QrCode, Smartphone, Download, AlertTriangle, Syringe, HeartPulse, ShieldAlert, Check, ShieldCheck, Heart, Cross, ScanFace, FileUp, Loader2, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { processFileForWeb } from "@/lib/fileProcessing";
import { registerUser, checkEmailExists } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface Country {
  name: string;
  flag: string;
  flagUrl: string;
  code: string;
  dialCode: string;
}

const defaultCountry: Country = {
  name: "India",
  flag: "🇮🇳",
  flagUrl: "https://flagcdn.com/16x12/in.png",
  code: "IN",
  dialCode: "+91"
};
const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    if (isDropdownOpen && countries.length === 0) {
      import("country-list-with-dial-code-and-flag").then((module) => {
        const list = module.default.getAll().map((c: any) => {
          const data = c.data || c;
          return {
            name: data.name,
            flag: data.flag,
            flagUrl: `https://flagcdn.com/16x12/${data.code.toLowerCase()}.png`,
            code: data.code,
            dialCode: data.dial_code
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(list);
      }).catch(err => {
        console.error("Failed to load country list", err);
      });
    }
  }, [isDropdownOpen, countries.length]);

  const [countrySearch, setCountrySearch] = useState("");
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isBloodGroupOpen, setIsBloodGroupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dob: "",
    bloodGroup: "Unknown",
    gender: "",
    emergencyName: "",
    emergencyPhone: "",
    address: "",
    height: "",
    weight: "",
    allergies: [] as string[],
    medicalConditions: [] as string[],
    currentMedications: [] as string[],
    medicalNotes: "",
    photoUrl: "",
  });

  const [uploading, setUploading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [isMedication, setIsMedication] = useState(false); // for allergies

  const addArrayItem = (field: 'allergies' | 'medicalConditions' | 'currentMedications', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    let finalValue = value.trim();
    if (field === 'allergies' && isMedication) {
      finalValue = `💊 ${finalValue}`;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], finalValue]
    }));
    setter("");
    if (field === 'allergies') setIsMedication(false);
  };

  const removeArrayItem = (field: 'allergies' | 'medicalConditions' | 'currentMedications', index: number) => {
    setFormData(prev => {
      const newList = [...prev[field]];
      newList.splice(index, 1);
      return { ...prev, [field]: newList };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as any));

    // Clear error dynamically as they type if it exists
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim() || !value.includes("@") || !value.includes(".")) {
        newErrors.email = "Please enter a valid email address.";
        setErrors(newErrors);
      } else {
        delete newErrors.email;
        setErrors(newErrors); // Update UI before async check
        
        setIsCheckingEmail(true);
        const res = await checkEmailExists(value);
        setIsCheckingEmail(false);
        
        if (res?.exists) {
          setErrors(prev => ({ ...prev, email: "This email is already registered." }));
          return;
        }
      }
    }

    if (name === "password") {
      if (value.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      } else {
        delete newErrors.password;
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match.";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "fullName") {
      if (value.trim().length < 3) {
        newErrors.fullName = "Full name must be at least 3 characters.";
      } else {
        delete newErrors.fullName;
      }
    }

    if (name === "dob") {
      if (!value) {
        newErrors.dob = "Please select your birth date.";
      } else if (new Date(value) > new Date()) {
        newErrors.dob = "Birth date cannot be in the future.";
      } else {
        delete newErrors.dob;
      }
    }

    if (name === "gender") {
      if (!value) {
        newErrors.gender = "Please select your gender.";
      } else {
        delete newErrors.gender;
      }
    }

    if (name === "emergencyName") {
      if (value.trim().length < 3) {
        newErrors.emergencyName = "Emergency contact name must be at least 3 characters.";
      } else {
        delete newErrors.emergencyName;
      }
    }

    if (name === "emergencyPhone") {
      const phoneDigits = value.replace(/\D/g, '');
      if (!value.trim()) {
        newErrors.emergencyPhone = "Emergency contact phone is required.";
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.emergencyPhone = "Please enter a valid phone number (7-15 digits).";
      } else {
        delete newErrors.emergencyPhone;
      }
    }

    if (name === "height" && value.trim()) {
      const heightValue = parseFloat(value.replace(/[^\d.]/g, ''));
      if (isNaN(heightValue) || heightValue <= 0 || heightValue > 300) {
        newErrors.height = "Please enter a valid height.";
      } else {
        delete newErrors.height;
      }
    }

    if (name === "weight" && value.trim()) {
      const weightValue = parseFloat(value.replace(/[^\d.]/g, ''));
      if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
        newErrors.weight = "Please enter a valid weight.";
      } else {
        delete newErrors.weight;
      }
    }

    setErrors(newErrors);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleNextStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email.trim() || !formData.email.includes("@") || !formData.email.includes(".")) {
        newErrors.email = "Please enter a valid email address.";
      }
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }
    if (step === 2) {
      if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "Full name must be at least 3 characters.";
      }
      if (!formData.dob) {
        newErrors.dob = "Please select your birth date.";
      } else if (new Date(formData.dob) > new Date()) {
        newErrors.dob = "Birth date cannot be in the future.";
      }
      if (!formData.gender) {
        newErrors.gender = "Please select your gender.";
      }
    }
    if (step === 3) {
      if (formData.height.trim()) {
        const heightValue = parseFloat(formData.height.replace(/[^\d.]/g, ''));
        if (isNaN(heightValue) || heightValue <= 0 || heightValue > 300) {
          newErrors.height = "Please enter a valid height.";
        }
      }
      if (formData.weight.trim()) {
        const weightValue = parseFloat(formData.weight.replace(/[^\d.]/g, ''));
        if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
          newErrors.weight = "Please enter a valid weight.";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, or WEBP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file size must be less than 4MB.");
      return;
    }

    setUploading(true);
    try {
      // Process the file to compress it (if image) and make the filename web-compatible
      const processedFile = await processFileForWeb(file);

      // Upload to your Next.js API route using the processed file
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(processedFile.name)}`, {
        method: 'POST',
        body: processedFile,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image.");
      }

      const blob = await res.json();
      setFormData(prev => ({ ...prev, photoUrl: blob.url }));
      toast.success("Profile photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (formData.emergencyName.trim().length < 3) {
      newErrors.emergencyName = "Emergency contact name must be at least 3 characters.";
    }
    const phoneDigits = formData.emergencyPhone.replace(/\D/g, '');
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency contact phone is required.";
    } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      newErrors.emergencyPhone = "Please enter a valid phone number (7-15 digits).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Combine dial code with phone
    const finalData = {
      ...formData,
      emergencyPhone: selectedCountry ? `${selectedCountry.dialCode}${formData.emergencyPhone}` : formData.emergencyPhone
    };

    try {
      const res = await registerUser(finalData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch {
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch)
  );

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-transparent relative overflow-hidden">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all shadow-sm backdrop-blur-sm z-50"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Dynamic Background */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] bg-accent/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${step === 3 ? "max-w-2xl" : "max-w-lg"} glass-dark p-6 md:p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500`}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm"
          >
            <Activity className="w-7 h-7 text-primary" />
          </motion.div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Registration Portal</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-2 font-outfit">Create PulseID</h1>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? "w-10 bg-primary" : step > s ? "w-4 bg-primary/40" : "w-2 bg-white/10"
                  }`}
              />
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 mt-4">Step {step} of 4</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: ACCOUNT */}
            {step === 1 && (
              <motion.div
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <InputGroup icon={<Mail className="w-5 h-5" />} label="Email Address" id="email" required>
                    <div className="relative flex items-center w-full">
                      <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 pr-10" placeholder="john@example.com" required />
                      {isCheckingEmail && (
                        <div className="absolute right-4 w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>
                  </InputGroup>
                  {errors.email && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <InputGroup icon={<Lock className="w-5 h-5" />} label="Password" id="password" required>
                    <div className="relative flex items-center w-full">
                      <input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 pr-8" placeholder="Enter Password" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center justify-center h-full">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </InputGroup>
                  {formData.password && (
                    <div className="mt-2 space-y-1.5 px-1">
                      <div className="flex gap-1 h-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${i < getPasswordStrength(formData.password)
                              ? getPasswordStrength(formData.password) === 1 ? "bg-red-500"
                                : getPasswordStrength(formData.password) === 2 ? "bg-yellow-500"
                                  : getPasswordStrength(formData.password) === 3 ? "bg-emerald-500"
                                    : "bg-teal-400"
                              : "bg-white/10"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-right">
                        {getPasswordStrength(formData.password) === 1 && <span className="text-red-500">Weak</span>}
                        {getPasswordStrength(formData.password) === 2 && <span className="text-yellow-500">Medium</span>}
                        {getPasswordStrength(formData.password) === 3 && <span className="text-emerald-500">Strong</span>}
                        {getPasswordStrength(formData.password) === 4 && <span className="text-teal-400">Very Strong</span>}
                      </p>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                  <InputGroup icon={<Lock className="w-5 h-5" />} label="Confirm Password" id="confirmPassword" required>
                    <div className="relative flex items-center w-full">
                      <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 pr-8" placeholder="Confirm Password" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center justify-center h-full">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </InputGroup>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.confirmPassword}</p>}
                </div>

                <button type="button" onClick={handleNextStep} className="btn-next">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: IDENTITY */}
            {step === 2 && (
              <motion.div
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <InputGroup icon={<User className="w-5 h-5" />} label="Full Name" id="fullName" required>
                    <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500" placeholder="John Doe" required />
                  </InputGroup>
                  {errors.fullName && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.fullName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <InputGroup icon={<Calendar className="w-5 h-5" />} label="Birth Date" id="dob" required>
                      <input id="dob" type="date" name="dob" value={formData.dob} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 [color-scheme:dark]" required />
                    </InputGroup>
                    {errors.dob && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.dob}</p>}
                  </div>
                  <div className="space-y-1 relative">
                    <InputGroup icon={<User className="w-5 h-5" />} label="Gender" id="gender" required>
                      <button
                        type="button"
                        onClick={() => setIsGenderOpen(!isGenderOpen)}
                        className="w-full text-left text-white bg-transparent appearance-none cursor-pointer flex items-center justify-between outline-none"
                      >
                        <span className={formData.gender ? "text-white" : "text-slate-500"}>
                          {formData.gender ? formData.gender.charAt(0) + formData.gender.slice(1).toLowerCase() : "Gender"}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isGenderOpen ? "rotate-90" : ""}`} />
                      </button>
                    </InputGroup>
                    {isGenderOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsGenderOpen(false)} />
                        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-2 flex flex-col gap-1">
                            {["MALE", "FEMALE", "OTHER"].map((g, i) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, gender: g }));
                                  setIsGenderOpen(false);
                                  if (errors.gender) {
                                    setErrors(prev => {
                                      const next = { ...prev };
                                      delete next.gender;
                                      return next;
                                    });
                                  }
                                }}
                                className={`w-full px-4 py-3 text-left text-sm rounded-xl border transition-all duration-150 flex items-center justify-between ${formData.gender === g
                                  ? "border-primary/60 text-primary bg-primary/5"
                                  : "border-white/8 text-slate-300 hover:border-white/20 hover:text-white hover:bg-white/5"
                                  }`}
                              >
                                <span className="font-medium">{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                                {formData.gender === g && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {errors.gender && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.gender}</p>}
                  </div>
                </div>
                <InputGroup icon={<MapPin className="w-5 h-5" />} label="Residential Address" id="address" optional>
                  <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500" placeholder="City, State, Country" />
                </InputGroup>

                {/* File Uploader for Profile Photo */}
                <div className="space-y-2 text-left group">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] transition-colors">
                      Profile Photo
                    </label>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">(Optional)</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-dashed border-white/20 hover:border-primary/50 rounded-2xl transition-all duration-300 relative text-center cursor-pointer group/uploader">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden animate-pulse">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-xs text-primary font-bold uppercase tracking-wider animate-pulse">Uploading Image...</span>
                      </div>
                    ) : formData.photoUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg group-hover/uploader:scale-105 transition-transform duration-300">
                          <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, photoUrl: "" }));
                          }}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all z-20 relative"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover/uploader:text-primary transition-colors">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">Drag & drop or click to upload</p>
                          <p className="text-[9px] text-slate-500">PNG, JPG or WEBP (Max 4MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={prevStep} className="btn-back"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <button type="button" onClick={handleNextStep} className="btn-next">Next <ChevronRight className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: MEDICAL */}
            {step === 3 && (
              <motion.div
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <InputGroup icon={<Droplets className="w-5 h-5" />} label="Blood Group" id="bloodGroup" required>
                      <button
                        type="button"
                        onClick={() => setIsBloodGroupOpen(!isBloodGroupOpen)}
                        className="w-full text-left text-white bg-transparent appearance-none cursor-pointer flex items-center justify-between outline-none"
                      >
                        <span className="text-white font-semibold">{formData.bloodGroup}</span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isBloodGroupOpen ? "rotate-90" : ""}`} />
                      </button>
                    </InputGroup>
                    {isBloodGroupOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsBloodGroupOpen(false)} />
                        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-2 grid grid-cols-4 gap-1.5">
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Oh (Bombay)", "Unknown"].map(bg => (
                              <button
                                key={bg}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, bloodGroup: bg }));
                                  setIsBloodGroupOpen(false);
                                }}
                                className={`py-2.5 text-center text-xs font-bold rounded-xl border transition-all duration-150 ${formData.bloodGroup === bg
                                  ? "border-primary/60 text-primary bg-primary/5"
                                  : "border-white/8 text-slate-400 hover:border-white/20 hover:text-white"
                                  } ${bg === "Oh (Bombay)" || bg === "Unknown" ? "col-span-2" : ""}`}
                              >
                                {bg}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <InputGroup icon={<Ruler className="w-4 h-4" />} label="Height" id="height" optional>
                      <div className="relative flex items-center w-full">
                        <input id="height" type="text" name="height" value={formData.height} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 pr-16" placeholder={unitSystem === "metric" ? "180 cm" : "5'11\""} />
                        <button type="button" onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")} className="absolute right-0 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${unitSystem === "metric" ? "text-primary" : "text-slate-500"}`}>cm</span>
                          <div className="w-[1px] h-2.5 bg-white/10" />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${unitSystem === "imperial" ? "text-primary" : "text-slate-500"}`}>ft</span>
                        </button>
                      </div>
                    </InputGroup>
                    {errors.height && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.height}</p>}
                  </div>
                  <div>
                    <InputGroup icon={<Scale className="w-4 h-4" />} label="Weight" id="weight" optional>
                      <div className="relative flex items-center w-full">
                        <input id="weight" type="text" name="weight" value={formData.weight} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500 pr-16" placeholder={unitSystem === "metric" ? "75 kg" : "165 lbs"} />
                        <button type="button" onClick={() => setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")} className="absolute right-0 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${unitSystem === "metric" ? "text-primary" : "text-slate-500"}`}>kg</span>
                          <div className="w-[1px] h-2.5 bg-white/10" />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${unitSystem === "imperial" ? "text-primary" : "text-slate-500"}`}>lbs</span>
                        </button>
                      </div>
                    </InputGroup>
                    {errors.weight && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.weight}</p>}
                  </div>
                </div>
                <InputGroup icon={<Activity className="w-5 h-5" />} label="Allergies" id="allergies" optional>
                  <div className="space-y-3 w-full">
                    {formData.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((a: string, i: number) => {
                          const isMed = a.startsWith('💊 ');
                          const displayName = isMed ? a.replace('💊 ', '') : a;
                          return (
                            <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isMed ? 'bg-sky-500/10 text-sky-300 border-sky-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                              {isMed && <Pill className="w-3 h-3" />}
                              {displayName}
                              <button type="button" onClick={() => removeArrayItem('allergies', i)} className="ml-1 hover:scale-110 transition-transform cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex gap-2 w-full">
                      <input id="allergies" type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} className="input-field flex-1 text-white placeholder:text-slate-500" placeholder="e.g. Peanuts, Penicillin..." onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('allergies', newAllergy, setNewAllergy); } }} />
                      <button type="button" onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)} className="w-12 flex-shrink-0 border border-white/20 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                    </div>
                  </div>
                </InputGroup>
                <div className="grid grid-cols-1 gap-4">
                  <InputGroup icon={<Stethoscope className="w-5 h-5" />} label="Medical Conditions" id="medicalConditions" optional>
                    <div className="space-y-3 w-full">
                      {formData.medicalConditions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.medicalConditions.map((c: string, i: number) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-bold border border-teal-200/30">
                              {c}
                              <button type="button" onClick={() => removeArrayItem('medicalConditions', i)} className="ml-1 hover:scale-110 transition-transform cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 w-full">
                        <input id="medicalConditions" type="text" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} className="input-field flex-1 text-white placeholder:text-slate-500" placeholder="e.g. Asthma, Diabetes..." onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('medicalConditions', newCondition, setNewCondition); } }} />
                        <button type="button" onClick={() => addArrayItem('medicalConditions', newCondition, setNewCondition)} className="w-12 flex-shrink-0 border border-white/20 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </InputGroup>
                  <InputGroup icon={<FileText className="w-5 h-5" />} label="Current Medications" id="currentMedications" optional>
                    <div className="space-y-3 w-full">
                      {formData.currentMedications.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.currentMedications.map((m: string, i: number) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-200/30">
                              {m}
                              <button type="button" onClick={() => removeArrayItem('currentMedications', i)} className="ml-1 hover:scale-110 transition-transform cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 w-full">
                        <input id="currentMedications" type="text" value={newMedication} onChange={(e) => setNewMedication(e.target.value)} className="input-field flex-1 text-white placeholder:text-slate-500" placeholder="e.g. Inhaler, Insulin..." onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('currentMedications', newMedication, setNewMedication); } }} />
                        <button type="button" onClick={() => addArrayItem('currentMedications', newMedication, setNewMedication)} className="w-12 flex-shrink-0 border border-white/20 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </InputGroup>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={prevStep} className="btn-back"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <button type="button" onClick={handleNextStep} className="btn-next">Next <ChevronRight className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: EMERGENCY */}
            {step === 4 && (
              <motion.div
                key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <InputGroup icon={<User className="w-5 h-5" />} label="Emergency Contact Name" id="emergencyName" required>
                    <input id="emergencyName" type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500" placeholder="John Doe" required />
                  </InputGroup>
                  {errors.emergencyName && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.emergencyName}</p>}
                </div>

                <div className="space-y-2 text-left group">
                  <label htmlFor="emergencyPhone" className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] ml-1">Emergency Phone *</label>
                  <div className="flex gap-2">
                    {/* Custom Country Code Selector */}
                    <div className="w-32 relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full h-full flex items-center justify-between gap-1 bg-white/5 border border-white/10 rounded-2xl pl-3 pr-2.5 py-3.5 text-md font-semibold text-white cursor-pointer focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
                      >
                        {selectedCountry ? (
                          <span className="flex items-center gap-1.5 font-medium truncate">
                            <img
                              src={selectedCountry.flagUrl}
                              alt=""
                              className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0"
                              loading="lazy"
                            />
                            <span>{selectedCountry.dialCode}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Select</span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isDropdownOpen ? "rotate-90" : ""}`} />
                      </button>

                      {isDropdownOpen && (
                        <>
                          {/* Click-away backdrop */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setCountrySearch("");
                            }}
                          />

                          {/* Dropdown Menu */}
                          <div className="absolute bottom-full left-0 mb-2 z-50 w-64 max-h-60 overflow-y-auto bg-slate-950 border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 text-white">
                            {/* Search bar inside dropdown */}
                            <div className="sticky top-0 bg-slate-950 pb-1.5 border-b border-white/10 z-10">
                              <input
                                type="text"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="overflow-y-auto max-h-40 flex flex-col gap-0.5">
                              {countries.length === 0 ? (
                                <div className="flex items-center justify-center py-6 text-xs text-slate-400 gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span>Loading countries...</span>
                                </div>
                              ) : filteredCountries.length > 0 ? (
                                filteredCountries.map((c, index) => (
                                  <button
                                    key={`${c.code}-${index}`}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(c);
                                      setIsDropdownOpen(false);
                                      setCountrySearch("");
                                    }}
                                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-left text-xs rounded-xl transition-all ${selectedCountry?.code === c.code
                                      ? "bg-primary/20 text-primary font-bold"
                                      : "text-slate-300 hover:bg-white/5"
                                      }`}
                                  >
                                    <img
                                      src={c.flagUrl}
                                      alt=""
                                      className="w-4 h-3 object-cover rounded-sm shadow-sm"
                                      loading="lazy"
                                    />
                                    <span className="truncate max-w-[120px]">{c.name}</span>
                                    <span className="text-slate-400 font-semibold ml-auto">{c.dialCode}</span>
                                  </button>
                                ))
                              ) : (
                                <span className="text-[10px] text-center text-slate-400 py-3 font-semibold uppercase tracking-wider">No countries found</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Phone Number Input */}
                    <div className="flex-1 flex items-center gap-3.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus-within:border-primary/50 focus-within:bg-white/10 transition-all duration-300">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <input id="emergencyPhone" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} onBlur={handleBlur} className="input-field text-white placeholder:text-slate-500" placeholder="9876543210" required />
                    </div>
                  </div>
                  {errors.emergencyPhone && <p className="text-xs text-red-400 mt-1 font-semibold pl-1">{errors.emergencyPhone}</p>}
                </div>

                <InputGroup icon={<FileText className="w-5 h-5" />} label="Medical Notes & Instructions" id="medicalNotes" optional>
                  <textarea id="medicalNotes" name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} className="input-field text-white placeholder:text-slate-500 min-h-[80px] py-3 resize-none bg-transparent" placeholder="Medications, special instructions, etc." />
                </InputGroup>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={prevStep} className="btn-back"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Finish Setup</>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400 font-medium">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </motion.div>

      {/* Global Input Styles */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 15px;
          color: #ffffff;
          padding: 2px 0;
        }
        .input-field::placeholder {
          color: #64748b;
        }
        .btn-next {
          width: 100%;
          padding: 1rem;
          background: var(--color-primary);
          color: white;
          border-radius: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 10px 20px -10px rgba(14, 165, 233, 0.3);
        }
        .btn-next:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-back {
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border-radius: 1rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        .btn-back:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        select option {
          background-color: #020617 !important;
          color: #ffffff !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

function InputGroup({
  icon, label, children, id, required, optional
}: {
  icon: React.ReactNode, label: string, children: React.ReactNode, id: string, required?: boolean, optional?: boolean
}) {
  return (
    <div className="space-y-2 text-left group">
      <div className="flex items-center justify-between ml-1">
        <label htmlFor={id} className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] group-focus-within:text-primary transition-colors">
          {label} {required && <span className="text-primary ml-0.5">*</span>}
        </label>
        {optional && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">(Optional)</span>}
      </div>
      <div className="flex items-center gap-3.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus-within:border-primary/50 focus-within:bg-white/10 transition-all duration-300 relative">
        <div className="text-slate-400 group-focus-within:text-primary/80 transition-colors">
          {icon}
        </div>
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
