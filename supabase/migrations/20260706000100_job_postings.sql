-- Careers CMS and privacy-conscious job-post view analytics.

create extension if not exists pgcrypto;

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text not null,
  employment_type text not null default 'Full-time',
  location text not null,
  workplace_type text not null default 'On-site',
  summary text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  qualifications text[] not null default '{}',
  compensation text not null default '',
  application_email text not null default '',
  application_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  published_at timestamptz,
  closes_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_posting_views (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings(id) on delete cascade,
  visitor_id uuid not null,
  viewed_on date not null default current_date,
  referrer text not null default '',
  created_at timestamptz not null default now(),
  unique (job_id, visitor_id, viewed_on)
);

create index if not exists job_postings_status_published_idx
  on public.job_postings(status, published_at desc);
create index if not exists job_posting_views_job_created_idx
  on public.job_posting_views(job_id, created_at desc);

drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at before update on public.job_postings
for each row execute function public.set_updated_at();

alter table public.job_postings enable row level security;
alter table public.job_posting_views enable row level security;

drop policy if exists job_postings_portal_read on public.job_postings;
create policy job_postings_portal_read on public.job_postings for select to authenticated
using (public.has_portal_role(array['admin','executive','marketing']));

drop policy if exists job_postings_portal_write on public.job_postings;
create policy job_postings_portal_write on public.job_postings for all to authenticated
using (public.has_portal_role(array['admin','marketing']))
with check (public.has_portal_role(array['admin','marketing']));

drop policy if exists job_views_portal_read on public.job_posting_views;
create policy job_views_portal_read on public.job_posting_views for select to authenticated
using (public.has_portal_role(array['admin','executive','marketing']));

revoke all on public.job_postings, public.job_posting_views from anon;
revoke all on public.job_postings, public.job_posting_views from authenticated;
grant select, insert, update, delete on public.job_postings to authenticated;
grant select on public.job_posting_views to authenticated;

create or replace function public.get_job_posting_metrics()
returns table (
  id uuid,
  slug text,
  title text,
  department text,
  employment_type text,
  location text,
  workplace_type text,
  summary text,
  description text,
  responsibilities text[],
  qualifications text[],
  compensation text,
  application_email text,
  application_url text,
  status text,
  published_at timestamptz,
  closes_at timestamptz,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  views bigint,
  unique_visitors bigint
)
language sql
stable
security definer set search_path = public
as $$
  select
    j.id, j.slug, j.title, j.department, j.employment_type, j.location,
    j.workplace_type, j.summary, j.description, j.responsibilities,
    j.qualifications, j.compensation, j.application_email, j.application_url,
    j.status, j.published_at, j.closes_at, j.created_by, j.created_at, j.updated_at,
    count(v.id) as views,
    count(distinct v.visitor_id) as unique_visitors
  from public.job_postings j
  left join public.job_posting_views v on v.job_id = j.id
  where auth.role() = 'service_role'
    or public.has_portal_role(array['admin','executive','marketing'])
  group by j.id
  order by j.updated_at desc;
$$;

revoke all on function public.get_job_posting_metrics() from public, anon;
grant execute on function public.get_job_posting_metrics() to authenticated;
