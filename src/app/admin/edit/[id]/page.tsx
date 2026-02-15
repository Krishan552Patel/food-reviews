"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import RestaurantForm from "@/components/admin/RestaurantForm";
import DishManager from "@/components/admin/DishManager";
import Link from "next/link";
import type { Restaurant } from "@/lib/types";

export default function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/admin/restaurants/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        } else {
          setError("Restaurant not found");
        }
      } catch {
        setError("Failed to load restaurant");
      }
      setLoading(false);
    }
    fetchRestaurant();
  }, [id]);

  async function handleSubmit(data: Record<string, unknown>) {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update review");
      }
    } catch {
      setError("Something went wrong");
    }

    setIsSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-stone-500">Restaurant not found</p>
        <Link
          href="/admin"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-stone-900">
            Edit: {restaurant.name}
          </h1>
          <Link
            href="/admin"
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Restaurant Details Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <RestaurantForm
            initialData={restaurant}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Update Review"
          />
        </div>

        {/* Food & Drinks Section */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <DishManager restaurantId={restaurant.id} />
        </div>
      </div>
    </div>
  );
}
