import { createClient } from "@/lib/supabase/server";
import FilterBar from "@/components/FilterBar";
import RestaurantCard from "@/components/RestaurantCard";
import Link from "next/link";
import type { Restaurant } from "@/lib/types";

export const revalidate = 60;

interface HomeProps {
  searchParams: Promise<{ categories?: string; cuisine?: string; rating?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { categories, cuisine, rating } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (categories) {
    const categoryList = categories.split(",").filter(Boolean);
    if (categoryList.length > 0) {
      query = query.in("category", categoryList);
    }
  }

  if (cuisine) {
    query = query.ilike("cuisine_type", cuisine);
  }

  if (rating) {
    const minRating = parseInt(rating, 10);
    if (minRating >= 1 && minRating <= 5) {
      query = query.gte("rating", minRating);
    }
  }

  const { data: restaurants } = await query;
  const count = restaurants?.length ?? 0;

  // Fetch distinct cuisine types for the filter bar
  const { data: cuisineData } = await supabase
    .from("restaurants")
    .select("cuisine_type")
    .not("cuisine_type", "is", null)
    .order("cuisine_type");

  const cuisineTypes = [
    ...new Set(
      (cuisineData ?? [])
        .map((r: { cuisine_type: string | null }) => r.cuisine_type)
        .filter(Boolean) as string[]
    ),
  ];

  const hasFilters = !!(categories || cuisine || rating);

  return (
    <div>
      {/* Hero section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #eef0fa 0%, #e8ebf7 50%, #eef0fa 100%)",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(2,3,97,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: "var(--foreground)", lineHeight: 1.15 }}
            >
              Friends <span className="gradient-text">recommendation</span>
            </h1>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-12"
          style={{
            background: "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Filter + Count */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar cuisineTypes={cuisineTypes} />
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            {count} review{count !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid */}
        <div className="stagger-children mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(restaurants as Restaurant[] | null)?.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        {/* Empty state */}
        {count === 0 && (
          <div className="mt-20 flex flex-col items-center text-center animate-fade-in">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-glow)" }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "var(--accent)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <p
              className="mt-5 text-lg font-medium"
              style={{ color: "var(--foreground)" }}
            >
              No reviews found
            </p>
            <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
              Try adjusting your filters or browse all reviews
            </p>
            {hasFilters && (
              <Link
                href="/"
                className="gradient-accent mt-5 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-lg"
                style={{ boxShadow: "0 4px 14px rgba(2, 3, 97, 0.3)" }}
              >
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
