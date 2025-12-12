import { Link } from "wouter";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-4 max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black gradient-text leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="gradient-primary w-20 h-20 rounded-full flex items-center justify-center animate-pulse glow-primary">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          Sahifa topilmadi
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="gradient-primary text-white hover:opacity-90 gap-2 px-6 py-6 text-base rounded-xl hover-glow transition-all duration-300">
              <Home className="w-5 h-5" />
              Bosh sahifaga qaytish
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 px-6 py-6 text-base rounded-xl border-2 hover:border-primary hover:text-primary transition-all duration-300"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga qaytish
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Yoki qidiruv orqali maqola toping:
          </p>
          <div className="mt-4 flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query) {
                      window.location.href = `/?search=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
