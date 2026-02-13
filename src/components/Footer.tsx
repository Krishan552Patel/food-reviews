import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: "linear-gradient(180deg, #1f1c19 0%, #171411 100%)",
      }}
    >
      {/* Gradient top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent), transparent)",
          opacity: 0.3,
        }}
      />

      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md font-bold text-white text-xs"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)",
                }}
              >
                FR
              </span>
              <span className="text-base font-semibold text-stone-200">
                Food<span style={{ color: "var(--accent-light)" }}>Reviews</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              Honest reviews of the best restaurants, bubble tea shops, and cafes
              — reviewed one dish at a time.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Explore
              </h4>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-sm text-stone-400 transition-colors hover:text-stone-200"
                >
                  All Reviews
                </Link>
                <Link
                  href="/map"
                  className="text-sm text-stone-400 transition-colors hover:text-stone-200"
                >
                  Map View
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 border-t pt-6"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} FoodReviews. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
