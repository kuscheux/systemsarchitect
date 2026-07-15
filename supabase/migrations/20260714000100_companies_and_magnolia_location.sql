-- Private CRM companies and corrected Magnolia Landing pursuit record.

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text not null default '',
  description text not null default '',
  primary_address text not null default '',
  city text not null default '',
  state text not null default '',
  postal_code text not null default '',
  phone text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null default '',
  title text not null default '',
  email text not null default '',
  phone text not null default '',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists company_id uuid references public.companies(id) on delete set null;

create index if not exists projects_company_idx on public.projects(company_id, updated_at desc);
create index if not exists company_contacts_company_idx on public.company_contacts(company_id, is_primary desc);
create unique index if not exists company_contacts_identity_idx
  on public.company_contacts(company_id, lower(full_name), lower(email));

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists company_contacts_set_updated_at on public.company_contacts;
create trigger company_contacts_set_updated_at before update on public.company_contacts
for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.company_contacts enable row level security;

revoke all on table public.companies from anon;
revoke all on table public.company_contacts from anon;
grant select on table public.companies to authenticated;
grant select on table public.company_contacts to authenticated;
grant insert, update, delete on table public.companies to authenticated;
grant insert, update, delete on table public.company_contacts to authenticated;

drop policy if exists companies_employee_read on public.companies;
create policy companies_employee_read on public.companies for select to authenticated
using (public.has_portal_role(array['admin','executive','estimating','project_manager','operations','marketing']));

drop policy if exists companies_admin_write on public.companies;
create policy companies_admin_write on public.companies for all to authenticated
using (public.has_portal_role(array['admin']))
with check (public.has_portal_role(array['admin']));

drop policy if exists company_contacts_employee_read on public.company_contacts;
create policy company_contacts_employee_read on public.company_contacts for select to authenticated
using (public.has_portal_role(array['admin','executive','estimating','project_manager','operations','marketing']));

drop policy if exists company_contacts_admin_write on public.company_contacts;
create policy company_contacts_admin_write on public.company_contacts for all to authenticated
using (public.has_portal_role(array['admin']))
with check (public.has_portal_role(array['admin']));

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
    or new.company_id is distinct from old.company_id
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
      or new.company_id is distinct from old.company_id
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

insert into public.companies (
  name,
  slug,
  website,
  description,
  primary_address,
  city,
  state,
  postal_code,
  phone,
  email
) values (
  'Highland Resources',
  'highland-resources',
  'https://highlandresourcesinc.com/',
  'A privately held real estate investment firm. Magnolia Landing is its 192-acre mixed-use waterfront district along 1.5 miles of the Ashley River.',
  '700 Milam St., Ste. 1250',
  'Houston',
  'TX',
  '77002',
  '713.358.2370',
  'info@highlandresourcesinc.com'
)
on conflict (slug) do update set
  name = excluded.name,
  website = excluded.website,
  description = excluded.description,
  primary_address = excluded.primary_address,
  city = excluded.city,
  state = excluded.state,
  postal_code = excluded.postal_code,
  phone = excluded.phone,
  email = excluded.email,
  updated_at = now();

insert into public.company_contacts (
  company_id,
  full_name,
  title,
  email,
  phone,
  is_primary
)
select
  c.id,
  'General Inquiries',
  'Highland Resources',
  'info@highlandresourcesinc.com',
  '713.358.2370',
  true
from public.companies c
where c.slug = 'highland-resources'
  and not exists (
    select 1
    from public.company_contacts contact
    where contact.company_id = c.id
      and lower(contact.full_name) = 'general inquiries'
      and lower(contact.email) = 'info@highlandresourcesinc.com'
  );

update public.company_contacts contact
set
  title = 'Highland Resources',
  phone = '713.358.2370',
  is_primary = true,
  updated_at = now()
from public.companies company
where company.slug = 'highland-resources'
  and contact.company_id = company.id
  and lower(contact.full_name) = 'general inquiries'
  and lower(contact.email) = 'info@highlandresourcesinc.com';

update public.projects
set
  company_id = (select id from public.companies where slug = 'highland-resources'),
  client_name = 'Highland Resources',
  location = 'Charleston, SC',
  status = 'pending',
  internal_description = 'Private pending pursuit for Magnolia Landing. The CRM record, presentation, scope, assets, and approvals are restricted to authenticated 1CG employees.',
  public_visibility_status = 'draft',
  image_url = '/images/magnolia/magnolia-rfp-rendering.webp',
  scope = 'GW-7000, ES-7525, ES-46T, ES-9000, 34,273 SF of 4mm ALUCOBOND ACM, 7,800 SF of 6-inch LumaBuilt V-Groove, and 12,500 SF of ES Metals perforated aluminum screening',
  systems = 'GW-7000, ES-7525, ES-46T, ES-9000, ALUCOBOND ACM, LumaBuilt V-Groove, ES Metals perforated aluminum screening',
  street_address = '2198 Milford St, Charleston, SC 29405',
  latitude = 32.824252,
  longitude = -79.961000,
  presentation_url = '/project-pins/magnolia',
  updated_at = now()
where slug = 'magnolia-landing';

update public.profiles
set role = 'admin', department = 'Administration', updated_at = now()
where lower(email) = 'kmkusche@gmail.com';
