"use client";

import { useEffect, useState } from "react";

type AdminReview = {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  email: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
};
type Stats = { total: number; pending: number; approved: number; rejected: number; average: number };
type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: StatusFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];
const PER_PAGE = 20;

export function ReviewManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, average: 0 });
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [rating, setRating] = useState<number | "">("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AdminReview | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // bumped after an action to refetch

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Filter changes reset to page 1 (done in the handlers, not an effect).
  const changeStatus = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
  };
  const changeRating = (v: number | "") => {
    setRating(v);
    setPage(1);
  };
  const changeQuery = (v: string) => {
    setQ(v);
    setPage(1);
  };

  // Fetch on filter/page/reload change. All setState happens after the awaited
  // response (inside the async continuation), so no synchronous effect setState.
  useEffect(() => {
    let active = true;
    (async () => {
      const params = new URLSearchParams();
      params.set("status", status);
      if (rating) params.set("rating", String(rating));
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      params.set("page", String(page));
      params.set("perPage", String(PER_PAGE));
      try {
        const res = await fetch(`/api/admin/reviews?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (!active) return;
        setReviews(data.reviews || []);
        setStats(data.stats);
        setTotal(data.total || 0);
        setError("");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, rating, debouncedQ, page, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      reload();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function del(rv: AdminReview) {
    if (!confirm(`Delete the review by "${rv.customerName}"? This cannot be undone.`)) return;
    setBusy(rv.id);
    try {
      const res = await fetch(`/api/admin/reviews/${rv.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (viewing?.id === rv.id) setViewing(null);
      reload();
    } catch {
      setError("Delete failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-zinc-500">Moderate customer reviews. Approved reviews appear on the public site.</p>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} highlight={stats.pending > 0} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Rejected" value={stats.rejected} />
        <Stat label="Avg rating" value={stats.average ? stats.average.toFixed(1) : "—"} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                status === s ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
        <select
          value={rating}
          onChange={(e) => changeRating(e.target.value ? Number(e.target.value) : "")}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Any rating</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => changeQuery(e.target.value)}
          placeholder="Search name or text…"
          className="min-w-[180px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 font-semibold">Review</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-end font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">Loading…</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">No reviews found.</td></tr>
            ) : (
              reviews.map((rv) => (
                <tr key={rv.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-zinc-900">{rv.customerName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-amber-500">{"★".repeat(rv.rating)}<span className="text-zinc-300">{"★".repeat(5 - rv.rating)}</span></td>
                  <td className="max-w-xs px-4 py-3 text-zinc-600"><span className="line-clamp-2">{rv.reviewText}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{new Date(rv.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3"><StatusBadge status={rv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button onClick={() => setViewing(rv)} className="text-zinc-600 hover:underline">View</button>
                      {rv.status !== "APPROVED" && (
                        <button disabled={busy === rv.id} onClick={() => act(rv.id, "approve")} className="font-medium text-green-600 hover:underline disabled:opacity-50">Approve</button>
                      )}
                      {rv.status !== "REJECTED" && (
                        <button disabled={busy === rv.id} onClick={() => act(rv.id, "reject")} className="text-amber-600 hover:underline disabled:opacity-50">Reject</button>
                      )}
                      <button disabled={busy === rv.id} onClick={() => del(rv)} className="text-red-600 hover:underline disabled:opacity-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > PER_PAGE && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {viewing && <ViewModal review={viewing} onClose={() => setViewing(null)} onApprove={() => act(viewing.id, "approve")} onReject={() => act(viewing.id, "reject")} onDelete={() => del(viewing)} busy={busy === viewing.id} />}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-amber-300 bg-amber-50" : "border-zinc-200 bg-white"}`}>
      <div className={`text-2xl font-bold ${highlight ? "text-amber-700" : "text-zinc-900"}`}>{value}</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminReview["status"] }) {
  const map = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-zinc-200 text-zinc-600",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status.toLowerCase()}</span>;
}

function ViewModal({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
  busy,
}: {
  review: AdminReview;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{review.customerName}</h2>
            <p className="mt-1 text-amber-500">{"★".repeat(review.rating)}<span className="text-zinc-300">{"★".repeat(5 - review.rating)}</span></p>
          </div>
          <StatusBadge status={review.status} />
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{review.reviewText}</p>
        <dl className="mt-4 space-y-1 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
          <div className="flex justify-between"><dt>Submitted</dt><dd>{new Date(review.createdAt).toLocaleString("en-GB")}</dd></div>
          {review.approvedAt && <div className="flex justify-between"><dt>Approved</dt><dd>{new Date(review.approvedAt).toLocaleString("en-GB")}</dd></div>}
          <div className="flex justify-between"><dt>Email (private)</dt><dd>{review.email || "—"}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          {review.status !== "APPROVED" && <button disabled={busy} onClick={onApprove} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">Approve</button>}
          {review.status !== "REJECTED" && <button disabled={busy} onClick={onReject} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Reject</button>}
          <button disabled={busy} onClick={onDelete} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
          <button onClick={onClose} className="ms-auto rounded-lg border border-zinc-300 px-4 py-2 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
