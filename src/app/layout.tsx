import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoBackground from "@/components/layout/VideoBackground";
import LoadingScreen from "@/components/layout/LoadingScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "FishAI — Rust Fishing Village Advisor",
  description:
    "AI-powered fishing assistant. Upload catches, get scored, talk to the Fisherman NPC.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "FishAI — Rust Fishing Village Advisor",
    description: "Your Fisherman NPC companion. Upload. Score. Flex.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LoadingScreen />
        <VideoBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
