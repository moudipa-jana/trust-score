from fastapi import APIRouter
from models import PostTrustRequest, CommentTrustRequest, TrustResponse, DebugRequest, DebugResponse, ProcessReactionRequest, ReactionInput
from calculator import Calculator
from ml.relevancy import relevancy_engine
from ml.classifier import classifier_engine
from graphql_client import insert_trust_ledger_and_update_score, get_current_trust_score

router = APIRouter()
calculator = Calculator()

@router.post("/calculate-post-trust", response_model=TrustResponse)
def calculate_post_trust(req: PostTrustRequest):
    return calculator.compute(req.reactions, is_comment=False)

@router.post("/calculate-comment-trust", response_model=TrustResponse)
def calculate_comment_trust(req: CommentTrustRequest):
    relevancy = relevancy_engine.calculate(req.post_text, req.comment_text)
    return calculator.compute(req.reactions, is_comment=True, relevancy=relevancy)

@router.post("/debug-classifier", response_model=DebugResponse)
def debug_classifier(req: DebugRequest):
    scores = classifier_engine.debug_classify(req.text)
    return DebugResponse(scores=scores)

@router.post("/process-reaction")
def process_reaction(req: ProcessReactionRequest):
    # Determine relevancy if it's a comment
    relevancy = 1.0
    is_comment = req.entity_type == "comment"
    if is_comment and req.comment_text:
        relevancy = relevancy_engine.calculate(req.post_text, req.comment_text)
        
    # Convert to standard reaction input for calculator
    reaction = ReactionInput(
        voter_id=req.voter_id,
        voter_tier=req.voter_tier,
        reaction_text=req.reaction_text,
        timestamp=req.timestamp
    )
    
    current_score = get_current_trust_score(req.author_id, req.category)
    response = calculator.compute([reaction], base_score=current_score, is_comment=is_comment, relevancy=relevancy)
    
    breakdown = response.breakdown[0]
    
    res = insert_trust_ledger_and_update_score(
        author_id=req.author_id,
        category=req.category,
        breakdown_item=breakdown.dict(),
        new_score=response.trust_score,
        new_label=response.trust_label
    )
    
    return {"status": "success", "contribution": breakdown.contribution, "hasura_response": res}

from pydantic import BaseModel
class ProcessCommentRequest(BaseModel):
    author_id: str
    category: str
    post_text: str
    post_description: str = ""
    post_type: str = "post"
    comment_text: str

@router.post("/process-comment")
def process_comment(req: ProcessCommentRequest):
    full_post_text = req.post_text + " " + req.post_description
    relevancy = relevancy_engine.calculate(full_post_text, req.comment_text)
    
    # We create a dummy reaction just to represent the comment itself passing through the classifier
    reaction = ReactionInput(
        voter_id=req.author_id, # Self
        voter_tier="New Voice",
        reaction_text=req.comment_text, # We use the comment text as the signal payload for the classifier!
        timestamp="2026-05-26T00:00:00Z"
    )
    
    current_score = get_current_trust_score(req.author_id, req.category)
    response = calculator.compute([reaction], base_score=current_score, is_comment=True, relevancy=relevancy, post_type=req.post_type)
    breakdown = response.breakdown[0]
    
    res = insert_trust_ledger_and_update_score(
        author_id=req.author_id,
        category=req.category,
        breakdown_item=breakdown.dict(),
        new_score=response.trust_score,
        new_label=response.trust_label
    )
    return {"status": "success", "relevancy": relevancy, "hasura_response": res}

from typing import List

class PostItem(BaseModel):
    post_id: str
    category: str
    post_text: str
    post_description: str = ""

class ProcessPostBatchRequest(BaseModel):
    posts: List[PostItem]

@router.post("/process-post-batch")
def process_post_batch(req: ProcessPostBatchRequest):
    results = []
    for p in req.posts:
        # Calculate how relevant the post text + description is to the category itself!
        full_text = p.post_text + " " + p.post_description
        relevancy = relevancy_engine.calculate(p.category, full_text)
        
        # New base score logic (Insight 3): Start at 50, add up to 10 points for relevancy
        base_score = 50.0 + (relevancy * 10.0)
        
        breakdown_item = {
            "voter_id": p.post_id,
            "signal": "POST_CREATED",
            "weight": 0,
            "multiplier": 1.0,
            "decay": 1.0,
            "diversity_penalty": 1.0,
            "relevancy": relevancy,
            "confidence": 1.0,
            "contribution": base_score
        }
        
        res = insert_trust_ledger_and_update_score(
            author_id=p.post_id,
            category=p.category,
            breakdown_item=breakdown_item,
            new_score=base_score,
            new_label="New Voice"
        )
        results.append({"post_id": p.post_id, "score": base_score})
        
    return {"status": "success", "processed": len(results), "scores": results}
