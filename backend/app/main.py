from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import uuid

from app.api.routers import auth, leaderboard, players
from app.db.mock_db import mock_live_players, scores_db
from app.models.schemas import LivePlayer, GameMode, LeaderboardEntry

# Pre-populate mock data
def init_mock_data():
    if not mock_live_players:
        now = datetime.now(timezone.utc)
        mock_live_players.extend([
            LivePlayer(id="live-1", username="ViperKing", score=42, mode=GameMode.walls, startedAt=now),
            LivePlayer(id="live-2", username="NeonByte", score=78, mode=GameMode.pass_through, startedAt=now),
        ])
        
    if not scores_db:
        # Just top 2 for demonstration
        scores_db.extend([
            LeaderboardEntry(id=str(uuid.uuid4()), rank=1, username="DevMaster", score=500, mode=GameMode.walls, date=datetime.now(timezone.utc), userId="u1"),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=2, username="SnakePro", score=450, mode=GameMode.walls, date=datetime.now(timezone.utc), userId="u2"),
        ])

init_mock_data()

app = FastAPI(
    title="Snake Odyssey API",
    description="API specification for the Snake Odyssey multiplayer game.",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend URL!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(players.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Snake Odyssey API. Check out /docs for the API specification."}
