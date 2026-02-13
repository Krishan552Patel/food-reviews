import { createClient } from "@/lib/supabase/server";
import MapDynamic from "@/components/MapDynamic";
import type { Restaurant } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map — FoodReviews",
  description:
    "Find all reviewed restaurants, bubble tea shops, and cafes on the map",
};

export const revalidate = 60;

export default async function MapPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, category, rating, latitude, longitude");

  const count = restaurants?.length ?? 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 57px)" }}>
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Reviewed Places
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Click a marker to see the review
            </p>
          </div>
          <span
            className="rounded-full px-3.5 py-1.5 text-sm font-medium"
            style={{
              background: "var(--accent-glow)",
              color: "var(--accent)",
            }}
          >
            {count} place{count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapDynamic restaurants={(restaurants as Restaurant[]) ?? []} />
      </div>
    </div>
  );
}
