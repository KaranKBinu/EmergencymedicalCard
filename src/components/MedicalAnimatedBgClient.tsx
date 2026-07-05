"use client";

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
  return <MedicalAnimatedBg theme={theme} fixed={fixed} />;
}
