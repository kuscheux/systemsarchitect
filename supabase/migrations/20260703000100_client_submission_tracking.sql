alter table public.precon_opportunities
  add column if not exists submitter_user_id uuid references auth.users(id) on delete set null,
  add column if not exists public_status text not null default 'received',
  add column if not exists external_provider text not null default 'none',
  add column if not exists external_id text not null default '';

create index if not exists precon_opportunities_submitter_idx
  on public.precon_opportunities(submitter_user_id, created_at desc);
create index if not exists precon_opportunities_external_idx
  on public.precon_opportunities(external_provider, external_id)
  where external_id <> '';

create or replace function public.get_my_plan_submissions()
returns table (
  id uuid,
  created_at timestamptz,
  project_name text,
  project_location text,
  market text,
  engagement_type text,
  bid_due_date text,
  public_status text
)
language sql
stable
security definer set search_path = public
as $$
  select
    opportunity.id,
    opportunity.created_at,
    opportunity.project_name,
    opportunity.project_location,
    opportunity.market,
    opportunity.bid_type,
    opportunity.due_date,
    opportunity.public_status
  from public.precon_opportunities opportunity
  where opportunity.submitter_user_id = auth.uid()
  order by opportunity.created_at desc;
$$;

revoke all on function public.get_my_plan_submissions() from public, anon;
grant execute on function public.get_my_plan_submissions() to authenticated;
