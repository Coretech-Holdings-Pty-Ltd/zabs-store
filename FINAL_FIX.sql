-- ========================================
-- SUPABASE AUTH → MEDUSA CUSTOMER SYNC
-- Run this in Supabase SQL Editor
-- ========================================

-- Create function to sync auth users with customer table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create or update customer profile when auth user is created
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

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- DONE! Customers will be created automatically on signup
-- ========================================
