import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { LogOut, User, Gamepad2 } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/play", label: "Play" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/watch", label: "Watch Live" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-primary text-glow-green">SNAKE</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === l.to ? "text-primary text-glow-green" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="flex items-center gap-1 text-sm font-semibold text-neon-cyan">
                  <User className="h-4 w-4" />
                  {user.username}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setAuthModal("login")}>
                  Log In
                </Button>
                <Button size="sm" onClick={() => setAuthModal("signup")} className="box-glow-green">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center justify-center gap-4 border-t border-border py-2 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-semibold ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={(m) => setAuthModal(m)} />
    </>
  );
}
