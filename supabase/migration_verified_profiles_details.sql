-- Incremental patch for existing projects
alter table if exists public.verified_profiles
add column if not exists profile_details text;
