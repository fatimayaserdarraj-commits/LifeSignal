-- LifeSignal: incident history table backing the Risk Mapping Agent.
-- Apply with the Supabase SQL editor or `supabase db push`.

create extension if not exists vector;

create table if not exists incident_history (
    id text primary key,
    label text not null,
    latitude double precision not null,
    longitude double precision not null,
    peak_occupant_count integer not null default 0,
    avg_congestion double precision not null default 0,
    qos_boost_used boolean not null default false,
    created_at timestamptz not null default now(),
    recorded_at timestamptz not null default now(),
    -- Semantic search over incident narratives (label + reasoning-trace
    -- summary), populated via Gemini text-embedding-001 at 384 dims -- lets
    -- the commander/Risk Mapping Agent find similar past incidents.
    embedding vector(384)
);

create index if not exists incident_history_location_idx
    on incident_history (latitude, longitude);

create index if not exists incident_history_embedding_idx
    on incident_history using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- Nearest-neighbour lookup used by app.db.supabase_client.find_similar_incidents.
create or replace function match_incident_history(
    query_embedding vector(384),
    match_count int default 5
)
returns table (
    id text,
    label text,
    latitude double precision,
    longitude double precision,
    peak_occupant_count integer,
    avg_congestion double precision,
    qos_boost_used boolean,
    created_at timestamptz,
    similarity double precision
)
language sql stable
as $$
    select
        id, label, latitude, longitude, peak_occupant_count,
        avg_congestion, qos_boost_used, created_at,
        1 - (embedding <=> query_embedding) as similarity
    from incident_history
    where embedding is not null
    order by embedding <=> query_embedding
    limit match_count;
$$;

-- Audit & Compliance Module: every CAMARA API call, LLM estimate, and
-- QoS/alert decision, logged independently of the UX-facing reasoning trace.
create table if not exists audit_log (
    id text primary key,
    incident_id text,
    event_type text not null,
    detail jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists audit_log_incident_idx on audit_log (incident_id);
create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
