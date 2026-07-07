"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MedicalAnimatedBg = dynamic(
  () => import("@/components/MedicalAnimatedBg"),
  { ssr: false }
);

export default function MedicalAnimatedBgClient({
  theme,
  fixed,
}: {
  theme?: "blue" | "light";
  fixed?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  if (!isMounted) return null;

  if (isMobile) {
    // Static gradient background for mobile view (zero CPU/GPU overhead)
    const bgStyle = theme === "blue" 
      ? "linear-gradient(135deg, #0a1628 0%, #0d2540 45%, #0f172a 100%)"
      : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 45%, #f8fafc 100%)";
    return (
      <div 
        className={`${fixed ? 'fixed' : 'absolute'} inset-0 pointer-events-none select-none ${fixed ? 'z-0' : ''}`}
        style={{ background: bgStyle }}
      />
    );
  }

  return <MedicalAnimatedBg theme={theme} fixed={fixed} />;
}
