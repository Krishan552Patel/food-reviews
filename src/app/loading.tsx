export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px]"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
