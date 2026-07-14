create table if not exists public.session_telemetry_sessions (
  id uuid primary key,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  status text not null check (status in ('active', 'ended')),
  first_path text,
  last_path text,
  referrer text,
  user_agent text,
  viewport_width integer,
  viewport_height integer,
  device_pixel_ratio numeric,
  timezone text,
  locale text,
  event_count integer not null default 0,
  click_count integer not null default 0,
  max_scroll_depth integer not null default 0
);

create table if not exists public.session_telemetry_events (
  id uuid primary key,
  session_id uuid not null references public.session_telemetry_sessions(id) on delete cascade,
  created_at timestamptz not null,
  type text not null check (type in ('mousemove', 'click', 'scroll', 'route', 'visibility', 'heartbeat')),
  path text,
  elapsed_ms integer not null,
  x integer,
  y integer,
  scroll_x integer not null default 0,
  scroll_y integer not null default 0,
  viewport_width integer not null default 0,
  viewport_height integer not null default 0,
  target text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists session_telemetry_sessions_updated_at_idx
  on public.session_telemetry_sessions(updated_at desc);

create index if not exists session_telemetry_events_session_elapsed_idx
  on public.session_telemetry_events(session_id, elapsed_ms asc);

alter table public.session_telemetry_sessions enable row level security;
alter table public.session_telemetry_events enable row level security;
