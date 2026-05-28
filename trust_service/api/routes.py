from fastapi import APIRouter
from models import PostTrustRequest, CommentTrustRequest, TrustResponse, DebugRequest, DebugResponse, ProcessReactionRequest, ReactionInput
from calculator import Calculator
from ml.relevancy import relevancy_engine
from ml.classifier import classifier_engine
from graphql_client import insert_trust_ledger_and_update_score, get_current_trust_score
from utils import get_trust_label

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
    if req.author_id == req.voter_id:
        return {"status": "ignored", "message": "Self-reactions do not affect trust scores"}
        
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
    commenter_id: str
    category: str
    post_text: str
    post_description: str = ""
    post_type: str = "post"
    comment_text: str

@router.post("/process-comment")
def process_comment(req: ProcessCommentRequest):
    if req.author_id == req.commenter_id:
        return {"status": "ignored", "message": "Self-comments do not affect trust scores"}
        
    full_post_text = req.post_text + " " + req.post_description
    relevancy = relevancy_engine.calculate(full_post_text, req.comment_text)
    
    # We create a dummy reaction just to represent the comment itself passing through the classifier
    reaction = ReactionInput(
        voter_id=req.commenter_id, # The person writing the comment
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
    author_id: str
    category: str
    post_text: str
    post_description: str = ""

class ProcessPostBatchRequest(BaseModel):
    posts: List[PostItem]

@router.post("/process-post-batch")
def process_post_batch(req: ProcessPostBatchRequest):
    results = []
    for p in req.posts:
        full_text = p.post_text + " " + p.post_description
        relevancy = relevancy_engine.calculate(p.category, full_text)
        
        current_score = get_current_trust_score(p.author_id, p.category)
        
        if current_score == 50.0:
             contribution = relevancy * 10.0
             new_score = 50.0 + contribution
        else:
             contribution = relevancy * 5.0
             new_score = current_score + contribution
             
        new_score = max(0.0, min(100.0, new_score))
        
        breakdown_item = {
            "voter_id": p.post_id,
            "signal": "POST_CREATED",
            "weight": 5,
            "multiplier": 1.0,
            "decay": 1.0,
            "diversity_penalty": 1.0,
            "relevancy": relevancy,
            "confidence": 1.0,
            "contribution": contribution
        }
        
        res = insert_trust_ledger_and_update_score(
            author_id=p.author_id,
            category=p.category,
            breakdown_item=breakdown_item,
            new_score=new_score,
            new_label=get_trust_label(new_score)
        )
        results.append({"post_id": p.post_id, "score": new_score})
        
    return {"status": "success", "processed": len(results), "scores": results}
