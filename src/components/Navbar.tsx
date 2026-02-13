"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Reviews" },
    { href: "/map", label: "Map" },
  ];

  return (
    <nav className="glass sticky top-0 z-50" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)" }}
          >
            FR
          </span>
          <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
            Food
            <span style={{ color: "var(--accent)" }}>Reviews</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? "var(--accent)" : "var(--muted)",
                  backgroundColor: isActive ? "var(--accent-glow)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--foreground)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--muted)";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg sm:hidden transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{ background: menuOpen ? "var(--accent-glow)" : "transparent" }}
        >
          <svg
            className="h-5 w-5 transition-transform duration-200"
            style={{
              color: menuOpen ? "var(--accent)" : "var(--muted)",
              transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="animate-slide-down border-t px-5 pb-4 pt-2 sm:hidden"
          style={{ borderColor: "var(--border-light)" }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--accent)" : "var(--muted)",
                  backgroundColor: isActive ? "var(--accent-glow)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
