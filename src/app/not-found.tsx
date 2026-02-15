import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-stone-900">
        Page not found
      </h2>
      <p className="mt-2 text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#020361] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a0c6e] transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
