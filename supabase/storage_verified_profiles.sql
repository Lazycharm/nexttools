-- Storage setup for verified profile image uploads
-- Run this once in Supabase SQL editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verified-profiles',
  'verified-profiles',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "verified_profiles_images_public_read" on storage.objects;
create policy "verified_profiles_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'verified-profiles');

drop policy if exists "verified_profiles_images_admin_insert" on storage.objects;
create policy "verified_profiles_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'verified-profiles'
  and public.is_admin()
);

drop policy if exists "verified_profiles_images_admin_update" on storage.objects;
create policy "verified_profiles_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'verified-profiles'
  and public.is_admin()
)
with check (
  bucket_id = 'verified-profiles'
  and public.is_admin()
);

drop policy if exists "verified_profiles_images_admin_delete" on storage.objects;
create policy "verified_profiles_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'verified-profiles'
  and public.is_admin()
);
