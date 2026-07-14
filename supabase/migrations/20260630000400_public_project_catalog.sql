-- Public project catalog fields and narrow read-only RPC surface.

alter table public.projects
  add column if not exists region text not null default '',
  add column if not exists image_url text not null default '',
  add column if not exists video_url text not null default '',
  add column if not exists scope text not null default '',
  add column if not exists systems text not null default '',
  add column if not exists completion text not null default '',
  add column if not exists general_contractor text not null default '',
  add column if not exists architect text not null default '',
  add column if not exists owner text not null default '',
  add column if not exists project_size text not null default '',
  add column if not exists stories text not null default '',
  add column if not exists overview text not null default '',
  add column if not exists challenge text not null default '',
  add column if not exists solution text not null default '',
  add column if not exists result text not null default '',
  add column if not exists street_address text not null default '',
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists projects_public_location_idx
  on public.projects (latitude, longitude)
  where public_visibility_status = 'published';

drop function if exists public.get_published_projects();
create function public.get_published_projects()
returns table (
  id uuid,
  name text,
  slug text,
  client_name text,
  location text,
  region text,
  market text,
  project_type text,
  public_description text,
  image_url text,
  video_url text,
  scope text,
  systems text,
  completion text,
  general_contractor text,
  architect text,
  owner text,
  project_size text,
  stories text,
  overview text,
  challenge text,
  solution text,
  result text,
  street_address text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id, p.name, p.slug, p.client_name, p.location, p.region, p.market,
    p.project_type, p.public_description, p.image_url, p.video_url, p.scope,
    p.systems, p.completion, p.general_contractor, p.architect, p.owner,
    p.project_size, p.stories, p.overview, p.challenge, p.solution, p.result,
    p.street_address, p.latitude, p.longitude, p.updated_at
  from public.projects p
  where p.public_visibility_status = 'published'
  order by p.name;
$$;

drop function if exists public.get_published_project(text);
create function public.get_published_project(project_slug text)
returns table (
  id uuid,
  name text,
  slug text,
  client_name text,
  location text,
  region text,
  market text,
  project_type text,
  public_description text,
  image_url text,
  video_url text,
  scope text,
  systems text,
  completion text,
  general_contractor text,
  architect text,
  owner text,
  project_size text,
  stories text,
  overview text,
  challenge text,
  solution text,
  result text,
  street_address text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id, p.name, p.slug, p.client_name, p.location, p.region, p.market,
    p.project_type, p.public_description, p.image_url, p.video_url, p.scope,
    p.systems, p.completion, p.general_contractor, p.architect, p.owner,
    p.project_size, p.stories, p.overview, p.challenge, p.solution, p.result,
    p.street_address, p.latitude, p.longitude, p.updated_at
  from public.projects p
  where p.public_visibility_status = 'published'
    and p.slug = project_slug
  limit 1;
$$;

revoke all on function public.get_published_projects() from public;
revoke all on function public.get_published_project(text) from public;
revoke all on function public.get_published_project_assets(uuid) from public;
grant execute on function public.get_published_projects() to anon, authenticated;
grant execute on function public.get_published_project(text) to anon, authenticated;
grant execute on function public.get_published_project_assets(uuid) to anon, authenticated;

-- The profile row is created by handle_new_user; this safely no-ops until the user exists.
update public.profiles
set role = 'admin', department = 'Administration', updated_at = now()
where lower(email) = 'kmkusche@gmail.com';
