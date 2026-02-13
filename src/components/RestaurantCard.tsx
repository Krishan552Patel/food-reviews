import Image from "next/image";
import Link from "next/link";
import StarRating from "./StarRating";
import type { Restaurant } from "@/lib/types";
import { SUPABASE_STORAGE_URL } from "@/lib/constants";

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

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const imageUrl = restaurant.image_url
    ? `${SUPABASE_STORAGE_URL}/${restaurant.image_url}`
    : null;

  const style = categoryStyles[restaurant.category] || categoryStyles.restaurant;

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="card group block overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#f0ebe5" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-10 w-10"
              style={{ color: "var(--border)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
              />
            </svg>
          </div>
        )}

        {/* Gradient overlay for text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)",
          }}
        />

        {/* Category badge */}
        <div
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            color: style.text,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: style.dot }}
          />
          {categoryLabels[restaurant.category] || restaurant.category}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-4">
        <h3
          className="text-base font-semibold transition-colors duration-200"
          style={{ color: "var(--foreground)" }}
        >
          {restaurant.name}
        </h3>
        {restaurant.cuisine_type && (
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            {restaurant.cuisine_type}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between">
          <StarRating rating={restaurant.rating} size="sm" />
          <p
            className="truncate text-xs max-w-[55%] text-right"
            style={{ color: "var(--muted)" }}
          >
            {restaurant.address}
          </p>
        </div>

        {/* Review snippet */}
        {restaurant.review_text && (
          <p
            className="mt-3 line-clamp-2 text-sm leading-relaxed"
            style={{ color: "#78716c" }}
          >
            {restaurant.review_text}
          </p>
        )}
      </div>
    </Link>
  );
}
