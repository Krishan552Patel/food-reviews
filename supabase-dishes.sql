-- =============================================
-- Dishes Table - Run in Supabase SQL Editor
-- =============================================

-- Drop table if it exists (safe to re-run)
DROP TABLE IF EXISTS dishes;

CREATE TABLE dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  food_rating SMALLINT NOT NULL CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating SMALLINT NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
  price_rating SMALLINT NOT NULL CHECK (price_rating >= 1 AND price_rating <= 5),
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast lookups by restaurant
CREATE INDEX idx_dishes_restaurant_id ON dishes (restaurant_id);

-- Enable Row Level Security
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key can SELECT)
CREATE POLICY "Dishes public read access" ON dishes
  FOR SELECT
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Dishes service role full access" ON dishes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
