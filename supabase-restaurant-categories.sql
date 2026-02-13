-- =============================================
-- Restaurant Category Ratings & Review Sections
-- Run in Supabase SQL Editor
-- =============================================

-- Category ratings (all nullable, 1-5 stars)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ambiance_rating SMALLINT CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cleanliness_rating SMALLINT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS service_rating SMALLINT CHECK (service_rating >= 1 AND service_rating <= 5);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS value_rating SMALLINT CHECK (value_rating >= 1 AND value_rating <= 5);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS wait_time_rating SMALLINT CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5);

-- Review sections (all nullable text)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_review TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS vibe_review TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_review TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tips TEXT;
