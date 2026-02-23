from typing import Dict, List
from app.models.schemas import LeaderboardEntry, LivePlayer

# In-memory mock database
# Maps user ID to User data (dict with email, username, password)
users_db: Dict[str, dict] = {}

# List of all leaderboard entries
scores_db: List[LeaderboardEntry] = []

# Mock live players
mock_live_players: List[LivePlayer] = []
