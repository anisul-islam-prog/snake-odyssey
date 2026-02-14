export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameMode = "walls" | "pass-through";
export type TimeFilter = "daily" | "weekly" | "all-time";

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  speed: number;
  isGameOver: boolean;
  isPaused: boolean;
  gridSize: number;
  mode: GameMode;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
  userId: string;
}

export interface LivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  startedAt: string;
}
