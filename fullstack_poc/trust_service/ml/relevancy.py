from sentence_transformers import SentenceTransformer, util

class RelevancyEngine:
    def __init__(self):
        # Bi-Encoder is vastly superior for Q&A (Problem vs Advice) matching than STS.
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def calculate(self, post_text: str, comment_text: str) -> float:
        emb1 = self.model.encode(post_text)
        emb2 = self.model.encode(comment_text)
        cos_sim = util.cos_sim(emb1, emb2)[0][0].item()
        
        # Scaling heuristic: Cosine similarity for complementary text (Problem -> Solution) 
        # often hovers around 0.3 - 0.5. We scale this to match the human intuition of 0.75 - 0.95
        # Formula: (cos_sim * 1.5) + 0.25, clamped to 1.0 max.
        scaled_score = max(0.0, min(1.0, (cos_sim * 1.5) + 0.25))
        return float(scaled_score)

relevancy_engine = RelevancyEngine()
