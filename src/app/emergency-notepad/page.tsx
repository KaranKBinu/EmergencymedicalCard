"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmergencyNotepadRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a random unique alphabet/numeric ID for isolated user notepad session
    const randomId = Math.random().toString(36).substring(2, 9);
    router.replace(`/emergency-notepad/${randomId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Generating your private cloud-synced notepad...</p>
      </div>
    </div>
  );
}
