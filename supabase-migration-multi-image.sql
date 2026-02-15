-- =============================================
-- Migration: Multi-image restaurants + Drop dish service/price ratings
-- Run this in your Supabase Dashboard: SQL Editor > New Query
-- =============================================

-- 1. Add images array column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Migrate existing image_url data into the images array
UPDATE restaurants
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 3. Make service_rating and price_rating nullable on dishes (backward compatible)
--    This allows existing rows to keep their values while new rows won't need them.
ALTER TABLE dishes ALTER COLUMN service_rating DROP NOT NULL;
ALTER TABLE dishes ALTER COLUMN price_rating DROP NOT NULL;

-- 4. Set default null for new dish rows
ALTER TABLE dishes ALTER COLUMN service_rating SET DEFAULT NULL;
ALTER TABLE dishes ALTER COLUMN price_rating SET DEFAULT NULL;

-- Done! The app code no longer sends service_rating or price_rating for new dishes,
-- and existing data is preserved. The restaurant images array is populated from image_url.
