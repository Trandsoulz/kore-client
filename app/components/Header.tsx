"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold text-foreground">Kore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-muted hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#buckets"
              className="text-muted hover:text-foreground transition-colors"
            >
              Financial Buckets
            </Link>
            <Link
              href="#partners"
              className="text-muted hover:text-foreground transition-colors"
            >
              Partners
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-muted hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#buckets"
                className="text-muted hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Financial Buckets
              </Link>
              <Link
                href="#partners"
                className="text-muted hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Partners
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-medium transition-colors text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
