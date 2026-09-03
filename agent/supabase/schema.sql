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
    -- Reserved for future semantic search over incident narratives
    -- (e.g. reasoning-trace summaries) using pgvector.
    embedding vector(384)
);

create index if not exists incident_history_location_idx
    on incident_history (latitude, longitude);
