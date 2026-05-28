import math
from datetime import datetime

def get_time_decay(timestamp: datetime, current_time: datetime) -> float:
    days = (current_time - timestamp).total_seconds() / 86400.0
    if days < 0: return 1.0
    # Exponential decay half life = 60 days
    # lambda = ln(2) / 60
    lam = math.log(2) / 60
    return math.exp(-lam * days)

def get_trust_label(score: float) -> str:
    if score >= 85.0: return "Legendary Voice"
    if score >= 65.0: return "Trusted"
    if score >= 55.0: return "Positive"
    if score >= 35.0: return "New Voice"
    if score >= 20.0: return "Warning"
    return "Toxic"

def get_multiplier(tier: str) -> float:
    t = tier.upper()
    if t == "NEW VOICE": return 1.0
    if t == "GROWING TRUST": return 1.2
    if t == "COMMUNITY TRUSTED": return 1.3
    if t == "HIGHLY TRUSTED": return 1.4
    if t == "ESTABLISHED VOICE": return 1.5
    return 1.0
