interface DishRatingBarProps {
    label: string;
    rating: number;
}

export default function DishRatingBar({ label, rating }: DishRatingBarProps) {
    const percentage = (rating / 5) * 100;

    return (
        <div className="flex items-center gap-3">
            <span
                className="w-16 text-sm font-medium"
                style={{ color: "#4a4c6d" }}
            >
                {label}
            </span>

            {/* Bar track */}
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#e4e6f0" }}>
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${percentage}%`,
                        background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)",
                    }}
                />
            </div>

            {/* Score */}
            <span className="w-8 text-right text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {rating}
                <span className="font-normal" style={{ color: "var(--muted)" }}>/5</span>
            </span>
        </div>
    );
}
