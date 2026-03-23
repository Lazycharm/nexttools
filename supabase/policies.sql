-- Enable row level security
alter table profiles enable row level security;
alter table services enable row level security;
alter table orders enable row level security;
alter table deposits enable row level security;
alter table subscriptions enable row level security;
alter table tickets enable row level security;
alter table notifications enable row level security;
alter table reviews enable row level security;
alter table app_settings enable row level security;

-- Helper function used by policies
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Keep profiles in sync with auth users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- profiles
drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on profiles;
create policy "profiles_insert_own_or_admin" on profiles
for insert with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- services
drop policy if exists "services_public_read" on services;
create policy "services_public_read" on services
for select using (true);

drop policy if exists "services_admin_write" on services;
create policy "services_admin_write" on services
for all using (public.is_admin()) with check (public.is_admin());

-- orders
drop policy if exists "orders_user_read_own_or_admin" on orders;
create policy "orders_user_read_own_or_admin" on orders
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "orders_user_insert_own_or_admin" on orders;
create policy "orders_user_insert_own_or_admin" on orders
for insert with check (user_email = auth.email() or public.is_admin());

drop policy if exists "orders_admin_update_delete" on orders;
create policy "orders_admin_update_delete" on orders
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_delete" on orders;
create policy "orders_admin_delete" on orders
for delete using (public.is_admin());

-- deposits
drop policy if exists "deposits_user_read_own_or_admin" on deposits;
create policy "deposits_user_read_own_or_admin" on deposits
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "deposits_user_insert_own_or_admin" on deposits;
create policy "deposits_user_insert_own_or_admin" on deposits
for insert with check (user_email = auth.email() or public.is_admin());

drop policy if exists "deposits_admin_update_delete" on deposits;
create policy "deposits_admin_update_delete" on deposits
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "deposits_admin_delete" on deposits;
create policy "deposits_admin_delete" on deposits
for delete using (public.is_admin());

-- subscriptions
drop policy if exists "subscriptions_user_read_own_or_admin" on subscriptions;
create policy "subscriptions_user_read_own_or_admin" on subscriptions
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "subscriptions_admin_write" on subscriptions;
create policy "subscriptions_admin_write" on subscriptions
for all using (public.is_admin()) with check (public.is_admin());

-- tickets
drop policy if exists "tickets_user_read_own_or_admin" on tickets;
create policy "tickets_user_read_own_or_admin" on tickets
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "tickets_user_insert_own_or_admin" on tickets;
create policy "tickets_user_insert_own_or_admin" on tickets
for insert with check (user_email = auth.email() or public.is_admin());

drop policy if exists "tickets_user_or_admin_update" on tickets;
create policy "tickets_user_or_admin_update" on tickets
for update using (user_email = auth.email() or public.is_admin())
with check (user_email = auth.email() or public.is_admin());

-- notifications
drop policy if exists "notifications_user_read_own_or_admin" on notifications;
create policy "notifications_user_read_own_or_admin" on notifications
for select using (user_email = auth.email() or public.is_admin());

drop policy if exists "notifications_user_or_admin_update" on notifications;
create policy "notifications_user_or_admin_update" on notifications
for update using (user_email = auth.email() or public.is_admin())
with check (user_email = auth.email() or public.is_admin());

drop policy if exists "notifications_admin_insert_delete" on notifications;
create policy "notifications_admin_insert_delete" on notifications
for insert with check (public.is_admin());

drop policy if exists "notifications_admin_delete" on notifications;
create policy "notifications_admin_delete" on notifications
for delete using (public.is_admin());

-- reviews
drop policy if exists "reviews_public_read" on reviews;
create policy "reviews_public_read" on reviews
for select using (true);

drop policy if exists "reviews_user_insert" on reviews;
create policy "reviews_user_insert" on reviews
for insert with check (user_email = auth.email() or public.is_admin());

drop policy if exists "reviews_admin_update_delete" on reviews;
create policy "reviews_admin_update_delete" on reviews
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_admin_delete" on reviews;
create policy "reviews_admin_delete" on reviews
for delete using (public.is_admin());

-- app_settings
drop policy if exists "app_settings_public_read" on app_settings;
create policy "app_settings_public_read" on app_settings
for select using (true);

drop policy if exists "app_settings_admin_write" on app_settings;
create policy "app_settings_admin_write" on app_settings
for all using (public.is_admin()) with check (public.is_admin());
