import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Eye } from "lucide-react";

const Index = () => {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <h1 className="font-display text-5xl font-black tracking-wider text-primary text-glow-green md:text-7xl">
            SNAKE
          </h1>
          <p className="font-display text-sm tracking-[0.3em] text-neon-purple text-glow-purple">
            DARK EDITION
          </p>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          Classic snake with a twist. Two modes, live spectating, and global leaderboards.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="gap-2 box-glow-green font-display text-base">
          <Link to="/play">
            <Gamepad2 className="h-5 w-5" />
            Play Now
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10 font-display text-base">
          <Link to="/leaderboard">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-display text-base">
          <Link to="/watch">
            <Eye className="h-5 w-5" />
            Watch Live
          </Link>
        </Button>
      </div>

      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(hsl(145 80% 42% / 0.15) 1px, transparent 1px),
              linear-gradient(90deg, hsl(145 80% 42% / 0.15) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </main>
  );
};

export default Index;
