import { describe, it, expect } from "vitest";
import {
  createInitialState,
  moveSnake,
  isValidDirectionChange,
  getAIDirection,
  GRID_SIZE,
  spawnFood,
} from "@/game/engine";
import type { GameState } from "@/types/game";

describe("Game Engine", () => {
  describe("createInitialState", () => {
    it("creates state with correct mode", () => {
      const state = createInitialState("walls");
      expect(state.mode).toBe("walls");
      expect(state.isGameOver).toBe(false);
      expect(state.snake.length).toBe(3);
      expect(state.score).toBe(0);
    });

    it("creates pass-through state", () => {
      const state = createInitialState("pass-through");
      expect(state.mode).toBe("pass-through");
    });
  });

  describe("moveSnake", () => {
    it("moves snake in current direction", () => {
      const state = createInitialState("walls");
      const head = state.snake[0];
      const next = moveSnake(state);
      expect(next.snake[0].x).toBe(head.x + 1);
      expect(next.snake[0].y).toBe(head.y);
    });

    it("does not move when paused", () => {
      const state = { ...createInitialState("walls"), isPaused: true };
      const next = moveSnake(state);
      expect(next.snake).toEqual(state.snake);
    });

    it("does not move when game over", () => {
      const state = { ...createInitialState("walls"), isGameOver: true };
      const next = moveSnake(state);
      expect(next.snake).toEqual(state.snake);
    });

    it("game over on wall collision in walls mode", () => {
      const state = createInitialState("walls");
      state.snake = [{ x: GRID_SIZE - 1, y: 0 }, { x: GRID_SIZE - 2, y: 0 }, { x: GRID_SIZE - 3, y: 0 }];
      state.direction = "RIGHT";
      const next = moveSnake(state);
      expect(next.isGameOver).toBe(true);
    });

    it("wraps around in pass-through mode", () => {
      const state = createInitialState("pass-through");
      state.snake = [{ x: GRID_SIZE - 1, y: 0 }, { x: GRID_SIZE - 2, y: 0 }, { x: GRID_SIZE - 3, y: 0 }];
      state.direction = "RIGHT";
      const next = moveSnake(state);
      expect(next.isGameOver).toBe(false);
      expect(next.snake[0].x).toBe(0);
    });

    it("game over on self collision", () => {
      const state = createInitialState("walls");
      state.snake = [
        { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 4 },
      ];
      state.direction = "UP";
      // Moving up from (5,5) won't cause collision, but moving LEFT into (4,5) would
      const s2 = moveSnake(state); // moves to (5,4) - but (5,4) is tail which moved
      // Let's set up a definite self-collision
      const state2 = createInitialState("walls");
      state2.snake = [
        { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 5 },
      ];
      state2.direction = "DOWN";
      // head at (5,5) moves DOWN to (5,6), no collision
      // need snake to loop back. Let me build explicitly:
      const state3 = createInitialState("walls");
      state3.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
      ];
      state3.direction = "RIGHT"; // head goes from (5,5) to (6,5) which is occupied
      const next3 = moveSnake(state3);
      expect(next3.isGameOver).toBe(true);
    });

    it("eats food and grows", () => {
      const state = createInitialState("walls");
      const head = state.snake[0];
      state.food = { x: head.x + 1, y: head.y };
      const prevLen = state.snake.length;
      const next = moveSnake(state);
      expect(next.snake.length).toBe(prevLen + 1);
      expect(next.score).toBe(1);
    });

    it("prevents reversing direction", () => {
      const state = createInitialState("walls");
      state.direction = "RIGHT";
      const next = moveSnake(state, "LEFT");
      expect(next.direction).toBe("RIGHT");
    });
  });

  describe("isValidDirectionChange", () => {
    it("allows perpendicular turns", () => {
      expect(isValidDirectionChange("RIGHT", "UP")).toBe(true);
      expect(isValidDirectionChange("RIGHT", "DOWN")).toBe(true);
    });

    it("prevents reversal", () => {
      expect(isValidDirectionChange("RIGHT", "LEFT")).toBe(false);
      expect(isValidDirectionChange("UP", "DOWN")).toBe(false);
    });
  });

  describe("spawnFood", () => {
    it("spawns food not on snake", () => {
      const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
      const food = spawnFood(snake);
      expect(snake.some((s) => s.x === food.x && s.y === food.y)).toBe(false);
    });
  });

  describe("getAIDirection", () => {
    it("returns a valid direction", () => {
      const state = createInitialState("walls");
      const dir = getAIDirection(state);
      expect(["UP", "DOWN", "LEFT", "RIGHT"]).toContain(dir);
    });

    it("does not reverse direction", () => {
      const state = createInitialState("walls");
      state.direction = "RIGHT";
      const dir = getAIDirection(state);
      expect(dir).not.toBe("LEFT");
    });
  });

  describe("speed increase", () => {
    it("increases speed every 5 food items", () => {
      const state = createInitialState("walls");
      state.score = 4;
      const head = state.snake[0];
      state.food = { x: head.x + 1, y: head.y };
      const next = moveSnake(state);
      expect(next.score).toBe(5);
      expect(next.speed).toBeLessThan(state.speed);
    });
  });
});
