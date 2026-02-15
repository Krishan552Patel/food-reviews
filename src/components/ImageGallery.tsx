"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";

interface ImageGalleryProps {
  images: string[];
  name: string;
  autoSlideInterval?: number; // ms, default 5000
}

export default function ImageGallery({ images, name, autoSlideInterval = 5000 }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-slide logic
  useEffect(() => {
    if (images.length <= 1 || lightboxOpen || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, autoSlideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, lightboxOpen, isPaused, autoSlideInterval]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") { setActiveIndex((i) => (i + 1) % images.length); setIsPaused(true); }
      if (e.key === "ArrowLeft") { setActiveIndex((i) => (i - 1 + images.length) % images.length); setIsPaused(true); }
    },
    [images.length]
  );

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  }, []);

  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
    setIsPaused(true);
  }, [images.length]);

  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
    setIsPaused(true);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main image */}
        <div className="relative w-full aspect-video overflow-hidden rounded-xl" style={{ background: "#e4e6f0" }}>
          <button
            onClick={() => setLightboxOpen(true)}
            className="relative w-full h-full cursor-zoom-in group block"
            aria-label="Open full-size image"
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} photo ${activeIndex + 1}`}
              fill
              className="object-cover transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </button>

          {/* Nav arrows on main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
                aria-label="Previous image"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
                aria-label="Next image"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Counter badge */}
          {images.length > 1 && (
            <span
              className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium text-white z-10"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              {activeIndex + 1} / {images.length}
            </span>
          )}

          {/* Progress dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === activeIndex ? "white" : "rgba(255,255,255,0.5)",
                  }}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200"
                style={{
                  border: i === activeIndex ? "2px solid var(--accent)" : "2px solid transparent",
                  opacity: i === activeIndex ? 1 : 0.6,
                }}
              >
                <Image
                  src={src}
                  alt={`${name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors z-10"
            style={{ background: "rgba(255,255,255,0.1)" }}
            aria-label="Close lightbox"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(e); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors z-10"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(e); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors z-10"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Next image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="lightbox-image relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} photo ${activeIndex + 1}`}
              width={1200}
              height={800}
              className="rounded-lg object-contain"
              style={{ maxHeight: "85vh", width: "auto" }}
              sizes="90vw"
            />

            {/* Counter */}
            {images.length > 1 && (
              <p className="mt-3 text-center text-sm text-white/60">
                {activeIndex + 1} of {images.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
