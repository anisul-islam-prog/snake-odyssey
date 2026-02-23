from fastapi import APIRouter, HTTPException, Path
from typing import List

from app.models.schemas import LivePlayer, GameState
from app.db.mock_db import mock_live_players
import random

router = APIRouter(prefix="/players", tags=["players"])

@router.get("/live", response_model=List[LivePlayer])
def get_live_players():
    # In a real app, this would query active websocket connections or a Redis store
    # For now, just return the mock data with slight score increments to simulate live data
    for p in mock_live_players:
        if random.random() > 0.5:
            p.score += random.randint(1, 5)
    return mock_live_players

@router.get("/live/{playerId}", response_model=GameState)
def get_player_game_state(playerId: str = Path(...)):
    # Find the player to determine their mode/score
    player = next((p for p in mock_live_players if p.id == playerId), None)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found in live sessions")
        
    grid_size = 20
    # Generate mock game state
    return GameState(
        snake=[
            {"x": grid_size // 2, "y": grid_size // 2},
            {"x": (grid_size // 2) - 1, "y": grid_size // 2},
            {"x": (grid_size // 2) - 2, "y": grid_size // 2},
        ],
        food={"x": random.randint(0, grid_size - 1), "y": random.randint(0, grid_size - 1)},
        direction="RIGHT",
        score=player.score,
        speed=150,
        isGameOver=False,
        isPaused=False,
        gridSize=grid_size,
        mode=player.mode
    )
