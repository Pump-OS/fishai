"use client";

import Link from "next/link";
import { useState } from "react";
import MusicToggle from "./MusicToggle";

const NAV_LINKS = [
  { href: "/catch", label: "CATCH" },
  { href: "/tackle", label: "TACKLE" },
  { href: "/weather", label: "WEATHER" },
  { href: "/chat", label: "CHAT" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50" style={{ background: "rgba(35, 32, 26, 0.92)", borderBottom: "1px solid rgba(80, 72, 58, 0.3)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-10">
            <img src="/images/fish-logo.png" alt="FishAI" className="w-12 h-auto group-hover:brightness-125 transition-all" />
            <span className="font-game text-xs text-[#c8b06a] group-hover:text-white transition-colors tracking-wider">
              FishAI
            </span>
          </Link>

          {/* Desktop Nav — absolutely centered */}
          <div className="hidden md:flex items-center gap-0 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2 text-xs font-bold tracking-widest text-[#999] hover:text-white hover:bg-white/5 transition-all uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 z-10">
            <MusicToggle />

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#999]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 pt-2" style={{ borderTop: "1px solid rgba(80, 72, 58, 0.3)" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-xs font-bold tracking-widest text-[#999] hover:text-white hover:bg-white/5 transition-all uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
