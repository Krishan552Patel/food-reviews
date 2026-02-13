"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import StarPicker from "./StarPicker";
import { SUPABASE_STORAGE_URL } from "@/lib/constants";
import type { Restaurant } from "@/lib/types";

interface RestaurantFormProps {
  initialData?: Restaurant;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function RestaurantForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}: RestaurantFormProps) {
  // Basic fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState<string>(
    initialData?.category || "restaurant"
  );
  const [cuisineType, setCuisineType] = useState(initialData?.cuisine_type || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [reviewText, setReviewText] = useState(initialData?.review_text || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url ? `${SUPABASE_STORAGE_URL}/${initialData.image_url}` : null
  );
  const [autoSlug, setAutoSlug] = useState(!initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Category ratings (all optional)
  const [ambianceRating, setAmbianceRating] = useState(initialData?.ambiance_rating || 0);
  const [cleanlinessRating, setCleanlinessRating] = useState(initialData?.cleanliness_rating || 0);
  const [serviceRating, setServiceRating] = useState(initialData?.service_rating || 0);
  const [valueRating, setValueRating] = useState(initialData?.value_rating || 0);
  const [waitTimeRating, setWaitTimeRating] = useState(initialData?.wait_time_rating || 0);

  // Review sections (all optional)
  const [menuReview, setMenuReview] = useState(initialData?.menu_review || "");
  const [vibeReview, setVibeReview] = useState(initialData?.vibe_review || "");
  const [locationReview, setLocationReview] = useState(initialData?.location_review || "");
  const [tips, setTips] = useState(initialData?.tips || "");

  // Geocoding state
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showGeoResults, setShowGeoResults] = useState(false);
  const geoTimeout = useRef<NodeJS.Timeout | null>(null);
  const geoRef = useRef<HTMLDivElement>(null);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug) setSlug(slugify(name));
  }, [name, autoSlug]);

  // Image preview
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Close geo results when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) {
        setShowGeoResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const geocodeAddress = useCallback(async (query: string) => {
    if (query.length < 3) { setGeoResults([]); setShowGeoResults(false); return; }
    setGeoLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({ q: query, format: "json", addressdetails: "1", limit: "5" }),
        { headers: { "Accept-Language": "en" } }
      );
      const data: GeoResult[] = await res.json();
      setGeoResults(data);
      setShowGeoResults(data.length > 0);
    } catch { setGeoResults([]); }
    finally { setGeoLoading(false); }
  }, []);

  function handleAddressChange(value: string) {
    setAddress(value);
    if (geoTimeout.current) clearTimeout(geoTimeout.current);
    geoTimeout.current = setTimeout(() => geocodeAddress(value), 400);
  }

  function selectGeoResult(result: GeoResult) {
    setAddress(result.display_name);
    setLatitude(result.lat);
    setLongitude(result.lon);
    setShowGeoResults(false);
    setGeoResults([]);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(slug))
      newErrors.slug = "Slug must be lowercase letters, numbers, and hyphens";
    if (!rating) newErrors.rating = "Rating is required";
    if (!reviewText.trim()) newErrors.reviewText = "Review text is required";
    if (!address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    let imageUrl = initialData?.image_url || null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setErrors({ image: err.error || "Image upload failed" });
        return;
      }
      const { path } = await uploadRes.json();
      imageUrl = path;
    }

    await onSubmit({
      name,
      slug,
      category,
      cuisine_type: cuisineType || null,
      rating,
      review_text: reviewText,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      image_url: imageUrl,
      // Category ratings (send null if not set)
      ambiance_rating: ambianceRating || null,
      cleanliness_rating: cleanlinessRating || null,
      service_rating: serviceRating || null,
      value_rating: valueRating || null,
      wait_time_rating: waitTimeRating || null,
      // Review sections (send null if empty)
      menu_review: menuReview.trim() || null,
      vibe_review: vibeReview.trim() || null,
      location_review: locationReview.trim() || null,
      tips: tips.trim() || null,
    });
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ==================== BASIC INFO ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
          Basic Info
        </legend>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className={inputClass} placeholder="e.g. Sakura Kitchen" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Slug */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700">URL Slug *</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="text" value={slug}
              onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="sakura-kitchen" />
            {!autoSlug && (
              <button type="button"
                onClick={() => { setAutoSlug(true); setSlug(slugify(name)); }}
                className="whitespace-nowrap rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600 hover:bg-stone-200">
                Auto
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-400">/restaurant/{slug || "..."}</p>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        </div>

        {/* Category + Cuisine */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="restaurant">Restaurant</option>
              <option value="bubble_tea">Bubble Tea</option>
              <option value="cafe">Cafe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Cuisine Type</label>
            <input type="text" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)}
              className={inputClass} placeholder="e.g. Japanese, Italian" />
          </div>
        </div>
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== OVERALL RATING ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
          Overall Rating
        </legend>

        <div>
          <label className="block text-sm font-medium text-stone-700">Overall Rating *</label>
          <div className="mt-1"><StarPicker value={rating} onChange={setRating} /></div>
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
        </div>
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== CATEGORY RATINGS ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-1">
          Category Ratings
        </legend>
        <p className="text-xs text-stone-400 mb-4">Optional — rate specific aspects of this place</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Ambiance</label>
            <div className="mt-1"><StarPicker value={ambianceRating} onChange={setAmbianceRating} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Cleanliness</label>
            <div className="mt-1"><StarPicker value={cleanlinessRating} onChange={setCleanlinessRating} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Service</label>
            <div className="mt-1"><StarPicker value={serviceRating} onChange={setServiceRating} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Value for Money</label>
            <div className="mt-1"><StarPicker value={valueRating} onChange={setValueRating} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Wait Time</label>
            <div className="mt-1"><StarPicker value={waitTimeRating} onChange={setWaitTimeRating} /></div>
          </div>
        </div>
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== REVIEW TEXT ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
          Review
        </legend>

        <div>
          <label className="block text-sm font-medium text-stone-700">Main Review *</label>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
            rows={5} className={inputClass} placeholder="Your overall thoughts on this place..." />
          {errors.reviewText && <p className="mt-1 text-sm text-red-600">{errors.reviewText}</p>}
        </div>
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== REVIEW SECTIONS ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-1">
          Detailed Sections
        </legend>
        <p className="text-xs text-stone-400 mb-4">Optional — add detailed reviews for specific aspects</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">The Menu / Food</label>
            <textarea value={menuReview} onChange={(e) => setMenuReview(e.target.value)}
              rows={3} className={inputClass} placeholder="What did you order? How was the menu variety?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">The Vibe / Atmosphere</label>
            <textarea value={vibeReview} onChange={(e) => setVibeReview(e.target.value)}
              rows={3} className={inputClass} placeholder="What's the atmosphere like? Cozy, busy, romantic?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">The Location</label>
            <textarea value={locationReview} onChange={(e) => setLocationReview(e.target.value)}
              rows={3} className={inputClass} placeholder="Easy to find? Parking available? Near transit?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Worth Knowing</label>
            <textarea value={tips} onChange={(e) => setTips(e.target.value)}
              rows={3} className={inputClass} placeholder="Tips, tricks, or things to be aware of..." />
          </div>
        </div>
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== ADDRESS ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
          Location
        </legend>

        {/* Address with geocoding */}
        <div ref={geoRef} className="relative mb-4">
          <label className="block text-sm font-medium text-stone-700">Address *</label>
          <div className="relative mt-1">
            <input type="text" value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => { if (geoResults.length > 0) setShowGeoResults(true); }}
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 pr-10 text-stone-900 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Start typing an address..." />
            {geoLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
              </div>
            )}
          </div>
          {showGeoResults && geoResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg"
              style={{ borderColor: "var(--border)" }}>
              {geoResults.map((result, i) => (
                <button key={i} type="button" onClick={() => selectGeoResult(result)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-stone-50">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--accent)" }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <span className="text-stone-700 leading-snug">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-stone-400">Type an address and select from suggestions</p>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* Coordinates are auto-filled from address selection */}
        {latitude && longitude && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Map coordinates set ({Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)})
          </p>
        )}
      </fieldset>

      <hr className="border-stone-200" />

      {/* ==================== IMAGE ==================== */}
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
          Photo
        </legend>
        <div>
          {imagePreview && (
            <div className="relative mb-3 aspect-video w-full max-w-sm overflow-hidden rounded-lg bg-stone-100">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="400px" />
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-orange-700 hover:file:bg-orange-100" />
          <p className="mt-1 text-xs text-stone-400">JPEG, PNG, WebP, or GIF. Max 5MB.</p>
        </div>
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
      </fieldset>

      {/* ==================== SUBMIT ==================== */}
      <div className="flex items-center gap-4 pt-4">
        <button type="submit" disabled={isLoading}
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isLoading ? "Saving..." : submitLabel}
        </button>
        <a href="/admin" className="text-sm text-stone-500 hover:text-stone-700">Cancel</a>
      </div>
    </form>
  );
}
