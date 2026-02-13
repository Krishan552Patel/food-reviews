"use client";

import dynamic from "next/dynamic";
import type { Restaurant } from "@/lib/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "#f0ebe5" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px]"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Loading map...
        </p>
      </div>
    </div>
  ),
});

interface MapDynamicProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

export default function MapDynamic(props: MapDynamicProps) {
  return <MapView {...props} />;
}
