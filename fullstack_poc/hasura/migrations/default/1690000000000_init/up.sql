CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    category TEXT NOT NULL,
    trust_score FLOAT NOT NULL DEFAULT 0,
    trust_label TEXT NOT NULL DEFAULT 'New Voice',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(author_id, category)
);

CREATE TABLE trust_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    voter_id UUID NOT NULL,
    post_id UUID,
    comment_id UUID,
    category TEXT NOT NULL,
    signal TEXT NOT NULL,
    signal_weight FLOAT NOT NULL,
    voter_multiplier FLOAT NOT NULL,
    decay FLOAT NOT NULL,
    diversity_penalty FLOAT NOT NULL,
    relevancy FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    contribution FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE trust_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE trust_reaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID NOT NULL,
    author_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    signal TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
