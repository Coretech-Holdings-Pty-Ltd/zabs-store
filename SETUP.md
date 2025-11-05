# ZAB'S Store Frontend Setup

## Overview

React + TypeScript frontend with Supabase authentication and Medusa e-commerce backend integration.

## Environment Setup

Create `.env` file:

```env
VITE_SUPABASE_URL=https://zqolrwterezddcwqknzo.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MEDUSA_BACKEND_URL=https://backend-production-991f.up.railway.app
```

## Supabase Configuration

### 1. Run this SQL in Supabase SQL Editor:

```sql
-- Create trigger to sync Supabase auth with Medusa customer table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customer (id, email, first_name, last_name, has_account, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, customer.first_name),
    last_name = COALESCE(EXCLUDED.last_name, customer.last_name),
    has_account = true,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Disable Email Confirmation (for testing):

- Supabase Dashboard → Authentication → Providers → Email
- Turn OFF "Confirm email"
- Save

### 3. Enable Direct Database Access:

All data (orders, addresses) is fetched directly from Supabase database, no Medusa API authentication needed.

## Installation

```bash
npm install
npm run dev
```

## Features

- **Authentication**: Supabase Auth (sign up, sign in, sign out)
- **Customer Dashboard**: Orders, profile management, addresses
- **Product Catalog**: Health & Electronics stores with caching
- **Shopping Cart**: Persistent cart with checkout
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Key Files

- `src/lib/supabase.ts` - Supabase client & auth helpers
- `src/lib/auth-context.tsx` - React auth context provider
- `src/components/ProfilePage.tsx` - Customer dashboard
- `src/App.tsx` - Main app with routing logic
- `src/lib/api.ts` - Medusa API integration
- `src/lib/cache.ts` - Client-side caching

## How Authentication Works

1. User signs up → Supabase creates auth user
2. Trigger fires → Creates customer in Medusa database
3. User signed in → Frontend fetches customer data
4. Dashboard loads → Shows orders, profile, addresses

## Troubleshooting

**"Customer not found" error:**

- Check trigger is created in Supabase
- Verify customer table exists in database
- Check Supabase logs for trigger errors

**Orders not loading:**

- Verify Medusa backend is running
- Check `VITE_MEDUSA_BACKEND_URL` in `.env`
- Look for CORS errors in console

**Auth fails:**

- Check Supabase credentials in `.env`
- Verify email confirmation is disabled
- Check browser console for errors
