"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
import type { Restaurant } from "@/lib/types";

interface MapViewProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

const categoryColors: Record<string, string> = {
  restaurant: "#020361",
  bubble_tea: "#14b8a6",
  cafe: "#6366f1",
};

export default function MapView({
  restaurants,
  center = MAP_DEFAULT_CENTER,
  zoom = MAP_DEFAULT_ZOOM,
  interactive = true,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [center[1], center[0]], // MapLibre uses [lng, lat]
      zoom: zoom,
      interactive: interactive,
    });

    if (interactive) {
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    // Add markers for each restaurant
    restaurants.forEach((r) => {
      const color = categoryColors[r.category] || "#020361";

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: "220px" }).setHTML(`
        <div style="text-align: center; padding: 4px 0;">
          <h3 style="font-weight: 700; font-size: 14px; color: #0a0c2e; margin: 0 0 4px 0;">
            ${r.name}
          </h3>
          <div style="color: #6366f1; font-size: 13px; margin-bottom: 6px;">
            ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
          </div>
          <a
            href="/restaurant/${r.slug}"
            style="color: #2d4de0; font-size: 13px; font-weight: 500; text-decoration: none;"
          >
            Read review →
          </a>
        </div>
      `);

      new maplibregl.Marker({ color })
        .setLngLat([r.longitude, r.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [restaurants, center, zoom, interactive]);

  return (
    <div
      ref={mapContainer}
      className="h-full w-full"
      style={{ borderRadius: "inherit" }}
    />
  );
}
