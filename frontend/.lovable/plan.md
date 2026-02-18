

# 🐍 Snake Game — Dark Gaming Edition

## Overview
A fully interactive Snake game with two game modes, mock authentication, leaderboards, and live spectating — all with a dark gaming aesthetic. No real backend; all API calls are centralized in a mock service layer, ready for future backend integration. Full test coverage included.

---

## Pages & Navigation

### 1. **Landing / Home Page**
- Dark themed hero with glowing snake animation
- "Play Now", "Leaderboard", and "Watch Live" CTAs
- Top nav bar with Login/Sign Up buttons (or username + avatar when logged in)

### 2. **Auth Pages (Login / Sign Up)**
- Modal-based login and sign up forms with email & password
- Mock authentication — stores user in memory/localStorage
- After login, nav bar shows username and a logout option
- Form validation with proper error states

### 3. **Game Page**
- Game mode selector: **Walls** (game over on wall hit) vs **Pass-Through** (snake wraps around edges)
- Responsive canvas-based Snake game with keyboard controls
- Score counter, speed indicator, pause/resume
- Game over screen with final score and option to submit to leaderboard
- Dark theme with glowing snake and neon food items

### 4. **Leaderboard Page**
- Two tabs: one for each game mode (Walls / Pass-Through)
- Time filters: Daily, Weekly, All-Time
- Table showing rank, username, score, date
- Highlight current user's entries
- Pre-populated with mock data

### 5. **Watch Live Page**
- List of "currently playing" users (mock data)
- Click a player to spectate — shows an automated snake game playing with AI logic (random/simple pathfinding)
- Spectator view shows player name, current score, and game mode
- "Back to lobby" button to return to player list

---

## Architecture & Mock Backend

### Centralized API Service (`src/services/api.ts`)
All backend interactions go through a single service module with functions like:
- `login(email, password)` / `signUp(email, password)` / `logout()`
- `getCurrentUser()`
- `submitScore(score, mode)`
- `getLeaderboard(mode, timeFilter)`
- `getLivePlayers()`
- `getPlayerGameState(playerId)`

All return mock data with realistic delays. Swapping to a real backend later means only changing this one file.

---

## Testing
- **Unit tests** for game logic (snake movement, collision detection, wrapping, food spawning, scoring)
- **Component tests** for auth forms, leaderboard rendering, navigation state
- **Integration tests** for game flow (start → play → game over → score submission)
- **Mock service tests** to verify the API layer returns expected shapes

All tests written with Vitest + React Testing Library.

---

## Game Modes Detail
| Feature | Walls Mode | Pass-Through Mode |
|---|---|---|
| Wall collision | Game over | Snake wraps to opposite side |
| Self collision | Game over | Game over |
| Speed increase | Every 5 food items | Every 5 food items |

