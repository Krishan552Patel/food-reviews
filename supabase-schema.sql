-- =============================================
-- Restaurant Review Website - Supabase Schema
-- =============================================
-- Run this in your Supabase Dashboard: SQL Editor > New Query

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'bubble_tea', 'cafe')),
  cuisine_type TEXT,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_restaurants_slug ON restaurants (slug);
CREATE INDEX idx_restaurants_category ON restaurants (category);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key can SELECT)
CREATE POLICY "Public read access" ON restaurants
  FOR SELECT
  USING (true);

-- =============================================
-- Seed data for testing (adjust coordinates to your city)
-- =============================================
INSERT INTO restaurants (name, slug, category, cuisine_type, rating, review_text, address, latitude, longitude)
VALUES
  (
    'Sakura Kitchen',
    'sakura-kitchen',
    'restaurant',
    'Japanese',
    5,
    'Hands down the best ramen spot in town. The tonkotsu broth is rich and creamy, simmered for over 12 hours. The chashu pork melts in your mouth and the soft-boiled egg is cooked to perfection every single time. The gyoza are crispy on the bottom and juicy inside. Service is friendly and fast. A must-visit for any ramen lover.',
    '123 Main St',
    43.6532,
    -79.3832
  ),
  (
    'Boba Bliss',
    'boba-bliss',
    'bubble_tea',
    NULL,
    4,
    'Great selection of milk teas and fruit teas. The taro milk tea with tapioca pearls is my go-to order — perfectly sweet without being overwhelming. Pearls are always fresh and chewy. The brown sugar series is also excellent. Only downside is the wait time during peak hours can be 15-20 minutes.',
    '456 Queen St W',
    43.6485,
    -79.3960
  ),
  (
    'The Roastery',
    'the-roastery',
    'cafe',
    NULL,
    4,
    'Cozy neighborhood cafe with excellent single-origin pour-overs. The space is warm and inviting with exposed brick and plenty of natural light. Their pastries are baked fresh daily — the almond croissant is a standout. Great spot for remote work with free wifi and ample outlets. Gets busy on weekend mornings.',
    '789 College St',
    43.6543,
    -79.4105
  ),
  (
    'Nonna Maria',
    'nonna-maria',
    'restaurant',
    'Italian',
    5,
    'Authentic Italian cuisine that transports you straight to Rome. The handmade pasta is incredible — try the cacio e pepe or the pappardelle with wild boar ragu. The tiramisu is the real deal. Warm, rustic atmosphere with attentive service. Reservations recommended on weekends.',
    '321 Dundas St W',
    43.6529,
    -79.3900
  ),
  (
    'Chai & Chill',
    'chai-and-chill',
    'cafe',
    NULL,
    3,
    'A decent cafe with a unique chai-focused menu. The masala chai latte is fragrant and well-spiced. The matcha options are good too. Food menu is limited but the sandwiches are fresh. The space can feel a bit cramped during lunch hours. Friendly staff though.',
    '55 Kensington Ave',
    43.6545,
    -79.4006
  ),
  (
    'Tiger Sugar',
    'tiger-sugar',
    'bubble_tea',
    NULL,
    5,
    'The brown sugar boba milk is absolutely legendary. Those caramelized tiger stripes running down the cup are not just for show — the flavor is incredible. Rich, creamy, with perfectly chewy tapioca pearls. They also have great cream mousse teas. Always a line but it moves fast and is worth the wait.',
    '200 Spadina Ave',
    43.6510,
    -79.3970
  );
