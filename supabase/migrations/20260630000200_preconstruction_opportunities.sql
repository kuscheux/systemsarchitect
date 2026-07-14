create table if not exists public.precon_opportunities (
  id uuid primary key,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  status text not null check (status in ('new', 'reviewed', 'assigned', 'declined', 'follow-up')),
  source text,
  client text not null,
  project_name text not null,
  project_location text,
  market text,
  bid_type text,
  due_date text,
  estimated_value text,
  relationship_owner text,
  relationship_context text,
  bd_touchpoint text,
  estimator text,
  priority text,
  notes text,
  review_reason text,
  next_steps text
);

alter table public.precon_opportunities enable row level security;
