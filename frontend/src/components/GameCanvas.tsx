import { useRef, useEffect, useCallback } from "react";
import type { GameState } from "@/types/game";

interface GameCanvasProps {
  gameState: GameState;
  cellSize?: number;
}

export function GameCanvas({ gameState, cellSize = 20 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = gameState.gridSize * cellSize;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = "hsl(220, 25%, 8%)";
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = "hsla(220, 25%, 15%, 0.5)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gameState.gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Food with glow
    ctx.shadowColor = "hsl(330, 85%, 60%)";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "hsl(330, 85%, 60%)";
    ctx.beginPath();
    ctx.arc(
      gameState.food.x * cellSize + cellSize / 2,
      gameState.food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake with glow
    gameState.snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.shadowColor = "hsl(145, 80%, 42%)";
      ctx.shadowBlur = isHead ? 20 : 8;
      ctx.fillStyle = isHead ? "hsl(145, 80%, 50%)" : `hsl(145, 80%, ${42 - i * 0.5}%)`;
      ctx.fillRect(
        seg.x * cellSize + 1,
        seg.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });
    ctx.shadowBlur = 0;

    // Border for walls mode
    if (gameState.mode === "walls") {
      ctx.strokeStyle = "hsl(0, 75%, 55%)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "hsl(0, 75%, 55%)";
      ctx.shadowBlur = 10;
      ctx.strokeRect(0, 0, size, size);
      ctx.shadowBlur = 0;
    }
  }, [gameState, cellSize]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-md border border-border"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
