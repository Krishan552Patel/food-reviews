"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DishReviewForm from "@/components/admin/DishReviewForm";
import Link from "next/link";
import type { Dish } from "@/lib/types";

type DishWithRestaurant = Dish & {
    restaurants?: { name: string; slug: string };
};

export default function EditDishPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [dish, setDish] = useState<DishWithRestaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDish() {
            try {
                const res = await fetch(`/api/admin/dishes/${id}`, {
                    credentials: "same-origin",
                });
                if (res.ok) {
                    const data = await res.json();
                    setDish(data);
                } else {
                    setError("Dish not found");
                }
            } catch {
                setError("Failed to load dish");
            }
            setLoading(false);
        }
        fetchDish();
    }, [id]);

    async function handleSubmit(data: Record<string, unknown>) {
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/dishes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const err = await res.json();
                setError(err.error || "Failed to update dish review");
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

    if (!dish) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-stone-500">{error || "Dish not found"}</p>
                <Link
                    href="/admin"
                    className="text-sm text-indigo-600 hover:underline"
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
                        Edit Dish Review
                    </h1>
                    <Link
                        href="/admin"
                        className="text-sm text-stone-500 hover:text-stone-700"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-3xl px-4 py-8">
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                    <DishReviewForm
                        initialData={dish}
                        onSubmit={handleSubmit}
                        isLoading={isSubmitting}
                        submitLabel="Save Changes"
                    />
                </div>
            </div>
        </div>
    );
}
