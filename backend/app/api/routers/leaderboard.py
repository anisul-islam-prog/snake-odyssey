from fastapi import APIRouter, Depends, Query, status
from typing import List
from datetime import datetime, timezone, timedelta
import uuid

from app.models.schemas import LeaderboardEntry, GameMode, TimeFilter, SubmitScoreRequest
from app.db.mock_db import scores_db
from app.api.deps import get_current_user_id, get_current_user_name

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

def get_time_cutoff(filter_type: TimeFilter) -> datetime:
    now = datetime.now(timezone.utc)
    if filter_type == TimeFilter.daily:
        return now - timedelta(days=1)
    elif filter_type == TimeFilter.weekly:
        return now - timedelta(days=7)
    return datetime.min.replace(tzinfo=timezone.utc) # all-time

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    mode: GameMode = Query(...),
    timeFilter: TimeFilter = Query(...)
):
    cutoff = get_time_cutoff(timeFilter)
    
    # Filter by mode and time
    filtered_scores = [
        score for score in scores_db
        if score.mode == mode and score.date.replace(tzinfo=timezone.utc) >= cutoff
    ]
    
    # Sort by score descending
    filtered_scores.sort(key=lambda s: s.score, reverse=True)
    
    # Re-assign ranks for the current view
    for index, entry in enumerate(filtered_scores):
        entry.rank = index + 1
        
    return filtered_scores

@router.post("/submit", response_model=LeaderboardEntry, status_code=status.HTTP_201_CREATED)
def submit_score(
    req: SubmitScoreRequest,
    user_id: str = Depends(get_current_user_id),
    username: str = Depends(get_current_user_name)
):
    score_id = str(uuid.uuid4())
    entry = LeaderboardEntry(
        id=score_id,
        rank=0,  # Will be calculated on retrieval
        username=username,
        score=req.score,
        mode=req.mode,
        date=datetime.now(timezone.utc),
        userId=user_id
    )
    
    scores_db.append(entry)
    
    # Optional: maintain global ranks in db
    scores_db.sort(key=lambda s: s.score, reverse=True)
    for index, e in enumerate(scores_db):
        e.rank = index + 1
        
    return entry
