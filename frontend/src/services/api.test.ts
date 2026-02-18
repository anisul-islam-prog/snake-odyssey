import { describe, it, expect, beforeEach } from "vitest";
import * as api from "@/services/api";

describe("API Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("auth", () => {
    it("signs up a new user", async () => {
      const user = await api.signUp("test@test.com", "password123", "TestUser");
      expect(user.email).toBe("test@test.com");
      expect(user.username).toBe("TestUser");
      expect(user.id).toBeTruthy();
    });

    it("logs in existing user", async () => {
      await api.signUp("test@test.com", "password123", "TestUser");
      await api.logout();
      const user = await api.login("test@test.com", "password123");
      expect(user.email).toBe("test@test.com");
    });

    it("rejects invalid login", async () => {
      await expect(api.login("bad@test.com", "wrong")).rejects.toThrow("Invalid email or password");
    });

    it("rejects duplicate email signup", async () => {
      await api.signUp("test@test.com", "password123", "TestUser");
      await expect(api.signUp("test@test.com", "password456", "TestUser2")).rejects.toThrow("Email already registered");
    });

    it("logout clears current user", async () => {
      await api.signUp("test@test.com", "password123", "TestUser");
      expect(api.getCurrentUser()).not.toBeNull();
      await api.logout();
      expect(api.getCurrentUser()).toBeNull();
    });
  });

  describe("leaderboard", () => {
    it("returns leaderboard entries", async () => {
      const entries = await api.getLeaderboard("walls", "all-time");
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0]).toHaveProperty("rank");
      expect(entries[0]).toHaveProperty("username");
      expect(entries[0]).toHaveProperty("score");
    });

    it("filters by mode", async () => {
      const walls = await api.getLeaderboard("walls", "all-time");
      walls.forEach((e) => expect(e.mode).toBe("walls"));
    });

    it("submits score when logged in", async () => {
      await api.signUp("test@test.com", "password123", "TestUser");
      const entry = await api.submitScore(42, "walls");
      expect(entry.score).toBe(42);
      expect(entry.mode).toBe("walls");
      expect(entry.username).toBe("TestUser");
    });

    it("rejects score submission when not logged in", async () => {
      await expect(api.submitScore(42, "walls")).rejects.toThrow("Must be logged in");
    });
  });

  describe("live players", () => {
    it("returns live players array", async () => {
      const players = await api.getLivePlayers();
      expect(Array.isArray(players)).toBe(true);
      expect(players.length).toBeGreaterThan(0);
      expect(players[0]).toHaveProperty("username");
      expect(players[0]).toHaveProperty("mode");
    });

    it("returns game state for a player", async () => {
      const players = await api.getLivePlayers();
      const state = await api.getPlayerGameState(players[0].id);
      expect(state).toHaveProperty("snake");
      expect(state).toHaveProperty("food");
      expect(state).toHaveProperty("direction");
    });
  });
});
