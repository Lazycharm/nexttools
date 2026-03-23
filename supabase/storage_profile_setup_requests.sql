insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-setup-requests',
  'profile-setup-requests',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_setup_images_select" on storage.objects;
create policy "profile_setup_images_select"
on storage.objects
for select
to public
using (bucket_id = 'profile-setup-requests');

drop policy if exists "profile_setup_images_insert" on storage.objects;
create policy "profile_setup_images_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-setup-requests'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
);

drop policy if exists "profile_setup_images_update" on storage.objects;
create policy "profile_setup_images_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-setup-requests'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
)
with check (
  bucket_id = 'profile-setup-requests'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
);

drop policy if exists "profile_setup_images_delete" on storage.objects;
create policy "profile_setup_images_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-setup-requests'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
);
