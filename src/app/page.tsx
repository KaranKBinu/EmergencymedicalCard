import Link from "next/link";
import { Heart, Shield, Zap, QrCode, Activity, ArrowRight, UserPlus, Sparkles, AlertCircle, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Landing Page Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black font-outfit tracking-tight text-xl text-slate-800">
              Pulse<span className="text-primary">ID</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-600 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-primary hover:bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20"
            >
              Get Free ID
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[550px] bg-primary/10 blur-[120px] rounded-full -z-10 opacity-70" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-xs font-bold text-primary mb-8 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            Life-Saving Emergency Medical Card
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-tight max-w-4xl mx-auto font-outfit">
            Your Medical History <br />
            <span className="text-primary relative inline-block">
              Saves Your Life
              <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/10 -z-10 rounded"></span>
            </span>.
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-lg sm:text-xl mb-12 leading-relaxed font-medium">
            Create your secure digital emergency profile in minutes. Generate a unique, scannable QR code 
            for first responders to access your vital health data when every second counts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link 
              href="/register" 
              className="px-8 py-5 bg-primary text-white rounded-2xl font-bold hover:bg-sky-600 transition-all w-full text-center shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 group"
            >
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Key Benefits</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-outfit tracking-tight">Engineered for Rapid Assistance</h2>
            <p className="text-slate-500 font-medium">Designed alongside medical guidelines to ensure EMTs and doctors get critical facts immediately.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Instant Scan System"
              description="EMTs can scan your card's QR code using any smartphone to instantly see your blood type, chronic conditions, and allergies."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-teal-600" />}
              title="HIPAA & Privacy First"
              description="You have full control over what data is public. Hide sensitive medical records behind your private user dashboard securely."
            />
            <FeatureCard 
              icon={<QrCode className="w-6 h-6 text-slate-700" />}
              title="Wallet-Ready & Print"
              description="Download your digital pass to your phone wallet, save as an offline image, or print a high-resolution wallet-sized card."
            />
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Process Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-outfit tracking-tight">How PulseID Protects You</h2>
            <p className="text-slate-500 font-medium">Three simple steps to secure your clinical identity and prepare for unexpected emergencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <StepItem 
              num="01"
              icon={<UserPlus className="w-6 h-6 text-primary" />}
              title="Fill Out Vitals Profile"
              description="Enter your biological gender, blood group, chronic diseases, current medication details, and allergy warnings."
            />
            <StepItem 
              num="02"
              icon={<FileText className="w-6 h-6 text-teal-600" />}
              title="Generate Scannable Card"
              description="Our system automatically formats a clean, medical-grade card preview with a unique QR code linked to your public emergency page."
            />
            <StepItem 
              num="03"
              icon={<Sparkles className="w-6 h-6 text-[#ef4444]" />}
              title="First Responders Scan"
              description="In an emergency event, responders scan the physical card to immediately view vital data and speed up triage decisions."
            />
          </div>
        </div>
      </section>
      
      {/* Card Preview Section */}
      <section className="py-24 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Card Interface</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 font-outfit leading-tight">
              The Card That <br/> Speaks For You.
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium text-lg">
              When communication is impossible, your physical medical pass ensures doctors, EMTs, and good samaritans know exactly how to handle your treatment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { label: 'One-tap emergency call', icon: <Heart className="w-4 h-4 text-primary fill-primary/10" /> },
                { label: 'Allergy warning badges', icon: <AlertCircle className="w-4 h-4 text-[#ef4444] fill-red-50" /> },
                { label: 'Blood group indicator', icon: <Activity className="w-4 h-4 text-teal-600" /> },
                { label: 'Printed wallet pass size', icon: <QrCode className="w-4 h-4 text-slate-600" /> }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full flex justify-center">
            <div className="rounded-[2.5rem] p-8 aspect-[1.58/1] w-full max-w-md shadow-2xl relative overflow-hidden group border border-slate-200/50 bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white transform hover:scale-[1.02] transition-transform duration-300">
              {/* Card Hologram stripes */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 blur-[40px] rounded-full" />
              <div className="absolute top-8 right-8">
                <QrCode className="w-20 h-20 text-white opacity-30 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mb-6 flex items-center justify-center shadow-inner">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black font-outfit tracking-tight">John Doe</h3>
                  <p className="text-[10px] uppercase tracking-widest text-sky-200 font-bold mt-1">EMERGENCY ID: #PULSE-99</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-wider">A POSITIVE</div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-red-500/25 border border-red-500/30 text-red-200 text-[10px] font-black uppercase tracking-wider">ALLERGIC: NUTS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Clinical Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-black font-outfit tracking-tight text-lg text-slate-800">
              Pulse<span className="text-primary">ID</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            PulseID is a secure clinical digital information pass. We prioritize security and encryption protocols. 
            Medical records listed on public QR endpoints are solely managed and consented to by the profile owner.
          </p>
          <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
            &copy; 2026 PulseID. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 shadow-sm cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 mb-3 tracking-tight font-outfit">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

function StepItem({ num, icon, title, description }: { num: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="relative space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div className="text-3xl font-black text-slate-200 font-outfit tracking-tight">{num}</div>
      </div>
      <h3 className="text-lg font-black text-slate-850 tracking-tight font-outfit">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}
