"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Heart, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
      
      <div className="w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground text-sm">Access your medical dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <InputGroup icon={<Mail />} label="Email">
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
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          New to Life ID? <Link href="/register" className="text-primary font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

function InputGroup({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl focus-within:border-primary/50 transition-all">
        <div className="text-muted-foreground w-5 h-5 flex-shrink-0">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
