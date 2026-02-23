import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Helper function for generating unique test emails/users
import uuid

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_auth_signup_and_login():
    unique_user = f"test_{uuid.uuid4().hex[:8]}"
    email = f"{unique_user}@example.com"
    password = "securepassword123"
    
    # Test Signup
    signup_data = {
        "email": email,
        "password": password,
        "username": unique_user
    }
    response = client.post("/api/auth/signup", json=signup_data)
    assert response.status_code == 201
    
    user_data = response.json()
    assert user_data["email"] == email
    assert user_data["username"] == unique_user
    assert "token" in user_data
    
    # Test Login
    login_data = {"email": email, "password": password}
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    
    login_resp = response.json()
    assert login_resp["email"] == email
    assert "token" in login_resp
    
    # Store token for later tests
    return login_resp["token"]

def test_leaderboard():
    # Test getting leaderboard
    response = client.get("/api/leaderboard?mode=walls&timeFilter=all-time")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_submit_score_unauthorized():
    response = client.post("/api/leaderboard/submit", json={"score": 100, "mode": "walls"})
    assert response.status_code == 401

def test_submit_score_authorized():
    # First get a token
    token = test_auth_signup_and_login()
    
    headers = {"Authorization": f"Bearer {token}"}
    score_data = {"score": 999, "mode": "walls"}
    
    response = client.post("/api/leaderboard/submit", json=score_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["score"] == 999
    assert response.json()["mode"] == "walls"

def test_live_players():
    # Get live players
    response = client.get("/api/players/live")
    assert response.status_code == 200
    players = response.json()
    assert isinstance(players, list)
    
    if len(players) > 0:
        player_id = players[0]["id"]
        # Get individual player state
        state_response = client.get(f"/api/players/live/{player_id}")
        assert state_response.status_code == 200
        state = state_response.json()
        assert "snake" in state
        assert "food" in state
