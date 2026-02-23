from enum import Enum
from typing import List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class GameMode(str, Enum):
    walls = "walls"
    pass_through = "pass-through"


class TimeFilter(str, Enum):
    daily = "daily"
    weekly = "weekly"
    all_time = "all-time"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=3)


class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    username: str
    score: int
    mode: GameMode
    date: datetime
    userId: str


class SubmitScoreRequest(BaseModel):
    score: int
    mode: GameMode


class LivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    startedAt: datetime


class Coordinate(BaseModel):
    x: int
    y: int


class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"


class GameState(BaseModel):
    snake: List[Coordinate]
    food: Coordinate
    direction: Direction
    score: int
    speed: int
    isGameOver: bool
    isPaused: bool
    gridSize: int
    mode: GameMode
