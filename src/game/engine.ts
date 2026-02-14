import type { Direction, GameMode, GameState, Position } from "@/types/game";

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 10;
export const FOOD_PER_SPEED_UP = 5;

export function createInitialState(mode: GameMode): GameState {
  const mid = Math.floor(GRID_SIZE / 2);
  return {
    snake: [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ],
    food: spawnFood([
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ]),
    direction: "RIGHT",
    score: 0,
    speed: INITIAL_SPEED,
    isGameOver: false,
    isPaused: false,
    gridSize: GRID_SIZE,
    mode,
  };
}

export function spawnFood(snake: Position[]): Position {
  let pos: Position;
  do {
    pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export function getOppositeDirection(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  return map[dir];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== getOppositeDirection(current);
}

export function moveSnake(state: GameState, newDirection?: Direction): GameState {
  if (state.isGameOver || state.isPaused) return state;

  const direction = newDirection && isValidDirectionChange(state.direction, newDirection) ? newDirection : state.direction;
  const head = state.snake[0];
  const delta: Record<Direction, Position> = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  };

  let newHead: Position = {
    x: head.x + delta[direction].x,
    y: head.y + delta[direction].y,
  };

  // Wall handling
  if (state.mode === "walls") {
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      return { ...state, direction, isGameOver: true };
    }
  } else {
    newHead = {
      x: ((newHead.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      y: ((newHead.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
    };
  }

  // Self collision
  if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    return { ...state, direction, isGameOver: true };
  }

  const ate = newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];
  if (!ate) newSnake.pop();

  const newScore = ate ? state.score + 1 : state.score;
  const shouldSpeedUp = ate && newScore % FOOD_PER_SPEED_UP === 0;

  return {
    ...state,
    snake: newSnake,
    food: ate ? spawnFood(newSnake) : state.food,
    direction,
    score: newScore,
    speed: shouldSpeedUp ? Math.max(state.speed - SPEED_INCREMENT, 50) : state.speed,
  };
}

// Simple AI for spectator mode
export function getAIDirection(state: GameState): Direction {
  const head = state.snake[0];
  const food = state.food;
  const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

  // Prefer moving toward food
  const preferred: Direction[] = [];
  if (food.x < head.x) preferred.push("LEFT");
  if (food.x > head.x) preferred.push("RIGHT");
  if (food.y < head.y) preferred.push("UP");
  if (food.y > head.y) preferred.push("DOWN");

  const safe = directions.filter((d) => {
    if (!isValidDirectionChange(state.direction, d)) return false;
    const delta: Record<Direction, Position> = {
      UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 },
    };
    const next = { x: head.x + delta[d].x, y: head.y + delta[d].y };
    if (state.mode === "walls" && (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE)) return false;
    const wrapped = {
      x: ((next.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      y: ((next.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
    };
    return !state.snake.some((s) => s.x === wrapped.x && s.y === wrapped.y);
  });

  const best = safe.filter((d) => preferred.includes(d));
  if (best.length > 0) return best[Math.floor(Math.random() * best.length)];
  if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
  return state.direction;
}
