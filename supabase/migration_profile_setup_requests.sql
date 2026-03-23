create table if not exists public.profile_setup_requests (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  subscription_id uuid references public.subscriptions(id),
  plan_tier text,
  request_type text default 'custom',
  existing_profile_id uuid references public.verified_profiles(id),
  instagram_username text,
  dating_app text,
  social_platform text,
  image_urls jsonb,
  notes text,
  status text default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
