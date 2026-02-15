"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import StarPicker from "./StarPicker";
import { SUPABASE_STORAGE_URL } from "@/lib/constants";
import type { Dish } from "@/lib/types";

interface DishManagerProps {
    restaurantId: string;
}

interface DishWithMeta extends Dish {
    restaurants?: { name: string };
}

export default function DishManager({ restaurantId }: DishManagerProps) {
    const [dishes, setDishes] = useState<DishWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDish, setEditingDish] = useState<DishWithMeta | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [foodRating, setFoodRating] = useState(0);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch dishes for this restaurant
    useEffect(() => {
        fetchDishes();
    }, [restaurantId]);

    async function fetchDishes() {
        try {
            const res = await fetch(`/api/admin/dishes?restaurant_id=${restaurantId}`, {
                credentials: "same-origin",
            });
            if (res.ok) {
                const data = await res.json();
                setDishes(data);
            }
        } catch {
            // ignore
        }
        setLoading(false);
    }

    // Generate previews for new files
    useEffect(() => {
        const urls = newFiles.map((f) => URL.createObjectURL(f));
        setNewPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newFiles]);

    function resetForm() {
        setName("");
        setReviewText("");
        setFoodRating(0);
        setExistingImages([]);
        setNewFiles([]);
        setNewPreviews([]);
        setErrors({});
        setEditingDish(null);
        setShowForm(false);
    }

    function startEdit(dish: DishWithMeta) {
        setEditingDish(dish);
        setName(dish.name);
        setReviewText(dish.review_text);
        setFoodRating(dish.food_rating);
        setExistingImages(dish.images || []);
        setNewFiles([]);
        setNewPreviews([]);
        setErrors({});
        setShowForm(true);
    }

    function startAdd() {
        resetForm();
        setShowForm(true);
    }

    function validate(): boolean {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!reviewText.trim()) newErrors.reviewText = "Review is required";
        if (!foodRating) newErrors.foodRating = "Food rating is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);

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
                setSaving(false);
                return;
            }
            const { path } = await uploadRes.json();
            uploadedPaths.push(path);
        }

        const allImages = [...existingImages, ...uploadedPaths];
        const payload = {
            restaurant_id: restaurantId,
            name,
            review_text: reviewText,
            food_rating: foodRating,
            images: allImages,
        };

        try {
            const url = editingDish
                ? `/api/admin/dishes/${editingDish.id}`
                : "/api/admin/dishes";
            const method = editingDish ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                fetchDishes();
            } else {
                const err = await res.json();
                setErrors({ submit: err.error || "Failed to save" });
            }
        } catch {
            setErrors({ submit: "Something went wrong" });
        }

        setSaving(false);
    }

    async function handleDelete(dishId: string) {
        try {
            const res = await fetch(`/api/admin/dishes/${dishId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDeleteConfirm(null);
                fetchDishes();
            }
        } catch {
            // ignore
        }
    }

    const inputClass =
        "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900">Food & Drinks</h2>
                {!showForm && (
                    <button
                        type="button"
                        onClick={startAdd}
                        className="rounded-lg bg-[#020361] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a0c6e] transition-colors"
                    >
                        + Add Item
                    </button>
                )}
            </div>

            {/* Existing dishes list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100" />
                    ))}
                </div>
            ) : dishes.length === 0 && !showForm ? (
                <div className="rounded-xl border border-dashed border-stone-300 py-10 text-center">
                    <p className="text-stone-400 text-sm">No food or drinks reviewed yet</p>
                    <button
                        type="button"
                        onClick={startAdd}
                        className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
                    >
                        Add your first item
                    </button>
                </div>
            ) : (
                !showForm && (
                    <div className="space-y-3">
                        {dishes.map((dish) => (
                            <div
                                key={dish.id}
                                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:bg-stone-50"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {dish.images && dish.images.length > 0 && (
                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                                            <Image
                                                src={`${SUPABASE_STORAGE_URL}/${dish.images[0]}`}
                                                alt={dish.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-stone-900 truncate">{dish.name}</p>
                                        <p className="text-xs text-stone-400 mt-0.5">
                                            Food Rating: {dish.food_rating}/5
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(dish)}
                                        className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    {deleteConfirm === dish.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(dish.id)}
                                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteConfirm(null)}
                                                className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirm(dish.id)}
                                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-5 rounded-xl border border-stone-200 bg-white p-5"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-stone-700">
                            {editingDish ? `Edit: ${editingDish.name}` : "Add Food or Drink"}
                        </h3>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-xs text-stone-400 hover:text-stone-600"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Tonkotsu Ramen, Taro Milk Tea"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Rating */}
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rating</p>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-600">Food Rating</label>
                            <StarPicker value={foodRating} onChange={setFoodRating} />
                        </div>
                        {errors.foodRating && <p className="text-sm text-red-600">{errors.foodRating}</p>}
                    </div>

                    {/* Review */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Review *</label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            className={inputClass}
                            placeholder="Describe the dish, flavors, presentation..."
                        />
                        {errors.reviewText && <p className="mt-1 text-sm text-red-600">{errors.reviewText}</p>}
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Photos</label>

                        {/* Existing images */}
                        {existingImages.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {existingImages.map((img, i) => (
                                    <div key={`existing-${i}`} className="group relative">
                                        <div className="relative h-16 w-20 overflow-hidden rounded-lg bg-stone-100">
                                            <Image
                                                src={`${SUPABASE_STORAGE_URL}/${img}`}
                                                alt={`Photo ${i + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
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
                                        <div className="relative h-16 w-20 overflow-hidden rounded-lg bg-slate-100 ring-2 ring-indigo-300">
                                            <Image
                                                src={src}
                                                alt={`New photo ${i + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
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
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setNewFiles((prev) => [...prev, ...files]);
                            }}
                            className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.upload && <p className="mt-1 text-sm text-red-600">{errors.upload}</p>}
                    </div>

                    {errors.submit && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errors.submit}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#020361] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0a0c6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? "Saving..." : editingDish ? "Update Item" : "Add Item"}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-stone-500 hover:text-stone-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
