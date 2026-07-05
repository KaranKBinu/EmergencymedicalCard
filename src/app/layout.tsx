import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import MedicalAnimatedBgClient from "@/components/MedicalAnimatedBgClient";
import GlobalLoader from "@/components/GlobalLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "PulseID | Secure Digital Emergency Medical Card",
  description: "Create your secure digital emergency medical card. Generate scannable QR codes for EMTs & first responders to access your clinical identity.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased`}>
        <GlobalLoader />
        {/* Global fixed animated medical background — covers entire app, doesn't scroll */}
        <MedicalAnimatedBgClient theme="blue" fixed={true} />
        <Toaster position="top-right" />
        <main className="relative min-h-screen" style={{ zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
