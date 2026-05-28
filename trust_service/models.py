from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReactionInput(BaseModel):
    voter_id: str
    signal: Optional[str] = None
    reaction_text: Optional[str] = None
    voter_tier: str
    timestamp: datetime

class PostTrustRequest(BaseModel):
    post_id: str
    author_id: str
    category: str
    post_text: str
    reactions: List[ReactionInput]

class CommentTrustRequest(BaseModel):
    comment_id: str
    post_text: str
    comment_text: str
    reactions: List[ReactionInput]

class BreakdownItem(BaseModel):
    voter_id: str
    signal: str
    weight: float
    multiplier: float
    decay: float
    diversity_penalty: float
    relevancy: float
    confidence: float
    contribution: float

class TrustResponse(BaseModel):
    trust_score: float
    trust_label: str
    breakdown: List[BreakdownItem]

class DebugRequest(BaseModel):
    text: str

class DebugResponse(BaseModel):
    scores: dict

class ProcessReactionRequest(BaseModel):
    event_id: str
    author_id: str
    voter_id: str
    voter_tier: str
    category: str
    entity_type: str # 'post' or 'comment'
    post_text: str
    comment_text: Optional[str] = None
    reaction_text: str
    timestamp: datetime
