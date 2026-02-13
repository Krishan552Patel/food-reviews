export const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "restaurant", label: "Restaurants" },
  { value: "bubble_tea", label: "Bubble Tea" },
  { value: "cafe", label: "Cafes" },
] as const;

export const RATING_OPTIONS = [
  { value: 0, label: "Any Rating" },
  { value: 3, label: "3+ ★" },
  { value: 4, label: "4+ ★" },
  { value: 5, label: "5 ★" },
] as const;

export const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/restaurant-images`;

export const MAP_DEFAULT_CENTER: [number, number] = [43.65, -79.38]; // Toronto — adjust to your city
export const MAP_DEFAULT_ZOOM = 12;
