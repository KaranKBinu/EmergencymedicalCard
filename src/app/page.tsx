import Link from "next/link";
import { Heart, Shield, Zap, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Saving Technology
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-gradient leading-tight">
            Your Medical History <br />
            <span className="text-primary">Saves Your Life.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-10">
            Create your emergency medical card in seconds. Get a unique QR code 
            that gives first responders instant access to your critical vitals when it matters most.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 transition-all emergency-pulse w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 glass text-white rounded-2xl font-semibold hover:bg-white/10 transition-all w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Instant Scan"
              description="First responders can scan your QR code to instantly see allergies, blood group, and contacts."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-accent" />}
              title="Privacy First"
              description="Control what information is public. Your sensitive data stays secure behind your dashboard."
            />
            <FeatureCard 
              icon={<QrCode className="w-6 h-6 text-white" />}
              title="Digital & Physical"
              description="Download your card as a digital pass or print a physical version for your wallet."
            />
          </div>
        </div>
      </section>
      
      {/* Card Preview Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h2 className="text-3xl font-bold mb-4">The Card That <br/> Speaks For You.</h2>
            <p className="text-muted-foreground mb-6">
              In an emergency, every second counts. Our digital card is designed to be readable, 
              accessible, and high-contrast so that medical professionals can act fast.
            </p>
            <ul className="space-y-3">
              {['One-tap emergency call', 'Critical allergy alerts', 'Blood group visualization', 'Organ donor status'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 relative">
            <div className="glass rounded-[2.5rem] p-8 aspect-[1.58/1] w-full max-w-md mx-auto shadow-[0_0_50px_-12px_rgba(255,77,77,0.2)] relative overflow-hidden group border-white/10">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
              <div className="absolute top-0 right-0 p-8">
                <QrCode className="w-20 h-20 text-white opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 mb-4 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Alex Rivera</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mt-1">Life ID: #EMER-24</p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary text-xs font-black">AB POSITIVE</div>
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-black">ALLERGIC: PENICILLIN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-3xl hover:bg-white/[0.07] transition-all cursor-default border-white/5">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
