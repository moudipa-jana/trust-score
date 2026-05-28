SET check_function_bodies = false;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
CREATE TABLE public.trust_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    event_type text NOT NULL,
    processed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.trust_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    voter_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    category text NOT NULL,
    signal text NOT NULL,
    signal_weight double precision NOT NULL,
    voter_multiplier double precision NOT NULL,
    decay double precision NOT NULL,
    diversity_penalty double precision NOT NULL,
    relevancy double precision NOT NULL,
    confidence double precision NOT NULL,
    contribution double precision NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.trust_reaction_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    voter_id uuid NOT NULL,
    author_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    signal text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.trust_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    category text NOT NULL,
    trust_score double precision DEFAULT 0 NOT NULL,
    trust_label text DEFAULT 'New Voice'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
ALTER TABLE ONLY public.trust_events
    ADD CONSTRAINT trust_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trust_ledger
    ADD CONSTRAINT trust_ledger_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trust_reaction_history
    ADD CONSTRAINT trust_reaction_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.trust_scores
    ADD CONSTRAINT trust_scores_author_id_category_key UNIQUE (author_id, category);
ALTER TABLE ONLY public.trust_scores
    ADD CONSTRAINT trust_scores_pkey PRIMARY KEY (id);
