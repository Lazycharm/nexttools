-- Demo seed: 10 countries x 10 numbers each (100 records)
-- Re-runnable: deletes current demo provider rows first.

delete from virtual_numbers where provider = 'ToolStack Demo Pool';

with countries as (
  select * from (
    values
      ('US', 'United States', '+1', 2.80),
      ('CA', 'Canada', '+1', 2.70),
      ('GB', 'United Kingdom', '+44', 3.10),
      ('DE', 'Germany', '+49', 2.90),
      ('FR', 'France', '+33', 2.90),
      ('AU', 'Australia', '+61', 3.20),
      ('IN', 'India', '+91', 2.20),
      ('BR', 'Brazil', '+55', 2.40),
      ('AE', 'United Arab Emirates', '+971', 3.40),
      ('ZA', 'South Africa', '+27', 2.60)
  ) as t(country_code, country_name, dialing_code, base_price)
),
nums as (
  select generate_series(1, 10) as n
)
insert into virtual_numbers (
  country_code,
  country_name,
  number_value,
  number_masked,
  number_type,
  provider,
  price,
  is_available
)
select
  c.country_code,
  c.country_name,
  c.dialing_code || ' ' || lpad((1000000 + n.n * 731 + row_number() over (partition by c.country_code order by n.n))::text, 10, '0') as number_value,
  c.dialing_code || ' ' || left(lpad((1000000 + n.n * 731 + row_number() over (partition by c.country_code order by n.n))::text, 10, '0'), 6) || '****' as number_masked,
  case when n.n % 4 = 0 then 'voice_sms' else 'sms' end as number_type,
  'ToolStack Demo Pool' as provider,
  (c.base_price + (n.n * 0.15))::numeric(10,2) as price,
  true as is_available
from countries c
cross join nums n
order by c.country_code, n.n;
