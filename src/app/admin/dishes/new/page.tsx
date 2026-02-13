"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DishReviewForm from "@/components/admin/DishReviewForm";
import Link from "next/link";

export default function NewDishPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(data: Record<string, unknown>) {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/dishes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                const err = await res.json();
                setError(err.error || "Failed to create dish review");
            }
        } catch {
            setError("Something went wrong");
        }

        setIsLoading(false);
    }

    return (
        <div>
            {/* Header */}
            <div className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-bold text-stone-900">
                        Add Dish Review
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
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        submitLabel="Add Dish Review"
                    />
                </div>
            </div>
        </div>
    );
}
