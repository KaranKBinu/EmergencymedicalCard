"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Heart, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

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
    <div className="min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-accent/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20"
          >
            <Heart className="w-7 h-7 text-primary fill-primary/20" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your credentials to access your Life ID</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <InputGroup icon={<Mail className="w-5 h-5" />} label="Email">
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground/50" 
                placeholder="name@example.com" required 
              />
            </InputGroup>
            <InputGroup icon={<Lock className="w-5 h-5" />} label="Password">
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground/50" 
                placeholder="••••••••" required 
              />
            </InputGroup>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">Create Life ID</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function InputGroup({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-[0.15em] ml-1">{label}</label>
      <div className="flex items-center gap-3.5 px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300">
        <div className="text-muted-foreground/60">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

