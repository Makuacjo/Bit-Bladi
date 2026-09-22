"use client";

import { useEffect, useState } from "react";

type Res = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  guestCount: number;
  specialRequests: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  preferredLanguage: string;
  assignedTable: string;
  emailStatus: string;
  whatsappStatus: string;
  createdAt: string;
};
type Stats = { total: number; pending: number; confirmed: number; cancelled: number; rejected: number; completed: number; noShow: number };
type StatusFilter = "ALL" | Res["status"];

const TABS: StatusFilter[] = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED", "REJECTED"];
const PER_PAGE = 20;

// Which actions are offered for each current status (mirrors server transitions).
const ACTIONS: Record<string, { action: string; label: string; tone: "gold" | "green" | "amber" | "red" | "zinc" }[]> = {
  PENDING: [
    { action: "confirm", label: "Confirm", tone: "green" },
    { action: "reject", label: "Reject", tone: "amber" },
    { action: "cancel", label: "Cancel", tone: "zinc" },
  ],
  CONFIRMED: [
    { action: "complete", label: "Completed", tone: "green" },
    { action: "no_show", label: "No-show", tone: "red" },
    { action: "cancel", label: "Cancel", tone: "zinc" },
  ],
};

export function ReservationManager() {
  const [rows, setRows] = useState<Res[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, rejected: 0, completed: 0, noShow: 0 });
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [dateFilter, setDateFilter] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Res | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const changeStatus = (s: StatusFilter) => { setStatus(s); setPage(1); };
  const changeDate = (v: string) => { setDateFilter(v); setPage(1); };
  const changeQuery = (v: string) => { setQ(v); setPage(1); };

  useEffect(() => {
    let active = true;
    (async () => {
      const params = new URLSearchParams();
      params.set("status", status);
      if (dateFilter) params.set("date", dateFilter);
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      params.set("page", String(page));
      params.set("perPage", String(PER_PAGE));
      try {
        const res = await fetch(`/api/admin/reservations?${params}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reservations");
        const data = await res.json();
        if (!active) return;
        setRows(data.reservations || []);
        setStats(data.stats);
        setTotal(data.total || 0);
        setError("");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [status, dateFilter, debouncedQ, page, reloadKey]);

  const reload = () => { setLoading(true); setReloadKey((k) => k + 1); };

  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error === "unavailable" ? "No capacity for that slot anymore — cannot confirm." : "Action failed.");
      } else {
        if (viewing?.id === id) setViewing(null);
        reload();
      }
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reservations</h1>
      <p className="mt-1 text-sm text-zinc-500">Confirm or decline table requests. Confirming notifies the guest.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} highlight={stats.pending > 0} />
        <Stat label="Confirmed" value={stats.confirmed} />
        <Stat label="Completed" value={stats.completed} />
        <Stat label="No-show" value={stats.noShow} />
        <Stat label="Cancelled" value={stats.cancelled} />
        <Stat label="Rejected" value={stats.rejected} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1">
          {TABS.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                status === s ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {s.toLowerCase().replace("_", " ")}
            </button>
          ))}
        </div>
        <input type="date" value={dateFilter} onChange={(e) => changeDate(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        <input value={q} onChange={(e) => changeQuery(e.target.value)} placeholder="Search name, phone, code…" className="min-w-[180px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Guest</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Party</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Notify</th>
              <th className="px-4 py-3 text-end font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No reservations found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-zinc-900">{r.code}</td>
                  <td className="px-4 py-3"><div className="font-medium text-zinc-900">{r.customerName}</div><div className="text-xs text-zinc-500">{r.customerPhone}</div></td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{r.date}<div className="text-xs text-zinc-500">{r.time}</div></td>
                  <td className="tnum px-4 py-3 text-zinc-600">{r.guestCount}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><div className="flex gap-1"><NotifyDot label="Email" s={r.emailStatus} /><NotifyDot label="WhatsApp" s={r.whatsappStatus} /></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button onClick={() => setViewing(r)} className="text-zinc-600 hover:underline">View</button>
                      {(ACTIONS[r.status] || []).slice(0, 2).map((a) => (
                        <button key={a.action} disabled={busy === r.id} onClick={() => act(r.id, a.action)} className={`${toneClass(a.tone)} disabled:opacity-50`}>{a.label}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > PER_PAGE && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-zinc-300 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {viewing && <ViewModal r={viewing} busy={busy === viewing.id} onClose={() => setViewing(null)} onAct={act} />}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-gold/50 bg-gold/10" : "border-zinc-200 bg-white"}`}>
      <div className={`font-display text-2xl font-bold ${highlight ? "text-gold" : "text-zinc-900"}`}>{value}</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Res["status"] }) {
  const map: Record<Res["status"], string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    NO_SHOW: "bg-red-100 text-red-700",
    CANCELLED: "bg-zinc-200 text-zinc-600",
    REJECTED: "bg-zinc-200 text-zinc-600",
  };
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status.toLowerCase().replace("_", " ")}</span>;
}

function NotifyDot({ label, s }: { label: string; s: string }) {
  const color = s === "SENT" ? "bg-green-500" : s === "FAILED" ? "bg-red-500" : s === "SKIPPED" ? "bg-zinc-300" : "bg-amber-400";
  return <span title={`${label}: ${s.toLowerCase()}`} className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-label={`${label} ${s}`} />;
}

function toneClass(tone: string) {
  switch (tone) {
    case "green": return "font-medium text-green-600 hover:underline";
    case "amber": return "text-amber-600 hover:underline";
    case "red": return "text-red-600 hover:underline";
    case "zinc": return "text-zinc-500 hover:underline";
    default: return "text-gold hover:underline";
  }
}

function ViewModal({ r, busy, onClose, onAct }: { r: Res; busy: boolean; onClose: () => void; onAct: (id: string, action: string, extra?: Record<string, unknown>) => void }) {
  const [table, setTable] = useState(r.assignedTable);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-900">{r.customerName}</h2>
            <p className="mt-0.5 font-mono text-sm text-zinc-500">{r.code}</p>
          </div>
          <StatusBadge status={r.status} />
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
          <Row label="When">{r.date} · {r.time}</Row>
          <Row label="Party">{r.guestCount} guests</Row>
          <Row label="Phone">{r.customerPhone}</Row>
          <Row label="Email">{r.customerEmail}</Row>
          <Row label="Language">{r.preferredLanguage === "ar" ? "العربية" : "English"}</Row>
          {r.specialRequests && <Row label="Requests">{r.specialRequests}</Row>}
          <Row label="Email notice"><span className="capitalize">{r.emailStatus.toLowerCase()}</span></Row>
          <Row label="WhatsApp notice"><span className="capitalize">{r.whatsappStatus.toLowerCase()}</span></Row>
        </dl>

        <div className="mt-4 flex items-end gap-2">
          <label className="flex-1 text-sm">
            <span className="mb-1 block font-medium text-zinc-600">Assigned table</span>
            <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. T4 / Patio 2" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </label>
          <button disabled={busy} onClick={() => onAct(r.id, "assign", { table })} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Save</button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(ACTIONS[r.status] || []).map((a) => (
            <button
              key={a.action}
              disabled={busy}
              onClick={() => onAct(r.id, a.action)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                a.tone === "green" ? "bg-green-600 hover:bg-green-700" : a.tone === "amber" ? "bg-amber-500 hover:bg-amber-600" : a.tone === "red" ? "bg-red-600 hover:bg-red-700" : "bg-zinc-500 hover:bg-zinc-600"
              }`}
            >
              {a.label}
            </button>
          ))}
          <button onClick={onClose} className="ms-auto rounded-lg border border-zinc-300 px-4 py-2 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-zinc-500">{label}</dt>
      <dd className="text-end font-medium text-zinc-800">{children}</dd>
    </div>
  );
}
