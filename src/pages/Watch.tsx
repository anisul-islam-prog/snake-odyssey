import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameCanvas } from "@/components/GameCanvas";
import { createInitialState, moveSnake, getAIDirection, GRID_SIZE } from "@/game/engine";
import type { LivePlayer, GameState } from "@/types/game";
import * as api from "@/services/api";
import { ArrowLeft, Eye, Gamepad2 } from "lucide-react";

export default function WatchPage() {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [spectating, setSpectating] = useState<LivePlayer | null>(null);
  const [aiGameState, setAiGameState] = useState<GameState | null>(null);
  const aiRef = useRef<GameState | null>(null);

  useEffect(() => {
    api.getLivePlayers().then((p) => { setPlayers(p); setLoading(false); });
  }, []);

  // Start AI game when spectating
  useEffect(() => {
    if (!spectating) { setAiGameState(null); return; }
    const state = createInitialState(spectating.mode);
    setAiGameState(state);
    aiRef.current = state;
  }, [spectating]);

  // AI game loop
  useEffect(() => {
    if (!aiGameState || aiGameState.isGameOver) return;
    const interval = setInterval(() => {
      setAiGameState((s) => {
        if (!s || s.isGameOver) return s;
        const dir = getAIDirection(s);
        const next = moveSnake(s, dir);
        aiRef.current = next;
        // Auto restart if game over
        if (next.isGameOver && spectating) {
          const fresh = createInitialState(spectating.mode);
          aiRef.current = fresh;
          return fresh;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [aiGameState?.isGameOver, spectating]);

  const cellSize = Math.min(18, Math.floor((Math.min(window.innerWidth - 48, 450)) / GRID_SIZE));

  if (spectating && aiGameState) {
    return (
      <main className="container mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-8">
        <Button variant="ghost" onClick={() => setSpectating(null)} className="self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to lobby
        </Button>
        <div className="flex items-center gap-4">
          <Eye className="h-5 w-5 text-neon-cyan animate-pulse-glow" />
          <span className="font-display text-lg font-bold text-neon-cyan">Spectating {spectating.username}</span>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">SCORE</p>
            <p className="font-display text-xl font-bold text-primary">{aiGameState.score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">MODE</p>
            <p className="font-display text-sm font-bold text-neon-purple">
              {spectating.mode === "walls" ? "WALLS" : "PASS-THROUGH"}
            </p>
          </div>
        </div>
        <GameCanvas gameState={aiGameState} cellSize={cellSize} />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-primary text-glow-green">Watch Live</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading players...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {players.map((p) => (
            <Card key={p.id} className="cursor-pointer border-border transition-colors hover:border-primary/50 hover:box-glow-green" onClick={() => setSpectating(p)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Gamepad2 className="h-4 w-4 text-neon-cyan" />
                  {p.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {p.mode === "walls" ? "🧱 Walls" : "🌀 Pass-Through"}
                </span>
                <span className="font-display text-lg font-bold text-primary">{p.score}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
