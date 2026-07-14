-- 1CG operational workflow portal
-- Run in the Supabase SQL editor. This migration is idempotent.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'executive', 'estimating', 'project_manager', 'operations', 'marketing', 'viewer')),
  department text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  client_name text not null default '',
  location text not null default '',
  market text not null default '',
  project_type text not null default '',
  status text not null default 'active',
  internal_description text not null default '',
  public_description text not null default '',
  public_visibility_status text not null default 'draft' check (public_visibility_status in ('draft', 'pending', 'published', 'archived')),
  claimed_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fab_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  request_type text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  needed_by date,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'assigned', 'in_progress', 'blocked', 'ready', 'complete', 'cancelled')),
  title text not null,
  description text not null default '',
  drawing_links text[] not null default '{}',
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fab_requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.request_activity_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fab_requests(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  asset_type text not null default 'image',
  storage_path text not null,
  title text not null default '',
  description text not null default '',
  is_public_candidate boolean not null default false,
  approved_for_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('project', 'asset')),
  entity_id uuid not null,
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists projects_status_idx on public.projects(status, updated_at desc);
create index if not exists projects_public_idx on public.projects(public_visibility_status, updated_at desc);
create index if not exists fab_requests_project_idx on public.fab_requests(project_id, updated_at desc);
create index if not exists fab_requests_assignment_idx on public.fab_requests(assigned_to, status, needed_by);
create index if not exists approval_queue_status_idx on public.approval_queue(status, created_at);
create unique index if not exists approval_queue_one_pending_idx
  on public.approval_queue(entity_type, entity_id) where status = 'pending';
create index if not exists project_assets_project_idx on public.project_assets(project_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
drop trigger if exists fab_requests_set_updated_at on public.fab_requests;
create trigger fab_requests_set_updated_at before update on public.fab_requests
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (user_id, full_name, email)
select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''), coalesce(email, '')
from auth.users
on conflict (user_id) do nothing;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid() limit 1), 'viewer');
$$;

create or replace function public.has_portal_role(allowed text[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.current_user_role() = any(allowed);
$$;

create or replace function public.guard_project_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.current_user_role() in ('marketing', 'executive') and (
    new.name is distinct from old.name
    or new.slug is distinct from old.slug
    or new.client_name is distinct from old.client_name
    or new.location is distinct from old.location
    or new.market is distinct from old.market
    or new.project_type is distinct from old.project_type
    or new.status is distinct from old.status
    or new.internal_description is distinct from old.internal_description
    or new.claimed_by is distinct from old.claimed_by
    or new.created_by is distinct from old.created_by
  ) then
    raise exception 'This role can edit publishing fields only';
  end if;
  if public.current_user_role() = 'project_manager'
    and old.claimed_by is null
    and old.created_by is distinct from public.current_profile_id()
    and (
      new.claimed_by is distinct from public.current_profile_id()
      or new.name is distinct from old.name
      or new.slug is distinct from old.slug
      or new.client_name is distinct from old.client_name
      or new.location is distinct from old.location
      or new.market is distinct from old.market
      or new.project_type is distinct from old.project_type
      or new.status is distinct from old.status
      or new.internal_description is distinct from old.internal_description
      or new.public_description is distinct from old.public_description
      or new.public_visibility_status is distinct from old.public_visibility_status
      or new.created_by is distinct from old.created_by
      or new.approved_by is distinct from old.approved_by
    ) then
    raise exception 'Claim the project before editing it';
  end if;
  return new;
end;
$$;

drop trigger if exists projects_guard_update on public.projects;
create trigger projects_guard_update before update on public.projects
for each row execute function public.guard_project_update();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.fab_requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_activity_log enable row level security;
alter table public.project_assets enable row level security;
alter table public.approval_queue enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using (user_id = auth.uid() or public.has_portal_role(array['admin','executive','estimating','project_manager','operations','marketing']));
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));

drop policy if exists projects_internal_read on public.projects;
create policy projects_internal_read on public.projects for select to authenticated using (true);
drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists projects_create on public.projects;
create policy projects_create on public.projects for insert to authenticated
with check (public.has_portal_role(array['admin','project_manager']) and created_by = public.current_profile_id());
-- The policy helper below keeps update checks readable and prevents clients from
-- assigning ownership outside the same authorized row.
create or replace function public.same_as_owner_or_privileged(candidate public.projects)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.has_portal_role(array['admin','executive','marketing'])
    or (public.has_portal_role(array['project_manager']) and (candidate.claimed_by = public.current_profile_id() or candidate.created_by = public.current_profile_id()))
    or false;
$$;

drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update to authenticated
using (
  public.has_portal_role(array['admin','executive','marketing'])
  or (public.has_portal_role(array['project_manager']) and (claimed_by = public.current_profile_id() or created_by = public.current_profile_id()))
)
with check (public.same_as_owner_or_privileged(projects));
drop policy if exists projects_claim on public.projects;
create policy projects_claim on public.projects for update to authenticated
using (public.has_portal_role(array['project_manager']) and claimed_by is null)
with check (public.has_portal_role(array['project_manager']) and claimed_by = public.current_profile_id());

drop policy if exists fab_read on public.fab_requests;
create policy fab_read on public.fab_requests for select to authenticated using (
  public.has_portal_role(array['admin','executive','estimating'])
  or requested_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
  or (
    public.has_portal_role(array['project_manager'])
    and exists (
      select 1 from public.projects p
      where p.id = fab_requests.project_id
        and (p.claimed_by = public.current_profile_id() or p.created_by = public.current_profile_id())
    )
  )
);
drop policy if exists fab_admin_all on public.fab_requests;
create policy fab_admin_all on public.fab_requests for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists fab_create on public.fab_requests;
create policy fab_create on public.fab_requests for insert to authenticated
with check (public.has_portal_role(array['admin','estimating','project_manager','operations']) and requested_by = public.current_profile_id());
drop policy if exists fab_update on public.fab_requests;
create policy fab_update on public.fab_requests for update to authenticated
using (
  public.has_portal_role(array['admin','executive','estimating'])
  or requested_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
) with check (
  public.has_portal_role(array['admin','executive','estimating'])
  or requested_by = public.current_profile_id()
  or assigned_to = public.current_profile_id()
);

drop policy if exists comments_read on public.request_comments;
create policy comments_read on public.request_comments for select to authenticated
using (exists (select 1 from public.fab_requests request where request.id = request_comments.request_id));
drop policy if exists comments_admin_all on public.request_comments;
create policy comments_admin_all on public.request_comments for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists comments_create on public.request_comments;
create policy comments_create on public.request_comments for insert to authenticated
with check (
  author_id = public.current_profile_id()
  and exists (select 1 from public.fab_requests request where request.id = request_comments.request_id)
);
drop policy if exists activity_read on public.request_activity_log;
create policy activity_read on public.request_activity_log for select to authenticated
using (exists (select 1 from public.fab_requests request where request.id = request_activity_log.request_id));
drop policy if exists activity_admin_all on public.request_activity_log;
create policy activity_admin_all on public.request_activity_log for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists activity_create on public.request_activity_log;
create policy activity_create on public.request_activity_log for insert to authenticated
with check (
  actor_id = public.current_profile_id()
  and exists (select 1 from public.fab_requests request where request.id = request_activity_log.request_id)
);

drop policy if exists assets_read on public.project_assets;
create policy assets_read on public.project_assets for select to authenticated using (true);
drop policy if exists assets_admin_all on public.project_assets;
create policy assets_admin_all on public.project_assets for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists assets_create on public.project_assets;
create policy assets_create on public.project_assets for insert to authenticated
with check (
  uploaded_by = public.current_profile_id()
  and (
    public.has_portal_role(array['admin','marketing'])
    or (
      public.has_portal_role(array['project_manager'])
      and exists (
        select 1 from public.projects p
        where p.id = project_assets.project_id
          and (p.claimed_by = public.current_profile_id() or p.created_by = public.current_profile_id())
      )
    )
  )
);
drop policy if exists assets_update on public.project_assets;
create policy assets_update on public.project_assets for update to authenticated
using (public.has_portal_role(array['admin','executive','marketing']) or uploaded_by = public.current_profile_id())
with check (public.has_portal_role(array['admin','executive','marketing']) or uploaded_by = public.current_profile_id());

drop policy if exists approvals_read on public.approval_queue;
create policy approvals_read on public.approval_queue for select to authenticated
using (public.has_portal_role(array['admin','executive','marketing']) or submitted_by = public.current_profile_id());
drop policy if exists approvals_admin_all on public.approval_queue;
create policy approvals_admin_all on public.approval_queue for all to authenticated
using (public.has_portal_role(array['admin'])) with check (public.has_portal_role(array['admin']));
drop policy if exists approvals_create on public.approval_queue;
create policy approvals_create on public.approval_queue for insert to authenticated
with check (submitted_by = public.current_profile_id());
drop policy if exists approvals_review on public.approval_queue;
create policy approvals_review on public.approval_queue for update to authenticated
using (public.has_portal_role(array['admin','executive','marketing']))
with check (public.has_portal_role(array['admin','executive','marketing']));

-- Public access is intentionally RPC-only so internal columns cannot be queried.
revoke all on public.profiles, public.projects, public.fab_requests, public.request_comments,
  public.request_activity_log, public.project_assets, public.approval_queue from anon;
grant select, insert, update, delete on public.profiles, public.projects, public.fab_requests,
  public.request_comments, public.request_activity_log, public.project_assets, public.approval_queue
  to authenticated;

create or replace function public.get_published_projects()
returns table (
  id uuid, name text, slug text, client_name text, location text, market text,
  project_type text, public_description text, updated_at timestamptz
)
language sql
stable
security definer set search_path = public
as $$
  select p.id, p.name, p.slug, p.client_name, p.location, p.market,
    p.project_type, p.public_description, p.updated_at
  from public.projects p
  where p.public_visibility_status = 'published'
  order by p.updated_at desc;
$$;

create or replace function public.get_published_project(project_slug text)
returns table (
  id uuid, name text, slug text, client_name text, location text, market text,
  project_type text, public_description text, updated_at timestamptz
)
language sql
stable
security definer set search_path = public
as $$
  select p.id, p.name, p.slug, p.client_name, p.location, p.market,
    p.project_type, p.public_description, p.updated_at
  from public.projects p
  where p.public_visibility_status = 'published' and p.slug = project_slug
  limit 1;
$$;

create or replace function public.get_published_project_assets(target_project_id uuid)
returns table (id uuid, project_id uuid, asset_type text, storage_path text, title text, description text, created_at timestamptz)
language sql
stable
security definer set search_path = public
as $$
  select a.id, a.project_id, a.asset_type, a.storage_path, a.title, a.description, a.created_at
  from public.project_assets a
  join public.projects p on p.id = a.project_id
  where a.project_id = target_project_id
    and a.approved_for_public = true
    and p.public_visibility_status = 'published'
  order by a.created_at;
$$;

grant execute on function public.get_published_projects() to anon, authenticated;
grant execute on function public.get_published_project(text) to anon, authenticated;
grant execute on function public.get_published_project_assets(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do update set public = false;

drop policy if exists portal_assets_read on storage.objects;
create policy portal_assets_read on storage.objects for select to authenticated
using (bucket_id = 'project-assets');
drop policy if exists portal_assets_insert on storage.objects;
create policy portal_assets_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'project-assets'
  and (
    public.has_portal_role(array['admin','marketing'])
    or (
      public.has_portal_role(array['project_manager'])
      and exists (
        select 1 from public.projects p
        where p.id = split_part(name, '/', 1)::uuid
          and (p.claimed_by = public.current_profile_id() or p.created_by = public.current_profile_id())
      )
    )
  )
);
drop policy if exists portal_assets_update on storage.objects;
create policy portal_assets_update on storage.objects for update to authenticated
using (bucket_id = 'project-assets' and (owner_id = auth.uid()::text or public.has_portal_role(array['admin','marketing'])));
drop policy if exists portal_assets_delete on storage.objects;
create policy portal_assets_delete on storage.objects for delete to authenticated
using (bucket_id = 'project-assets' and (owner_id = auth.uid()::text or public.has_portal_role(array['admin','marketing'])));

-- Promote initial users after running the migration, for example:
-- update public.profiles set role = 'admin', department = 'Administration'
-- where email = 'kmkusche@gmail.com';
