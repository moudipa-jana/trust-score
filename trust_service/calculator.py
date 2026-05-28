from constants import SIGNAL_WEIGHTS
from utils import get_time_decay, get_multiplier, get_trust_label
from services.diversity_service import get_diversity_penalty
from models import TrustResponse, BreakdownItem
from ml.classifier import classifier_engine
from datetime import datetime, timezone

class Calculator:
    def compute(self, reactions, base_score=50.0, is_comment=False, relevancy=1.0, post_type=None):
        total = base_score
        breakdown = []
        past_voters = []
        current_time = datetime.now(timezone.utc).replace(tzinfo=None)
        
        # Sort reactions by time to properly apply diversity penalty in order
        sorted_reactions = sorted(reactions, key=lambda x: x.timestamp.replace(tzinfo=None))
        
        for r in sorted_reactions:
            signal = r.signal
            confidence = 1.0
            
            # If signal not explicitly provided but text is, infer it via ML
            if not signal and r.reaction_text:
                signal, confidence = classifier_engine.classify(r.reaction_text)
            elif not signal:
                signal = "NEUTRAL"
            
            signal = signal.upper()
            weight = SIGNAL_WEIGHTS.get(signal, 0)
            
            # Confidence threshold safety net (if inferred or overriden)
            if confidence < 0.60:
                signal = "NEUTRAL"
                weight = 0
            
            multiplier = get_multiplier(r.voter_tier)
            decay = get_time_decay(r.timestamp.replace(tzinfo=None), current_time)
            diversity = get_diversity_penalty(r.voter_id, past_voters)
            
            rel = relevancy if is_comment else 1.0
            conf = confidence if is_comment else 1.0
            
            # For negative signals, we don't want low relevancy to squash the penalty! 
            # In fact, toxic and off-topic is worse. 
            rel_multiplier = rel if weight >= 0 else 1.0
            
            # The Production Formula
            contribution = weight * multiplier * decay * diversity * rel_multiplier * conf
            
            # INSIGHT #1: If post_type is question, prioritize text comments heavily
            if post_type == "question" and is_comment:
                contribution *= 1.5
                
            total += contribution
            
            breakdown.append(BreakdownItem(
                voter_id=r.voter_id,
                weight=weight,
                multiplier=multiplier,
                decay=round(decay, 4),
                diversity_penalty=diversity,
                relevancy=round(rel, 4),
                confidence=round(conf, 4),
                contribution=round(contribution, 4),
                signal=signal
            ))
            
            past_voters.append(r.voter_id)
            
        clamped = max(0.0, min(100.0, total))
        return TrustResponse(
            trust_score=round(clamped, 2),
            trust_label=get_trust_label(clamped),
            breakdown=breakdown
        )
