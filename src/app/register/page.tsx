"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, Droplets, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/actions";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    bloodGroup: "O+",
    gender: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await registerUser(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created successfully!");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary fill-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Life ID</h1>
          <p className="text-muted-foreground text-sm">Step {step} of 2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputGroup icon={<Mail />} label="Email Address">
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sm" placeholder="john@example.com" required 
                />
              </InputGroup>
              <InputGroup icon={<Lock />} label="Password">
                <input 
                  type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sm" placeholder="••••••••" required 
                />
              </InputGroup>
              <button 
                type="button" onClick={nextStep}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all border border-white/5"
              >
                Next Details
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputGroup icon={<User />} label="Full Name">
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sm" placeholder="John Doe" required 
                />
              </InputGroup>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup icon={<Droplets />} label="Blood Group">
                  <select 
                    name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm appearance-none"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <option key={bg} value={bg} className="bg-background">{bg}</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup icon={<Phone />} label="Emergency Phone">
                  <input 
                    type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange}
                    className="w-full bg-transparent border-none outline-none text-sm" placeholder="+1..." required 
                  />
                </InputGroup>
              </div>
              <InputGroup icon={<User />} label="Gender">
                <select 
                  name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sm appearance-none"
                  required
                >
                  <option value="" className="bg-background">Select Gender</option>
                  <option value="MALE" className="bg-background">Male</option>
                  <option value="FEMALE" className="bg-background">Female</option>
                  <option value="OTHER" className="bg-background">Other</option>
                </select>
              </InputGroup>
              <div className="flex gap-4">
                <button 
                  type="button" onClick={prevStep}
                  className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-semibold border border-white/5"
                >
                  Back
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-semibold emergency-pulse disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Finish Setup"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function InputGroup({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl focus-within:border-primary/50 transition-all">
        <div className="text-muted-foreground w-5 h-5 flex-shrink-0">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
