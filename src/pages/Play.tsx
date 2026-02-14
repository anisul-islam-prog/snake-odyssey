import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameCanvas } from "@/components/GameCanvas";
import { createInitialState, moveSnake, GRID_SIZE } from "@/game/engine";
import type { Direction, GameMode } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/services/api";
import { Pause, Play, RotateCcw } from "lucide-react";

export default function PlayPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<GameMode>("walls");
  const [gameState, setGameState] = useState(() => createInitialState("walls"));
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const directionRef = useRef<Direction>(gameState.direction);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const startGame = (m: GameMode) => {
    setMode(m);
    const s = createInitialState(m);
    setGameState(s);
    directionRef.current = s.direction;
    setStarted(true);
    setSubmitted(false);
  };

  const togglePause = () => {
    setGameState((s) => ({ ...s, isPaused: !s.isPaused }));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        directionRef.current = dir;
      }
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Game loop
  useEffect(() => {
    if (!started || gameState.isGameOver || gameState.isPaused) return;
    const interval = setInterval(() => {
      setGameState((s) => {
        const next = moveSnake(s, directionRef.current);
        directionRef.current = next.direction;
        return next;
      });
    }, gameState.speed);
    return () => clearInterval(interval);
  }, [started, gameState.isGameOver, gameState.isPaused, gameState.speed]);

  const handleSubmitScore = useCallback(async () => {
    if (!user || submitted) return;
    try {
      await api.submitScore(gameState.score, mode);
      setSubmitted(true);
    } catch {}
  }, [user, submitted, gameState.score, mode]);

  const cellSize = Math.min(20, Math.floor((Math.min(window.innerWidth - 48, 500)) / GRID_SIZE));

  if (!started) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-4">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-green">Select Mode</h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={() => startGame("walls")} size="lg" className="font-display box-glow-green min-w-[160px]">
            🧱 Walls Mode
          </Button>
          <Button onClick={() => startGame("pass-through")} size="lg" variant="outline" className="font-display border-neon-purple text-neon-purple hover:bg-neon-purple/10 min-w-[160px]">
            🌀 Pass-Through
          </Button>
        </div>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          <strong>Walls:</strong> Hit a wall = game over. <strong>Pass-Through:</strong> Snake wraps around edges.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center gap-4 px-4 py-8">
      {/* HUD */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">SCORE</p>
          <p className="font-display text-2xl font-bold text-primary text-glow-green">{gameState.score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">MODE</p>
          <p className="font-display text-sm font-bold text-neon-purple">{mode === "walls" ? "WALLS" : "PASS-THROUGH"}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">SPEED</p>
          <p className="font-display text-sm font-bold text-neon-cyan">{Math.round((1 / gameState.speed) * 1000)}x</p>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <GameCanvas gameState={gameState} cellSize={cellSize} />
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md bg-background/80 backdrop-blur-sm">
            <h2 className="font-display text-3xl font-bold text-destructive">GAME OVER</h2>
            <p className="font-display text-xl text-primary">Score: {gameState.score}</p>
            {user && !submitted && (
              <Button onClick={handleSubmitScore} className="box-glow-green">Submit Score</Button>
            )}
            {submitted && <p className="text-sm text-neon-cyan">Score submitted! ✓</p>}
            {!user && <p className="text-sm text-muted-foreground">Log in to submit your score</p>}
            <Button variant="outline" onClick={() => startGame(mode)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={togglePause} disabled={gameState.isGameOver}>
          {gameState.isPaused ? <Play className="mr-1 h-4 w-4" /> : <Pause className="mr-1 h-4 w-4" />}
          {gameState.isPaused ? "Resume" : "Pause"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => startGame(mode)}>
          <RotateCcw className="mr-1 h-4 w-4" /> Restart
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Arrow keys or WASD to move · Space to pause</p>
    </main>
  );
}
