"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import StarPicker from "./StarPicker";
import { SUPABASE_STORAGE_URL } from "@/lib/constants";
import type { Dish, Restaurant } from "@/lib/types";

interface DishReviewFormProps {
    initialData?: Dish & { restaurants?: { name: string; slug: string } };
    restaurantId?: string;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    isLoading: boolean;
    submitLabel: string;
}

export default function DishReviewForm({
    initialData,
    restaurantId,
    onSubmit,
    isLoading,
    submitLabel,
}: DishReviewFormProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState(
        initialData?.restaurant_id || restaurantId || ""
    );
    const [name, setName] = useState(initialData?.name || "");
    const [reviewText, setReviewText] = useState(initialData?.review_text || "");
    const [foodRating, setFoodRating] = useState(initialData?.food_rating || 0);
    const [serviceRating, setServiceRating] = useState(
        initialData?.service_rating || 0
    );
    const [priceRating, setPriceRating] = useState(
        initialData?.price_rating || 0
    );
    const [existingImages, setExistingImages] = useState<string[]>(
        initialData?.images || []
    );
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch restaurants for dropdown
    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const res = await fetch("/api/admin/restaurants", {
                    credentials: "same-origin",
                });
                if (res.ok) {
                    const data = await res.json();
                    setRestaurants(data);
                }
            } catch {
                // ignore
            }
            setLoadingRestaurants(false);
        }
        fetchRestaurants();
    }, []);

    // Generate previews for new files
    useEffect(() => {
        const urls = newFiles.map((f) => URL.createObjectURL(f));
        setNewPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newFiles]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        setNewFiles((prev) => [...prev, ...files]);
    }

    function removeExistingImage(index: number) {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }

    function removeNewFile(index: number) {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function validate(): boolean {
        const newErrors: Record<string, string> = {};

        if (!selectedRestaurant) newErrors.restaurant = "Restaurant is required";
        if (!name.trim()) newErrors.name = "Dish name is required";
        if (!reviewText.trim()) newErrors.reviewText = "Review text is required";
        if (!foodRating) newErrors.foodRating = "Food rating is required";
        if (!serviceRating) newErrors.serviceRating = "Service rating is required";
        if (!priceRating) newErrors.priceRating = "Price rating is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setUploading(true);

        // Upload new images
        const uploadedPaths: string[] = [];
        for (const file of newFiles) {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                setErrors({ upload: err.error || "Image upload failed" });
                setUploading(false);
                return;
            }

            const { path } = await uploadRes.json();
            uploadedPaths.push(path);
        }

        const allImages = [...existingImages, ...uploadedPaths];

        setUploading(false);

        await onSubmit({
            restaurant_id: selectedRestaurant,
            name,
            review_text: reviewText,
            food_rating: foodRating,
            service_rating: serviceRating,
            price_rating: priceRating,
            images: allImages,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Selector */}
            <div>
                <label className="block text-sm font-medium text-stone-700">
                    Restaurant *
                </label>
                {loadingRestaurants ? (
                    <div className="mt-1 h-10 animate-pulse rounded-lg bg-stone-100" />
                ) : (
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        disabled={!!restaurantId || !!initialData}
                    >
                        <option value="">Select a restaurant...</option>
                        {restaurants.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                )}
                {errors.restaurant && (
                    <p className="mt-1 text-sm text-red-600">{errors.restaurant}</p>
                )}
            </div>

            {/* Dish Name */}
            <div>
                <label className="block text-sm font-medium text-stone-700">
                    Dish Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Tonkotsu Ramen, Taro Milk Tea"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            {/* Ratings */}
            <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <h3 className="text-sm font-semibold text-stone-700">Ratings</h3>

                {/* Food Rating */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                        <span className="text-lg">🍽️</span> Food
                    </label>
                    <div>
                        <StarPicker value={foodRating} onChange={setFoodRating} />
                    </div>
                </div>
                {errors.foodRating && (
                    <p className="text-sm text-red-600">{errors.foodRating}</p>
                )}

                {/* Service Rating */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                        <span className="text-lg">🙋</span> Service
                    </label>
                    <div>
                        <StarPicker value={serviceRating} onChange={setServiceRating} />
                    </div>
                </div>
                {errors.serviceRating && (
                    <p className="text-sm text-red-600">{errors.serviceRating}</p>
                )}

                {/* Price Rating */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                        <span className="text-lg">💰</span> Price
                    </label>
                    <div>
                        <StarPicker value={priceRating} onChange={setPriceRating} />
                    </div>
                </div>
                {errors.priceRating && (
                    <p className="text-sm text-red-600">{errors.priceRating}</p>
                )}
            </div>

            {/* Review Text */}
            <div>
                <label className="block text-sm font-medium text-stone-700">
                    Review *
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Describe the dish, flavors, presentation..."
                />
                {errors.reviewText && (
                    <p className="mt-1 text-sm text-red-600">{errors.reviewText}</p>
                )}
            </div>

            {/* Food Photos */}
            <div>
                <label className="block text-sm font-medium text-stone-700">
                    Food Photos
                </label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {existingImages.map((img, i) => (
                            <div key={`existing-${i}`} className="group relative">
                                <div className="relative h-20 w-24 overflow-hidden rounded-lg bg-stone-100">
                                    <Image
                                        src={`${SUPABASE_STORAGE_URL}/${img}`}
                                        alt={`Photo ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(i)}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* New file previews */}
                {newPreviews.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {newPreviews.map((src, i) => (
                            <div key={`new-${i}`} className="group relative">
                                <div className="relative h-20 w-24 overflow-hidden rounded-lg bg-slate-100 ring-2 ring-indigo-300">
                                    <Image
                                        src={src}
                                        alt={`New photo ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-stone-400">
                    JPEG, PNG, WebP, or GIF. Max 5MB each. You can select multiple files.
                </p>
                {errors.upload && (
                    <p className="mt-1 text-sm text-red-600">{errors.upload}</p>
                )}
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    type="submit"
                    disabled={isLoading || uploading}
                    className="rounded-lg bg-[#020361] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#0a0c6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading
                        ? "Uploading photos..."
                        : isLoading
                            ? "Saving..."
                            : submitLabel}
                </button>
                <a
                    href="/admin"
                    className="text-sm text-stone-500 hover:text-stone-700"
                >
                    Cancel
                </a>
            </div>
        </form>
    );
}
