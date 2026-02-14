import type { User, LeaderboardEntry, LivePlayer, GameState, GameMode, TimeFilter } from "@/types/game";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const USERS_KEY = "snake_users";
const CURRENT_USER_KEY = "snake_current_user";
const SCORES_KEY = "snake_scores";

function getStoredUsers(): Record<string, { email: string; password: string; username: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { email: string; password: string; username: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredScores(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) || "null") ?? generateMockLeaderboard();
  } catch {
    return generateMockLeaderboard();
  }
}

function saveScores(scores: LeaderboardEntry[]) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function generateMockLeaderboard(): LeaderboardEntry[] {
  const names = ["ViperKing", "NeonByte", "PixelHunter", "GhostRider", "CyberSnake", "DarkMamba", "BlitzCoder", "TurboScale", "ShadowFang", "LaserTail", "AcidByte", "NullPtr", "StackOverflow", "BitShifter", "HexMaster"];
  const modes: GameMode[] = ["walls", "pass-through"];
  const entries: LeaderboardEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const mode = modes[i % 2];
    const hoursAgo = Math.floor(Math.random() * 168);
    entries.push({
      id: `mock-${i}`,
      rank: 0,
      username: names[i % names.length],
      score: Math.floor(Math.random() * 200) + 10,
      mode,
      date: new Date(now - hoursAgo * 3600000).toISOString(),
      userId: `user-${i % names.length}`,
    });
  }

  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => (e.rank = i + 1));
  saveScores(entries);
  return entries;
}

// Auth
export async function login(email: string, password: string): Promise<User> {
  await delay(400);
  const users = getStoredUsers();
  const entry = Object.entries(users).find(([, u]) => u.email === email && u.password === password);
  if (!entry) throw new Error("Invalid email or password");
  const [id, u] = entry;
  const user: User = { id, email: u.email, username: u.username };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export async function signUp(email: string, password: string, username: string): Promise<User> {
  await delay(400);
  const users = getStoredUsers();
  if (Object.values(users).some((u) => u.email === email)) {
    throw new Error("Email already registered");
  }
  const id = `user-${Date.now()}`;
  users[id] = { email, password, username };
  saveUsers(users);
  const user: User = { id, email, username };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  await delay(100);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Leaderboard
export async function getLeaderboard(mode: GameMode, timeFilter: TimeFilter): Promise<LeaderboardEntry[]> {
  await delay(300);
  const scores = getStoredScores();
  const now = Date.now();
  let cutoff = 0;
  if (timeFilter === "daily") cutoff = now - 24 * 3600000;
  else if (timeFilter === "weekly") cutoff = now - 7 * 24 * 3600000;

  return scores
    .filter((s) => s.mode === mode && new Date(s.date).getTime() >= cutoff)
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry> {
  await delay(300);
  const user = getCurrentUser();
  if (!user) throw new Error("Must be logged in to submit score");
  const scores = getStoredScores();
  const entry: LeaderboardEntry = {
    id: `score-${Date.now()}`,
    rank: 0,
    username: user.username,
    score,
    mode,
    date: new Date().toISOString(),
    userId: user.id,
  };
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  scores.forEach((e, i) => (e.rank = i + 1));
  saveScores(scores);
  return entry;
}

// Live players
const mockLivePlayers: LivePlayer[] = [
  { id: "live-1", username: "ViperKing", score: 42, mode: "walls", startedAt: new Date(Date.now() - 120000).toISOString() },
  { id: "live-2", username: "NeonByte", score: 78, mode: "pass-through", startedAt: new Date(Date.now() - 300000).toISOString() },
  { id: "live-3", username: "CyberSnake", score: 15, mode: "walls", startedAt: new Date(Date.now() - 60000).toISOString() },
  { id: "live-4", username: "DarkMamba", score: 103, mode: "pass-through", startedAt: new Date(Date.now() - 450000).toISOString() },
  { id: "live-5", username: "GhostRider", score: 56, mode: "walls", startedAt: new Date(Date.now() - 200000).toISOString() },
];

export async function getLivePlayers(): Promise<LivePlayer[]> {
  await delay(300);
  return mockLivePlayers.map((p) => ({ ...p, score: p.score + Math.floor(Math.random() * 10) }));
}

export async function getPlayerGameState(playerId: string): Promise<GameState> {
  await delay(100);
  const player = mockLivePlayers.find((p) => p.id === playerId);
  const gridSize = 20;
  const snake = [
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2) - 1, y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) },
  ];
  return {
    snake,
    food: { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) },
    direction: "RIGHT",
    score: player?.score ?? 0,
    speed: 150,
    isGameOver: false,
    isPaused: false,
    gridSize,
    mode: player?.mode ?? "walls",
  };
}
