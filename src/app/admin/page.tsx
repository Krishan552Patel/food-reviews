"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Restaurant } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  bubble_tea: "Bubble Tea",
  cafe: "Cafe",
};



export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchRestaurants = useCallback(async (retries = 2) => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/restaurants", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      } else if (res.status === 401 && retries > 0) {
        await new Promise((r) => setTimeout(r, 300));
        setLoadingData(false);
        return fetchRestaurants(retries - 1);
      }
    } catch {
      // ignore
    }
    setLoadingData(false);
  }, []);



  // Check if already authenticated
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/admin/verify");
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          fetchRestaurants();
        }
      } catch {
        // ignore
      }
      setChecking(false);
    }
    check();
  }, [fetchRestaurants]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        setPassword("");
        fetchRestaurants();
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Something went wrong");
    }

    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setRestaurants([]);
  }

  async function handleDelete(id: string) {
    setDeleteError("");
    const url = `/api/admin/restaurants/${id}`;
    try {
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json();
      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirm(null);
      } else {
        setDeleteError(body.error || `Delete failed (${res.status})`);
        setDeleteConfirm(null);
      }
    } catch (e) {
      setDeleteError(`Network error: ${String(e)}`);
      setDeleteConfirm(null);
    }
  }



  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  // Login form
  if (!authenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">
              Admin Access
            </h1>
            <p className="mb-6 text-sm text-slate-500">
              Enter your password to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading || !password}
                className="w-full rounded-lg bg-[#020361] py-2.5 text-sm font-medium text-white hover:bg-[#0a0c6e] disabled:opacity-50 transition-colors"
              >
                {loginLoading ? "Checking..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div>
      {/* Admin header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-stone-900">Admin Panel</h1>
            <p className="text-xs text-stone-400">
              {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {deleteError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        )}

        {/* ===== RESTAURANT REVIEWS SECTION ===== */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            Restaurant Reviews
          </h2>
          <Link
            href="/admin/new"
            className="rounded-lg bg-[#020361] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a0c6e] transition-colors"
          >
            + Add Review
          </Link>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 py-12 text-center">
            <p className="text-stone-400">No reviews yet</p>
            <Link
              href="/admin/new"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Add your first review
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-600">
                    Name
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-stone-600 sm:table-cell">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-stone-600 sm:table-cell">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-stone-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-stone-900">
                          {r.name}
                        </span>
                        <span className="ml-2 text-xs text-stone-400 sm:hidden">
                          {categoryLabels[r.category]}
                        </span>
                      </div>
                      {r.cuisine_type && (
                        <span className="text-xs text-stone-400">
                          {r.cuisine_type}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-stone-600 sm:table-cell">
                      {categoryLabels[r.category]}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-indigo-400">
                        {"★".repeat(r.rating)}
                      </span>
                      <span className="text-slate-300">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/edit/${r.id}`}
                          className="rounded-md bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                          Edit
                        </Link>

                        {deleteConfirm === r.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-md bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(r.id)}
                            className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


      </div>
    </div>
  );
}
