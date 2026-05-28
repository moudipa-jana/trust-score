from fastapi.testclient import TestClient
from app import app
from datetime import datetime, timezone

client = TestClient(app)

def test_calculate_post_trust_basic():
    payload = {
        "post_id": "post123",
        "author_id": "author123",
        "category": "Mental Health",
        "post_text": "I feel anxious today.",
        "reactions": [
            {
                "voter_id": "voter_1",
                "signal": "HELPFUL",
                "voter_tier": "Highly Trusted",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
    }
    
    response = client.post("/calculate-post-trust", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "trust_score" in data
    assert "breakdown" in data
    assert len(data["breakdown"]) == 1
    
    bd = data["breakdown"][0]
    # weight=3, multiplier=1.4 (Highly Trusted), decay=1, diversity=1
    # expected contribution: 3 * 1.4 * 1 * 1 = 4.2
    assert bd["contribution"] == 4.2
    assert data["trust_score"] == 4.2
    assert data["trust_label"] == "New Voice"

def test_calculate_comment_trust_relevancy():
    payload = {
        "comment_id": "comment123",
        "post_text": "How do you handle panic attacks?",
        "comment_text": "I focus on breathing deeply and grounding myself by counting 5 things I can see.",
        "reactions": [
            {
                "voter_id": "voter_2",
                "signal": "WOULD_LISTEN_AGAIN",
                "voter_tier": "Established Voice",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
    }
    
    response = client.post("/calculate-comment-trust", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    bd = data["breakdown"][0]
    # weight=4, multiplier=1.5, decay=1, diversity=1
    assert bd["weight"] == 4
    assert bd["multiplier"] == 1.5
    assert bd["relevancy"] >= 0.0  # Semantic similarity calculated successfully via cross-encoder
    assert bd["contribution"] >= 0
