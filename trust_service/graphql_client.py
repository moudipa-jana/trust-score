import os
import httpx
from typing import Dict, Any

HASURA_URL = os.getenv("HASURA_URL", "http://localhost:8080/v1/graphql")
HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET", "myadminsecretkey")

def execute_graphql(query: str, variables: Dict[str, Any] = None):
    headers = {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET
    }
    
    payload = {
        "query": query,
        "variables": variables or {}
    }
    
    with httpx.Client() as client:
        response = client.post(HASURA_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

def insert_trust_ledger_and_update_score(author_id: str, category: str, breakdown_item: dict, new_score: float, new_label: str):
    mutation = """
    mutation UpdateTrustData(
        $author_id: uuid!,
        $category: String!,
        $score: float8!,
        $label: String!,
        $ledger: trust_ledger_insert_input!
    ) {
        insert_trust_scores_one(
            object: {
                author_id: $author_id,
                category: $category,
                trust_score: $score,
                trust_label: $label
            },
            on_conflict: {
                constraint: trust_scores_author_id_category_key,
                update_columns: [trust_score, trust_label, updated_at]
            }
        ) {
            id
        }
        
        insert_trust_ledger_one(object: $ledger) {
            id
        }
    }
    """
    
    variables = {
        "author_id": author_id,
        "category": category,
        "score": new_score,
        "label": new_label,
        "ledger": {
            "author_id": author_id,
            "voter_id": breakdown_item["voter_id"],
            "category": category,
            "signal": breakdown_item["signal"],
            "signal_weight": breakdown_item["weight"],
            "voter_multiplier": breakdown_item["multiplier"],
            "decay": breakdown_item["decay"],
            "diversity_penalty": breakdown_item["diversity_penalty"],
            "relevancy": breakdown_item["relevancy"],
            "confidence": breakdown_item["confidence"],
            "contribution": breakdown_item["contribution"]
        }
    }
    
    return execute_graphql(mutation, variables)

def get_current_trust_score(author_id: str, category: str) -> float:
    query = """
    query GetScore($author_id: uuid!, $category: String!) {
        trust_scores(where: {author_id: {_eq: $author_id}, category: {_eq: $category}}) {
            trust_score
        }
    }
    """
    variables = {
        "author_id": author_id,
        "category": category
    }
    res = execute_graphql(query, variables)
    scores = res.get("data", {}).get("trust_scores", [])
    if scores:
        return float(scores[0]["trust_score"])
    return 50.0
