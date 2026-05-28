def get_diversity_penalty(voter_id: str, past_voter_ids: list[str]) -> float:
    count = past_voter_ids.count(voter_id)
    if count == 0: return 1.0
    if count == 1: return 0.5
    if count == 2: return 0.25
    return 0.0
