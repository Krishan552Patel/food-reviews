export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: "restaurant" | "bubble_tea" | "cafe";
  cuisine_type: string | null;
  rating: number;
  review_text: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  images: string[];
  // Category ratings (nullable, 1-5)
  ambiance_rating: number | null;
  cleanliness_rating: number | null;
  service_rating: number | null;
  value_rating: number | null;
  wait_time_rating: number | null;
  // Review sections (nullable)
  menu_review: string | null;
  vibe_review: string | null;
  location_review: string | null;
  tips: string | null;
  created_at: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  review_text: string;
  food_rating: number;
  images: string[];
  created_at: string;
}

export interface RestaurantWithDishes extends Restaurant {
  dishes: Dish[];
}
