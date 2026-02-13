"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { CATEGORY_OPTIONS, RATING_OPTIONS } from "@/lib/constants";

interface FilterBarInnerProps {
  cuisineTypes: string[];
}

function FilterBarInner({ cuisineTypes }: FilterBarInnerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategories =
    searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const activeCuisine = searchParams.get("cuisine") ?? "";
  const activeRating = parseInt(searchParams.get("rating") ?? "0", 10);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("categories");
    } else {
      let categories: string[];
      if (activeCategories.includes(category)) {
        categories = activeCategories.filter((c) => c !== category);
      } else {
        categories = [...activeCategories, category];
      }

      if (categories.length === 0) {
        params.delete("categories");
      } else {
        params.set("categories", categories.join(","));
      }
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const isAllCategories = activeCategories.length === 0;

  const pillStyle = (isActive: boolean) => ({
    background: isActive
      ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)"
      : "var(--surface)",
    color: isActive ? "#fff" : "var(--muted)",
    border: isActive ? "1px solid transparent" : "1px solid var(--border)",
    boxShadow: isActive ? "0 2px 8px rgba(232, 93, 38, 0.25)" : "none",
  });

  return (
    <div className="space-y-3">
      {/* Category filter */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => {
            const isActive =
              option.value === "all"
                ? isAllCategories
                : activeCategories.includes(option.value);

            return (
              <button
                key={option.value}
                onClick={() => toggleCategory(option.value)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                style={pillStyle(isActive)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuisine type filter */}
      {cuisineTypes.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Cuisine
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParams("cuisine", "")}
              className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              style={pillStyle(!activeCuisine)}
            >
              All Cuisines
            </button>
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() =>
                  updateParams("cuisine", activeCuisine === cuisine ? "" : cuisine)
                }
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                style={pillStyle(activeCuisine === cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating filter */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Rating
        </p>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                updateParams("rating", option.value ? String(option.value) : "")
              }
              className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              style={pillStyle(
                option.value === 0
                  ? activeRating === 0
                  : activeRating === option.value
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FilterBarProps {
  cuisineTypes?: string[];
}

export default function FilterBar({ cuisineTypes = [] }: FilterBarProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <div className="flex gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="skeleton"
                style={{ height: 38, width: 96 }}
              />
            ))}
          </div>
        </div>
      }
    >
      <FilterBarInner cuisineTypes={cuisineTypes} />
    </Suspense>
  );
}
