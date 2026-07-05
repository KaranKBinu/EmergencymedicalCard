import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, Eye, Lock, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen text-white pt-28 pb-16 px-6">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="font-black font-outfit tracking-tight text-lg text-white">
            Pulse<span className="text-sky-400">ID</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto w-full relative z-10 space-y-12">
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Legal & Privacy Agreement
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-outfit">
            Privacy Policy & <br />
            <span className="text-sky-400">Terms of Service</span>
          </h1>
          <p className="text-white/50 text-sm font-medium">Last updated: July 5, 2026</p>
        </div>

        {/* CRITICAL DISCLAIMER CALLOUT */}
        <div className="p-6 rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-black uppercase tracking-wider font-outfit">Important Liability Disclaimer</h2>
          </div>
          <p className="text-red-200/80 text-sm leading-relaxed font-semibold">
            By generating and sharing your QR code, you acknowledge that any medical records or profile details you select as &quot;Public&quot; will be accessible to anyone who scans your card. PulseID acts strictly as a secure hosting service and does not filter, verify, or restrict who scans your public QR endpoints. 
          </p>
          <p className="text-red-200/80 text-sm leading-relaxed font-bold">
            YOU ARE SOLELY RESPONSIBLE FOR WHAT DATA YOU CHOOSE TO EXPOSE. PULSEID, ITS CREATORS, AND AFFILIATES ACCEPT ABSOLUTELY ZERO LIABILITY OR RESPONSIBILITY FOR ANY CONSEQUENTIAL PRIVACY VIOLATIONS, LEGAL ACTION, OR DAMAGES ARISING FROM SCANNABLE PUBLIC DATA EXPOSED BY PROFILE OWNERS.
          </p>
        </div>

        {/* Section Grid */}
        <div className="space-y-8 text-white/80 leading-relaxed text-sm">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" /> 1. Public Data Consent
            </h3>
            <p>
              Our application offers scannable clinical safety profiles designed to inform first responders in emergencies. When you write details under your medical profile, you are given the option to toggle what information is visible to the public via your scannable QR card. Information marked as public is rendered on public-facing endpoints (e.g. `/v/[id]`). 
            </p>
            <p>
              Creating a profile grants PulseID the right to render this information publicly for your safety card. If you decide to hide any item later, it will be instantly hidden from public view.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> 2. Security and Encryption
            </h3>
            <p>
              We implement industry-standard encryption practices to secure your profile details. Passwords are encrypted using robust hashing algorithms prior to storage. Active sessions are validated via JSON Web Tokens to prevent unauthorized dashboard access. While we employ highest-tier security to safeguard database resources, no electronic storage method is 100% impenetrable.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-400" /> 3. Data We Collect
            </h3>
            <p>
              We collect information provided directly by you when you create an account:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-white/70">
              <li>Account credentials (Email, hashed password)</li>
              <li>Basic identifier facts (Biological gender, date of birth, full name)</li>
              <li>Vital emergency attributes (Blood group, allergies, active medical conditions, medications)</li>
              <li>Emergency contact information</li>
            </ul>
            <p>
              We do not sell, trade, or distribute your healthcare information to third-party marketing companies.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" /> 4. User Responsibilities
            </h3>
            <p>
              You agree to use this platform responsibly and submit accurate clinical details. Submitting falsified medical conditions or using another person&apos;s biological facts is strictly prohibited and can result in profile termination. You are responsible for keeping your login credentials secure.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
