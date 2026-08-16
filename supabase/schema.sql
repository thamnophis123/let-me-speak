-- Let The People Speak — schema
-- Run this in the Supabase SQL Editor first, then run supabase/seed.sql.

create extension if not exists pgcrypto;

-- Enums
create type public.project_status as enum (
  'Open for Comment',
  'Baseline',
  'Final Recommendation'
);

create type public.evidence_status as enum (
  'Verified',
  'Company Claim',
  'Staff Estimate',
  'Open Question'
);

create type public.claim_side as enum (
  'for',
  'against',
  'examined'
);

create type public.claim_strength as enum (
  'Strong',
  'Moderate',
  'Weak',
  'Invalid',
  'Not Applicable'
);

create type public.confidence_level as enum (
  'Low',
  'Medium',
  'High'
);

create type public.submission_status as enum (
  'pending_review',
  'accepted',
  'rejected',
  'duplicate'
);

create type public.contribution_type as enum (
  'New evidence',
  'Correction of fact',
  'Argument for',
  'Argument against',
  'Challenge to an existing claim',
  'Question / missing information'
);

create type public.contributor_role as enum (
  'Resident',
  'Nearby landowner',
  'Business owner',
  'Subject-matter expert',
  'Elected or appointed official',
  'Other'
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  jurisdiction text not null,
  status public.project_status not null default 'Baseline',
  summary text not null,
  recommendation text,
  decisive_factors text[] not null default '{}',
  uncertainties text[] not null default '{}',
  confidence public.confidence_level,
  confidence_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger projects_set_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

-- evidence_items
create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  source text not null,
  summary text not null,
  status public.evidence_status not null,
  source_url text,
  file_url text,
  file_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_source_url_http check (
    source_url is null or source_url ~* '^https?://'
  ),
  constraint evidence_file_url_http check (
    file_url is null or file_url ~* '^https?://'
  )
);

create index evidence_items_project_id_sort_idx
  on public.evidence_items (project_id, sort_order);

create trigger evidence_items_set_updated_at
before update on public.evidence_items
for each row execute procedure public.set_updated_at();

-- claims (argument map)
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  side public.claim_side not null,
  claim text not null,
  note text not null,
  strength public.claim_strength not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index claims_project_id_side_sort_idx
  on public.claims (project_id, side, sort_order);

create trigger claims_set_updated_at
before update on public.claims
for each row execute procedure public.set_updated_at();

-- analysis_versions
create table public.analysis_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version text not null,
  summary text not null,
  published_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version)
);

create index analysis_versions_project_published_idx
  on public.analysis_versions (project_id, published_at desc);

create trigger analysis_versions_set_updated_at
before update on public.analysis_versions
for each row execute procedure public.set_updated_at();

-- submissions (stakeholder intake)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  role public.contributor_role not null,
  contribution_type public.contribution_type not null,
  claim text not null,
  supporting_link text,
  explanation text,
  status public.submission_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_project_id_created_idx
  on public.submissions (project_id, created_at desc);

create trigger submissions_set_updated_at
before update on public.submissions
for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.projects enable row level security;
alter table public.evidence_items enable row level security;
alter table public.claims enable row level security;
alter table public.analysis_versions enable row level security;
alter table public.submissions enable row level security;

create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "Public can read evidence"
  on public.evidence_items for select
  to anon, authenticated
  using (true);

create policy "Public can read claims"
  on public.claims for select
  to anon, authenticated
  using (true);

create policy "Public can read analysis versions"
  on public.analysis_versions for select
  to anon, authenticated
  using (true);

create policy "Public can submit comments"
  on public.submissions for insert
  to anon, authenticated
  with check (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.projects, public.evidence_items, public.claims, public.analysis_versions to anon, authenticated, service_role;
grant insert on table public.submissions to anon, authenticated;
grant select, update on table public.submissions to service_role;
grant insert, update, delete on table public.claims to service_role;
grant insert, update on table public.analysis_versions to service_role;
grant insert, update, delete on table public.evidence_items to service_role;
grant insert, update on table public.projects to service_role;
