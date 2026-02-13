import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import StarRating from "@/components/StarRating";
import ImageGallery from "@/components/ImageGallery";
import DishRatingBar from "@/components/DishRatingBar";
import MapDynamic from "@/components/MapDynamic";
import { SUPABASE_STORAGE_URL } from "@/lib/constants";
import type { Restaurant, Dish } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  bubble_tea: "Bubble Tea",
  cafe: "Cafe",
};

const categoryStyles: Record<string, { bg: string; text: string; dot: string }> = {
  restaurant: { bg: "rgba(232, 93, 38, 0.08)", text: "#c44b1a", dot: "#e85d26" },
  bubble_tea: { bg: "rgba(147, 51, 234, 0.08)", text: "#7c3aed", dot: "#9333ea" },
  cafe: { bg: "rgba(202, 138, 4, 0.08)", text: "#a16207", dot: "#ca8a04" },
};

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("restaurants").select("slug");
    return (data ?? []).map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("name, review_text")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Not Found" };

  return {
    title: `${data.name} — FoodReviews`,
    description: data.review_text.substring(0, 160),
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurant) notFound();

  const typedRestaurant = restaurant as Restaurant;

  // Fetch dishes for this restaurant
  const { data: dishesData } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", typedRestaurant.id)
    .order("created_at", { ascending: false });

  const dishes = (dishesData as Dish[] | null) || [];

  const images = typedRestaurant.image_url
    ? [`${SUPABASE_STORAGE_URL}/${typedRestaurant.image_url}`]
    : [];

  const style = categoryStyles[typedRestaurant.category] || categoryStyles.restaurant;

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <div className="mx-auto max-w-4xl px-5 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors text-stone-400 hover:text-stone-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All reviews
        </Link>
      </div>

      {/* Image section */}
      <div className="mx-auto max-w-4xl px-5 pt-6">
        {images.length > 0 && (
          <ImageGallery images={images} name={typedRestaurant.name} />
        )}
      </div>

      {/* Restaurant info card */}
      <div className="mx-auto max-w-4xl px-5 pt-8">
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: style.bg, color: style.text }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: style.dot }}
              />
              {categoryLabels[typedRestaurant.category] || typedRestaurant.category}
            </span>
            {typedRestaurant.cuisine_type && (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {typedRestaurant.cuisine_type}
              </span>
            )}
          </div>

          <h1
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--foreground)" }}
          >
            {typedRestaurant.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={typedRestaurant.rating} size="lg" />
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {typedRestaurant.rating} / 5
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <svg
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              style={{ color: "var(--muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z"
              />
            </svg>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {typedRestaurant.address}
            </p>
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="mx-auto max-w-4xl px-5 pt-8">
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Review
        </h2>
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div
            className="whitespace-pre-line leading-relaxed"
            style={{ color: "#57534e" }}
          >
            {typedRestaurant.review_text}
          </div>
          <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
            Reviewed on{" "}
            {new Date(typedRestaurant.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Category Ratings */}
      {(typedRestaurant.ambiance_rating ||
        typedRestaurant.cleanliness_rating ||
        typedRestaurant.service_rating ||
        typedRestaurant.value_rating ||
        typedRestaurant.wait_time_rating) && (
          <div className="mx-auto max-w-4xl px-5 pt-8">
            <h2
              className="mb-4 text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Ratings Breakdown
            </h2>
            <div
              className="rounded-2xl p-6 sm:p-8 space-y-3"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              {[
                { label: "Ambiance", value: typedRestaurant.ambiance_rating },
                { label: "Cleanliness", value: typedRestaurant.cleanliness_rating },
                { label: "Service", value: typedRestaurant.service_rating },
                { label: "Value for Money", value: typedRestaurant.value_rating },
                { label: "Wait Time", value: typedRestaurant.wait_time_rating },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <DishRatingBar
                    key={item.label}
                    label={item.label}
                    rating={item.value!}
                  />
                ))}
            </div>
          </div>
        )}

      {/* Review Sections */}
      {(typedRestaurant.menu_review ||
        typedRestaurant.vibe_review ||
        typedRestaurant.location_review ||
        typedRestaurant.tips) && (
          <div className="mx-auto max-w-4xl px-5 pt-8">
            <div className="space-y-6">
              {[
                { title: "The Menu / Food", content: typedRestaurant.menu_review },
                { title: "The Vibe", content: typedRestaurant.vibe_review },
                { title: "The Location", content: typedRestaurant.location_review },
                { title: "Worth Knowing", content: typedRestaurant.tips },
              ]
                .filter((section) => section.content)
                .map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl p-6 sm:p-8"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <h3
                      className="mb-3 text-base font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {section.title}
                    </h3>
                    <p
                      className="whitespace-pre-line leading-relaxed"
                      style={{ color: "#57534e" }}
                    >
                      {section.content}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* ===== FOOD & DRINKS SECTION ===== */}
      {dishes.length > 0 && (
        <div className="mx-auto max-w-4xl px-5 pt-12">
          <h2
            className="mb-6 text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Food & Drinks
          </h2>
          <div className="stagger-children space-y-6">
            {dishes.map((dish) => {
              const dishImages = (dish.images || []).map(
                (img) => `${SUPABASE_STORAGE_URL}/${img}`
              );

              return (
                <div
                  key={dish.id}
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  {/* Dish photos */}
                  {dishImages.length > 0 && (
                    <div className="p-4 sm:p-6 pb-0 sm:pb-0">
                      <ImageGallery images={dishImages} name={dish.name} />
                    </div>
                  )}

                  {/* Dish info */}
                  <div className="p-6 sm:p-8">
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {dish.name}
                    </h3>

                    {/* Rating breakdown */}
                    <div
                      className="mt-5 space-y-3 rounded-xl p-5"
                      style={{ background: "#faf8f6", border: "1px solid var(--border-light)" }}
                    >
                      <DishRatingBar label="Food" rating={dish.food_rating} />
                      <DishRatingBar label="Service" rating={dish.service_rating} />
                      <DishRatingBar label="Price" rating={dish.price_rating} />
                    </div>

                    {/* Review text */}
                    <p
                      className="mt-5 whitespace-pre-line leading-relaxed"
                      style={{ color: "#78716c" }}
                    >
                      {dish.review_text}
                    </p>

                    <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
                      Reviewed on{" "}
                      {new Date(dish.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="mx-auto max-w-4xl px-5 pt-12 pb-12">
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Location
        </h2>
        <div
          className="h-64 overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--border)" }}
        >
          <MapDynamic
            restaurants={[typedRestaurant]}
            center={[typedRestaurant.latitude, typedRestaurant.longitude]}
            zoom={16}
            interactive={false}
          />
        </div>
      </div>
    </div>
  );
}
