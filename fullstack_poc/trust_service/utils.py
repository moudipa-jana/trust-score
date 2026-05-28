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
    if score <= 20: return "New Voice"
    if score <= 40: return "Growing Trust"
    if score <= 65: return "Community Trusted"
    if score <= 85: return "Highly Trusted"
    return "Established Voice"

def get_multiplier(tier: str) -> float:
    t = tier.upper()
    if t == "NEW VOICE": return 1.0
    if t == "GROWING TRUST": return 1.2
    if t == "COMMUNITY TRUSTED": return 1.3
    if t == "HIGHLY TRUSTED": return 1.4
    if t == "ESTABLISHED VOICE": return 1.5
    return 1.0
