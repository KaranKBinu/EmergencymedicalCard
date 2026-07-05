"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Mail, Lock, Phone, Droplets, 
  ChevronRight, ChevronLeft, CheckCircle2, 
  Calendar, MapPin, Ruler, Scale, Activity, 
  Stethoscope, FileText, Camera, Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    dob: "",
    bloodGroup: "O+",
    gender: "",
    emergencyName: "",
    emergencyPhone: "",
    address: "",
    height: "",
    weight: "",
    allergies: "",
    medicalConditions: "",
    medicalNotes: "",
    photoUrl: "",
  });

  // Fetch Country Codes
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2");
        const data = await res.json();
        const formatted: Country[] = data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => ({
            name: c.name.common,
            flag: c.flags.png || c.flags.svg,
            code: c.cca2,
            dialCode: `${c.idd.root}${c.idd.suffixes?.[0] || ""}`
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        setCountries(formatted);
        // Default to India or first in list
        const defaultCountry = formatted.find(c => c.code === "IN") || formatted[0];
        setSelectedCountry(defaultCountry);
      } catch (error) {
        console.error("Failed to fetch countries, using fallback list.", error);
        const fallbackCountries: Country[] = [
          { name: "India", flag: "https://flagcdn.com/w320/in.png", code: "IN", dialCode: "+91" },
          { name: "United States", flag: "https://flagcdn.com/w320/us.png", code: "US", dialCode: "+1" },
          { name: "United Kingdom", flag: "https://flagcdn.com/w320/gb.png", code: "GB", dialCode: "+44" },
          { name: "Canada", flag: "https://flagcdn.com/w320/ca.png", code: "CA", dialCode: "+1" },
          { name: "Australia", flag: "https://flagcdn.com/w320/au.png", code: "AU", dialCode: "+61" },
          { name: "Germany", flag: "https://flagcdn.com/w320/de.png", code: "DE", dialCode: "+49" },
          { name: "United Arab Emirates", flag: "https://flagcdn.com/w320/ae.png", code: "AE", dialCode: "+971" }
        ];
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      }
    }
    fetchCountries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] bg-accent/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100"
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-2 font-outfit">Create PulseID</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === s ? "w-10 bg-primary" : step > s ? "w-4 bg-primary/40" : "w-2 bg-slate-100"
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
                <InputGroup icon={<Mail className="w-5 h-5" />} label="Email Address" required>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="john@example.com" required />
                </InputGroup>
                <InputGroup icon={<Lock className="w-5 h-5" />} label="Password" required>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" required />
                </InputGroup>
                <button type="button" onClick={nextStep} className="btn-next">
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
                <InputGroup icon={<User className="w-5 h-5" />} label="Full Name" required>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" placeholder="John Doe" required />
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup icon={<Calendar className="w-5 h-5" />} label="Birth Date" required>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field [color-scheme:light]" required />
                  </InputGroup>
                  <InputGroup icon={<User className="w-5 h-5" />} label="Gender" required>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field appearance-none cursor-pointer" required>
                      <option value="" className="bg-white text-slate-900">Gender</option>
                      <option value="MALE" className="bg-white text-slate-900">Male</option>
                      <option value="FEMALE" className="bg-white text-slate-900">Female</option>
                      <option value="OTHER" className="bg-white text-slate-900">Other</option>
                    </select>
                  </InputGroup>
                </div>
                <InputGroup icon={<MapPin className="w-5 h-5" />} label="Residential Address" optional>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="City, State, Country" />
                </InputGroup>
                <InputGroup icon={<Camera className="w-5 h-5" />} label="Profile Photo URL" optional>
                  <input type="url" name="photoUrl" value={formData.photoUrl} onChange={handleChange} className="input-field" placeholder="https://image.com/photo.jpg" />
                </InputGroup>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={prevStep} className="btn-back"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <button type="button" onClick={nextStep} className="btn-next">Next <ChevronRight className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: MEDICAL */}
            {step === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup icon={<Droplets className="w-5 h-5" />} label="Blood Group" required>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field appearance-none cursor-pointer">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg} className="bg-white text-slate-900">{bg}</option>)}
                    </select>
                  </InputGroup>
                  <div className="grid grid-cols-2 gap-2">
                    <InputGroup icon={<Ruler className="w-4 h-4" />} label="Height" optional>
                      <input type="text" name="height" value={formData.height} onChange={handleChange} className="input-field" placeholder="180cm" />
                    </InputGroup>
                    <InputGroup icon={<Scale className="w-4 h-4" />} label="Weight" optional>
                      <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="input-field" placeholder="75kg" />
                    </InputGroup>
                  </div>
                </div>
                <InputGroup icon={<Activity className="w-5 h-5" />} label="Allergies" optional>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="input-field" placeholder="Peanuts, Penicillin (comma separated)" />
                </InputGroup>
                <InputGroup icon={<Stethoscope className="w-5 h-5" />} label="Medical Conditions" optional>
                  <input type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} className="input-field" placeholder="Asthma, Diabetes (comma separated)" />
                </InputGroup>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={prevStep} className="btn-back"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <button type="button" onClick={nextStep} className="btn-next">Next <ChevronRight className="w-4 h-4" /></button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: EMERGENCY */}
            {step === 4 && (
              <motion.div 
                key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <InputGroup icon={<User className="w-5 h-5" />} label="Emergency Contact Name" required>
                  <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="input-field" placeholder="John Doe" required />
                </InputGroup>
                
                <div className="space-y-2 text-left group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] ml-1">Emergency Phone *</label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="w-24 relative">
                      <select 
                        onChange={(e) => {
                          const c = countries.find(c => c.code === e.target.value);
                          if (c) setSelectedCountry(c);
                        }}
                        value={selectedCountry?.code || ""}
                        className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl px-2 py-3.5 appearance-none text-xs text-slate-800 text-center cursor-pointer outline-none focus:border-primary/50 focus:bg-white transition-all"
                      >
                        {countries.map(c => (
                          <option key={c.code} value={c.code} className="bg-white text-slate-900">
                            {c.dialCode}
                          </option>
                        ))}
                      </select>
                      <div className="absolute top-1/2 right-2 -translate-y-1/2 pointer-events-none">
                        <Globe className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                    {/* Phone Number Input */}
                    <div className="flex-1 flex items-center gap-3.5 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-primary/50 focus-within:bg-white transition-all duration-300">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="input-field" placeholder="9876543210" required />
                    </div>
                  </div>
                </div>

                <InputGroup icon={<FileText className="w-5 h-5" />} label="Medical Notes & Instructions" optional>
                  <textarea name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} className="input-field min-h-[80px] py-3 resize-none" placeholder="Medications, special instructions, etc." />
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

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
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
          color: #0f172a;
          padding: 2px 0;
        }
        .input-field::placeholder {
          color: #94a3b8;
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
          background: #f1f5f9;
          color: #475569;
          border-radius: 1rem;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        .btn-back:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
}

function InputGroup({ 
  icon, label, children, required, optional 
}: { 
  icon: React.ReactNode, label: string, children: React.ReactNode, required?: boolean, optional?: boolean
}) {
  return (
    <div className="space-y-2 text-left group">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] group-focus-within:text-primary transition-colors">
          {label} {required && <span className="text-primary ml-0.5">*</span>}
        </label>
        {optional && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">(Optional)</span>}
      </div>
      <div className="flex items-center gap-3.5 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-primary/50 focus-within:bg-white transition-all duration-300">
        <div className="text-slate-400 group-focus-within:text-primary/80 transition-colors">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
