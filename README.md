# NexusTool

React + Vite + Tailwind + shadcn/ui frontend using Supabase for auth and database.

## Local setup

1. Install dependencies:
   `npm install`
2. Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run locally:
   `npm run dev`

## Build

`npm run build`

## Supabase schema

Run the SQL in `supabase/schema.sql` inside your Supabase SQL Editor.
Then run `supabase/policies.sql` to enable RLS, admin/user policies, and auto-profile creation trigger.
If you want demo catalog content, run `supabase/seed_services.sql` to insert 20 realistic services.
For virtual number inventory demos (10 countries x 10 numbers), run `supabase/seed_virtual_numbers.sql`.

## Netlify deployment

- Build config is in `netlify.toml`
- Set these environment variables in Netlify:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
