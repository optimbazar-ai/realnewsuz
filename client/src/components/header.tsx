import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Bosh sahifa",
  "Siyosat",
  "Iqtisodiyot",
  "Sport",
  "Texnologiya",
  "Madaniyat",
  "Sog'liqni saqlash",
  "Ta'lim",
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 to-slate-800 border-b border-red-600/20 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Top Row - Logo and Controls */}
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg group-hover:shadow-red-600/50 transition-shadow">
                RN
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none">REAL NEWS</span>
                <span className="text-xs text-slate-400 font-medium">O'zbekiston yangiliklari</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded transition-colors">
                Bosh sahifa
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 border-t border-slate-700/50">
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-colors"
              />
            </div>
          )}

          {/* Category Navigation */}
          <div className="hidden md:flex items-center space-x-1 pb-0 overflow-x-auto scrollbar-hide border-t border-slate-700/30">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={category === "Bosh sahifa" ? "/" : `/?category=${encodeURIComponent(category)}`}
                className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border-b-2 border-transparent hover:border-red-600 transition-all whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-slate-700/30">
              <nav className="flex flex-col space-y-2">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={category === "Bosh sahifa" ? "/" : `/?category=${encodeURIComponent(category)}`}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
