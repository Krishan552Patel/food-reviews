"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length);
    },
    [images.length]
  );

  if (images.length === 0) return null;

  return (
    <>
      <div>
        {/* Main image */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative w-full aspect-video overflow-hidden rounded-xl cursor-zoom-in group"
          style={{ background: "#e4e6f0" }}
          aria-label="Open full-size image"
        >
          <Image
            src={images[activeIndex]}
            alt={`${name} photo ${activeIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />

          {/* Counter badge */}
          {images.length > 1 && (
            <span
              className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium text-white"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors z-10"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
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
