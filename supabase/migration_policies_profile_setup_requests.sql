alter table if exists public.profile_setup_requests enable row level security;

drop policy if exists "profile_setup_requests_user_read_or_admin" on public.profile_setup_requests;
create policy "profile_setup_requests_user_read_or_admin" on public.profile_setup_requests
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "profile_setup_requests_user_insert_or_admin" on public.profile_setup_requests;
create policy "profile_setup_requests_user_insert_or_admin" on public.profile_setup_requests
for insert with check (user_email = auth.email() or public.is_admin());

drop policy if exists "profile_setup_requests_user_update_or_admin" on public.profile_setup_requests;
create policy "profile_setup_requests_user_update_or_admin" on public.profile_setup_requests
for update using (user_email = auth.email() or public.is_admin())
with check (user_email = auth.email() or public.is_admin());
