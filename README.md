# 1CG Website

Next.js App Router site for 1CG commercial glazing and facade work.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

Copy `.env.example` to `.env.local` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
```

The service role key is server-only and must not be committed.

## Internal Portal

The standalone 1CG workflow portal is available at `/portal`. It uses Supabase
Auth, Postgres, Storage, and RLS; it has no Odoo or ERP runtime dependency.

1. Link the Supabase CLI and apply the versioned migrations:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

The migrations in `supabase/migrations` create the portal schema, telemetry
tables, public project RPCs, storage policies, and seed all 72 public projects.
2. Enable Google OAuth in Supabase Auth and add the site callback URL.
3. Sign in once so the auth trigger creates a profile.
4. Assign the initial administrator:

```sql
update public.profiles
set role = 'admin', department = 'Administration'
where email = 'kmkusche@gmail.com';
```

Supported roles are `admin`, `executive`, `estimating`, `project_manager`,
`operations`, `marketing`, and `viewer`. Additional test users can be invited
through Supabase Auth and assigned a role by updating `public.profiles`.

Approved public content is read through limited Supabase RPC functions. Internal
descriptions, fabrication notes, drawing links, comments, and activity logs are
not returned to public routes. Project files are stored in the private
`project-assets` bucket and opened through signed URLs.

The future ERP boundary is `src/lib/integrations/erp.ts`. Its current
`NoOpERPAdapter` keeps the portal fully standalone; a later integration can
implement the same interface without changing portal screens or workflows.

## Checks

```bash
npm run lint
npm run build
```
