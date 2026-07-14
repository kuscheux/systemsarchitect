-- Private Project Pins and employee PIN authentication support.

alter table public.projects
  add column if not exists presentation_url text not null default '';

create table if not exists public.employee_pin_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  pin_salt text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employee_pin_credentials enable row level security;

revoke all on table public.employee_pin_credentials from anon, authenticated;

drop trigger if exists employee_pin_credentials_set_updated_at on public.employee_pin_credentials;
create trigger employee_pin_credentials_set_updated_at
before update on public.employee_pin_credentials
for each row execute function public.set_updated_at();

insert into public.projects (
  name,
  slug,
  client_name,
  location,
  region,
  market,
  project_type,
  status,
  internal_description,
  public_description,
  public_visibility_status,
  image_url,
  video_url,
  scope,
  systems,
  architect,
  owner,
  overview,
  challenge,
  solution,
  result,
  street_address,
  latitude,
  longitude,
  presentation_url
) values (
  'Magnolia Landing',
  'magnolia-landing',
  'Highland Resources',
  'Charleston, SC',
  'Southern Coastal',
  'Mixed-Use',
  'Exterior envelope / design assist',
  'active',
  'Private design-assist pursuit for the Magnolia Landing exterior envelope package. This CRM record, its presentation, and its assets are restricted to authenticated 1CG employees.',
  '',
  'draft',
  '/images/magnolia/01-southeast-oblique.png',
  '/videos/brand/1cg-brand-anthem.mp4',
  'Glazing, cladding, screening, entrances, fabrication, and installation',
  'GW-7000, ES-7525, ES-46T, ES-9000, Alucobond ACM, Mosaic V-Plank, custom garage screening',
  'Pickard Chilton / Cooper Carry',
  'Highland Resources',
  'A single private project record for pursuit strategy, envelope coordination, stakeholder presentation, and delivery planning.',
  'Coordinate a complex exterior envelope package across design assist, procurement, fabrication, and phased field installation.',
  'Keep project facts, scope, schedule, presentation media, and stakeholder-ready playback connected to one Project Pin.',
  'A controlled internal record that can later become the completed public project page only after formal approval.',
  '115 Bachman Boulevard, Charleston, SC 29405',
  32.8462,
  -79.9722,
  '/project-pins/magnolia'
)
on conflict (slug) do update set
  client_name = excluded.client_name,
  location = excluded.location,
  region = excluded.region,
  market = excluded.market,
  project_type = excluded.project_type,
  status = excluded.status,
  internal_description = excluded.internal_description,
  public_visibility_status = 'draft',
  image_url = excluded.image_url,
  video_url = excluded.video_url,
  scope = excluded.scope,
  systems = excluded.systems,
  architect = excluded.architect,
  owner = excluded.owner,
  overview = excluded.overview,
  challenge = excluded.challenge,
  solution = excluded.solution,
  result = excluded.result,
  street_address = excluded.street_address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  presentation_url = excluded.presentation_url,
  updated_at = now();

update public.profiles
set role = 'admin', department = 'Administration', updated_at = now()
where lower(email) = 'kmkusche@gmail.com';
