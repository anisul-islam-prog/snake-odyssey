from typing import Dict, List
from datetime import datetime, timezone
import uuid

from app.models.schemas import LeaderboardEntry, LivePlayer

# In-memory mock database
# Maps user ID to User data (dict with email, username, password)
users_db: Dict[str, dict] = {}

# List of all leaderboard entries
scores_db: List[LeaderboardEntry] = []

# Mock live players
mock_live_players: List[LivePlayer] = []


# Seed data for local development and tests
def _seed():
	# Create two users
	u1 = uuid.uuid4().hex
	u2 = uuid.uuid4().hex
	users_db[u1] = {"email": "alice@example.com", "username": "alice", "password": "password123"}
	users_db[u2] = {"email": "bob@example.com", "username": "bob", "password": "password123"}

	# Add leaderboard entries
	now = datetime.now(timezone.utc)
	scores_db.clear()
	scores_db.extend([
		LeaderboardEntry(
			id=uuid.uuid4().hex,
			rank=1,
			username="alice",
			score=1500,
			mode="walls",
			date=now,
			userId=u1,
		),
		LeaderboardEntry(
			id=uuid.uuid4().hex,
			rank=2,
			username="bob",
			score=1200,
			mode="walls",
			date=now,
			userId=u2,
		),
	])

	# Live players
	mock_live_players.clear()
	mock_live_players.extend([
		LivePlayer(id=uuid.uuid4().hex, username="alice", score=1500, mode="walls", startedAt=now),
		LivePlayer(id=uuid.uuid4().hex, username="bob", score=800, mode="pass-through", startedAt=now),
	])


# Run seed on import so local dev & tests have predictable data
_seed()
