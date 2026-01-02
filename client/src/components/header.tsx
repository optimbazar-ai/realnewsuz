import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Menu, X, Sparkles } from "lucide-react";
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
  const [, setLocation] = useLocation();

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
        <div className="container mx-auto px-4">
          {/* Top Row - Logo and Controls */}
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
              <div className="gradient-primary text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg hover-glow transition-all duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold gradient-text leading-none">REAL NEWS</span>
                <span className="text-xs text-muted-foreground font-medium">O'zbekiston yangiliklari</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary animated-underline transition-colors">
                Bosh sahifa
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 border-t border-border/50 pt-4 slide-up">
              <input
                type="text"
                placeholder="Qidiruv... (Enter bosing)"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value.trim();
                    if (query) {
                      setLocation(`/?search=${encodeURIComponent(query)}`);
                      setSearchOpen(false);
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Category Navigation */}
          <div className="hidden md:flex items-center space-x-1 pb-0 overflow-x-auto scrollbar-hide border-t border-border/30">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={category === "Bosh sahifa" ? "/" : `/?category=${encodeURIComponent(category)}`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-300 whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border/30 slide-up">
              <nav className="flex flex-col space-y-2 pt-4">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={category === "Bosh sahifa" ? "/" : `/?category=${encodeURIComponent(category)}`}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
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
