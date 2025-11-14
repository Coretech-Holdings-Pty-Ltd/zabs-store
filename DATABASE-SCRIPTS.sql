-- ========================================
-- ZABS E-Commerce Platform
-- Database Setup & Maintenance Scripts
-- ========================================
-- For Supabase + Medusa.js v2
-- Last Updated: November 14, 2025
-- ========================================

-- TABLE OF CONTENTS:
-- 1. Initial Setup & Sync
-- 2. Cart Maintenance
-- 3. Wishlist Setup
-- 4. Diagnostic Queries
-- 5. Data Cleanup

-- ========================================
-- 1. INITIAL SETUP & SYNC
-- ========================================

-- Create function to sync Supabase Auth users with Medusa customer table
-- This ensures every authenticated user has a customer profile
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

-- Create trigger on auth.users table to auto-sync new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 2. CART MAINTENANCE
-- ========================================

-- Clean up duplicate cart items
-- Removes duplicate line items and consolidates quantities
-- Run this periodically to maintain cart data integrity

-- Step 1: Delete all but the most recent item for each variant_id in each cart
DELETE FROM cart_line_item
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY cart_id, variant_id 
        ORDER BY created_at DESC
      ) as row_num
    FROM cart_line_item
    WHERE deleted_at IS NULL
  ) t
  WHERE row_num > 1
);

-- Step 2: For remaining items, sum up quantities if there are still duplicates
-- (This updates the kept item with the total quantity)
WITH duplicate_quantities AS (
  SELECT 
    cart_id,
    variant_id,
    SUM(quantity) as total_quantity,
    MIN(id) as keep_id
  FROM cart_line_item
  WHERE deleted_at IS NULL
  GROUP BY cart_id, variant_id
  HAVING COUNT(*) > 1
)
UPDATE cart_line_item
SET quantity = duplicate_quantities.total_quantity
FROM duplicate_quantities
WHERE cart_line_item.id = duplicate_quantities.keep_id;

-- Clean up old incomplete carts (older than 30 days)
-- Helps maintain database performance
DELETE FROM cart_line_item 
WHERE cart_id IN (
  SELECT id FROM cart 
  WHERE completed_at IS NULL
  AND created_at < NOW() - INTERVAL '30 days'
);

DELETE FROM cart 
WHERE completed_at IS NULL
AND created_at < NOW() - INTERVAL '30 days';

-- ========================================
-- 3. WISHLIST SETUP
-- ========================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.wishlist;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.wishlist;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.wishlist;

-- Create simple policy that allows all wishlist operations
-- Adjust based on your security requirements
CREATE POLICY "Allow all wishlist operations"
ON public.wishlist
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled for wishlist table
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. DIAGNOSTIC QUERIES
-- ========================================

-- 4.1 List all Medusa tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4.2 Check address-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%address%';

-- 4.3 Check order-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%order%';

-- 4.4 Check customer-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%customer%';

-- 4.5 See customer table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'customer'
ORDER BY ordinal_position;

-- 4.6 Check product variants and prices
-- Replace the variant_id with your actual variant ID
SELECT 
  pv.id as variant_id,
  pv.title as variant_title,
  p.id as product_id,
  p.title as product_title,
  pv.manage_inventory,
  pv.allow_backorder
FROM product_variant pv
JOIN product p ON pv.product_id = p.id
WHERE pv.id = 'YOUR_VARIANT_ID_HERE';

-- 4.7 Check if variant has prices
SELECT 
  pv.id as variant_id,
  pv.title as variant_title,
  pp.amount,
  pp.currency_code,
  pp.price_list_id,
  pp.min_quantity,
  pp.max_quantity
FROM product_variant pv
LEFT JOIN price pp ON pv.id = pp.variant_id
WHERE pv.id = 'YOUR_VARIANT_ID_HERE';

-- 4.8 Check all variants for electronics products
-- Replace sales_channel_id with your actual channel ID
SELECT 
  pv.id as variant_id,
  pv.title as variant_title,
  p.title as product_title,
  pp.amount,
  pp.currency_code
FROM product_variant pv
JOIN product p ON pv.product_id = p.id
LEFT JOIN price pp ON pv.id = pp.variant_id
WHERE p.id IN (
  SELECT product_id FROM product_sales_channel
  WHERE sales_channel_id = 'YOUR_SALES_CHANNEL_ID_HERE'
)
ORDER BY p.title, pv.title;

-- 4.9 Verify cart cleanup results
SELECT 
  c.id as cart_id,
  c.customer_id,
  COUNT(cli.id) as item_count,
  COUNT(DISTINCT cli.variant_id) as unique_variants
FROM cart c
LEFT JOIN cart_line_item cli ON c.id = cli.cart_id AND cli.deleted_at IS NULL
GROUP BY c.id, c.customer_id
ORDER BY item_count DESC;

-- ========================================
-- 5. DATA CLEANUP
-- ========================================

-- 5.1 Clean up old incomplete carts for a specific customer
-- Replace YOUR_CUSTOMER_ID with actual customer ID
DELETE FROM cart_line_item 
WHERE cart_id IN (
  SELECT id FROM cart 
  WHERE customer_id = 'YOUR_CUSTOMER_ID'
  AND completed_at IS NULL
);

DELETE FROM cart 
WHERE customer_id = 'YOUR_CUSTOMER_ID'
AND completed_at IS NULL;

-- 5.2 Verify cleanup - should show only completed carts
SELECT id, customer_id, created_at, completed_at 
FROM cart 
WHERE customer_id = 'YOUR_CUSTOMER_ID'
ORDER BY created_at DESC;

-- 5.3 See all empty carts (for debugging)
SELECT c.id, c.created_at, COUNT(cli.id) as item_count
FROM cart c
LEFT JOIN cart_line_item cli ON c.id = cli.cart_id
WHERE c.completed_at IS NULL
GROUP BY c.id, c.created_at
HAVING COUNT(cli.id) = 0
ORDER BY c.created_at DESC;

-- 5.4 Delete all empty incomplete carts
DELETE FROM cart 
WHERE id IN (
  SELECT c.id
  FROM cart c
  LEFT JOIN cart_line_item cli ON c.id = cli.cart_id
  WHERE c.completed_at IS NULL
  GROUP BY c.id
  HAVING COUNT(cli.id) = 0
);

-- ========================================
-- MAINTENANCE SCHEDULE RECOMMENDATIONS
-- ========================================

-- DAILY:
-- - None required (Medusa handles most maintenance)

-- WEEKLY:
-- - Run cart duplicate cleanup (Section 2)
-- - Check for empty carts and clean if needed (Section 5.3, 5.4)

-- MONTHLY:
-- - Clean up old incomplete carts (Section 2, last queries)
-- - Review diagnostic queries for data integrity (Section 4)

-- AS NEEDED:
-- - Customer-specific cart cleanup (Section 5.1)
-- - Variant price verification (Section 4.6, 4.7)

-- ========================================
-- NOTES & BEST PRACTICES
-- ========================================

-- 1. Always backup your database before running DELETE queries
-- 2. Test queries on a staging database first
-- 3. Replace placeholder IDs (YOUR_CUSTOMER_ID, etc.) with actual values
-- 4. Run diagnostic queries first to understand data state
-- 5. Schedule regular maintenance during low-traffic periods
-- 6. Monitor query performance on large datasets

-- ========================================
-- SUPPORT & DOCUMENTATION
-- ========================================

-- Medusa Documentation: https://docs.medusajs.com
-- Supabase Documentation: https://supabase.com/docs
-- ZABS Project Documentation: See DOCUMENTATION.md

-- ========================================
-- END OF SQL SCRIPTS
-- ========================================
