-- Add evidence file/URL columns and a public Storage bucket.
-- Safe to re-run after the original schema.

alter table public.evidence_items
  add column if not exists source_url text,
  add column if not exists file_url text,
  add column if not exists file_path text;

alter table public.evidence_items
  drop constraint if exists evidence_source_url_http;
alter table public.evidence_items
  add constraint evidence_source_url_http check (
    source_url is null or source_url ~* '^https?://'
  );

alter table public.evidence_items
  drop constraint if exists evidence_file_url_http;
alter table public.evidence_items
  add constraint evidence_file_url_http check (
    file_url is null or file_url ~* '^https?://'
  );

grant insert, update, delete on table public.evidence_items to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  true,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read evidence files" on storage.objects;
create policy "Public can read evidence files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'evidence');
