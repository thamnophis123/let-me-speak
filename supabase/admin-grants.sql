-- Extra grants for admin-triggered analysis writes.
-- Safe to re-run. Needed if the original schema was applied before service_role grants were added.

grant usage on schema public to service_role;
grant select on table public.projects, public.evidence_items, public.claims, public.analysis_versions, public.submissions to service_role;
grant insert, update, delete on table public.claims to service_role;
grant insert, update on table public.analysis_versions to service_role;
grant insert, update on table public.projects to service_role;
grant update on table public.submissions to service_role;
