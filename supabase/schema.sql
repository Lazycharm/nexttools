-- services
create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  category text,
  sub_category text,
  price_type text,
  base_price numeric,
  currency text default 'USD',
  packages jsonb,
  platforms text[],
  countries text[],
  delivery_estimate text,
  quality_badge text,
  status text default 'active',
  is_featured boolean default false,
  is_restricted boolean default false,
  refill_period text,
  rating numeric,
  total_orders numeric default 0,
  image_url text,
  faq jsonb,
  features text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  service_id uuid references services(id),
  service_title text,
  category text,
  package_name text,
  quantity numeric,
  amount numeric,
  status text default 'pending',
  payment_method text,
  target_url text,
  notes text,
  delivery_estimate text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- deposits
create table deposits (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  amount numeric,
  crypto_type text,
  network text,
  wallet_address text,
  tx_hash text,
  proof_url text,
  status text default 'pending',
  admin_notes text,
  credited_amount numeric,
  created_at timestamptz default now()
);

-- subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  plan_name text,
  plan_tier text,
  price numeric,
  billing_cycle text,
  status text default 'active',
  start_date date,
  end_date date,
  features text[],
  auto_renew boolean default true,
  created_at timestamptz default now()
);

-- tickets
create table tickets (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  subject text,
  category text,
  priority text default 'medium',
  status text default 'open',
  messages jsonb,
  assigned_to text,
  created_at timestamptz default now()
);

-- notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text,
  message text,
  type text,
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  user_name text,
  service_id uuid references services(id),
  rating numeric,
  content text,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- app_settings
create table app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  category text,
  created_at timestamptz default now()
);

-- profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id),
  email text,
  full_name text,
  role text default 'user',
  wallet_balance numeric default 0,
  total_deposits numeric default 0,
  created_at timestamptz default now()
);

-- virtual_numbers
create table virtual_numbers (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  country_name text not null,
  number_value text not null,
  number_masked text not null,
  number_type text default 'sms',
  provider text,
  price numeric default 2.50,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- virtual_number_orders
create table virtual_number_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_email text not null,
  virtual_number_id uuid references virtual_numbers(id),
  order_id uuid references orders(id),
  amount numeric,
  status text default 'approved',
  approved_at timestamptz default now(),
  created_at timestamptz default now()
);

-- verified_profiles (dating marketplace)
create table if not exists verified_profiles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null default 20,
  status text default 'available',
  category text default 'dating',
  primary_image_url text,
  image_urls jsonb,
  profile_details text,
  included_items text[],
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- profile setup requests (subscription delivery workflow)
create table if not exists profile_setup_requests (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  subscription_id uuid references subscriptions(id),
  plan_tier text,
  request_type text default 'custom',
  existing_profile_id uuid references verified_profiles(id),
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
