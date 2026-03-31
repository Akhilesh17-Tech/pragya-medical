"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetAnalytics, apiGetPatients } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import BottomNav from "@/components/layout/BottomNav";
import Toast from "@/components/ui/Toast";
import Tag from "@/components/ui/Tag";
import type { Analytics, Patient, User } from "@/types";

const ACTIONS = [
  {
    href: "/patients/add",
    label: "Add Patient",
    color: "#1a6fc4",
    light: "#e8f1fb",
  },
  {
    href: "/patients",
    label: "All Patients",
    color: "#7c3aed",
    light: "#ede9fe",
  },
  {
    href: "/reminders",
    label: "Reminders",
    color: "#dc2626",
    light: "#fee2e2",
  },
  {
    href: "/analytics",
    label: "Analytics",
    color: "#059669",
    light: "#d1fae5",
  },
  { href: "/invoices", label: "Invoices", color: "#d97706", light: "#fef3c7" },
  { href: "/settings", label: "Settings", color: "#475569", light: "#f1f5f9" },
];

const ACTION_ICONS = ["➕", "👥", "🔔", "📊", "🧾", "⚙️"];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Analytics | null>(null);
  const [urgent, setUrgent] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    setUser(auth.getUser());
    Promise.all([apiGetAnalytics(), apiGetPatients()])
      .then(([aRes, pRes]) => {
        setStats(aRes.data.data);
        const all: Patient[] = pRes.data.data || [];
        setUrgent(
          all
            .filter((p) => ["urgent", "today", "missed"].includes(p.tag))
            .slice(0, 5),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const STATS = stats
    ? [
        {
          val: stats.total_patients,
          label: "Total",
          bg: "rgba(255,255,255,0.15)",
          border: "rgba(255,255,255,0.2)",
        },
        {
          val: stats.urgent,
          label: "Urgent",
          bg: "rgba(239,68,68,0.7)",
          border: "rgba(239,68,68,0.3)",
        },
        {
          val: stats.today,
          label: "Today",
          bg: "rgba(249,115,22,0.7)",
          border: "rgba(249,115,22,0.3)",
        },
        {
          val: stats.missed,
          label: "Missed",
          bg: "rgba(239,68,68,0.45)",
          border: "rgba(239,68,68,0.2)",
        },
        {
          val: stats.insurance_expiring,
          label: "Insurance",
          bg: "rgba(16,185,129,0.6)",
          border: "rgba(16,185,129,0.3)",
        },
        {
          val: stats.upcoming,
          label: "Upcoming",
          bg: "rgba(255,255,255,0.1)",
          border: "rgba(255,255,255,0.15)",
        },
      ]
    : [];

  return (
    <PhoneShell>
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(145deg, #0f4c8a 0%, #1a6fc4 50%, #2185d9 100%)",
        }}
        className="px-5 pt-5 pb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Good morning
            </p>
            <p className="text-white text-xl font-black mt-0.5 leading-tight">
              {user?.pharmacy_name || "Pragya Medical"}
            </p>
          </div>
          <Link href="/settings">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-16 animate-pulse"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((s, i) => (
              <Link href="/reminders" key={i}>
                <div
                  className="rounded-2xl p-3 text-center cursor-pointer active:scale-95 transition-transform"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                >
                  <p className="text-2xl font-black text-white leading-none">
                    {s.val}
                  </p>
                  <p className="text-[10px] text-white/70 font-semibold mt-1 uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50">
        {/* Quick Actions */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {ACTIONS.map((a, i) => (
              <Link key={a.href} href={a.href}>
                <div
                  className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all border border-slate-100"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: a.light }}
                  >
                    <span>{ACTION_ICONS[i]}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                    {a.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent patients */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-black text-slate-800">
                Urgent Reminders
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Patients needing immediate attention
              </p>
            </div>
            <Link href="/reminders">
              <span className="text-xs font-bold text-[#1a6fc4] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                See All
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-20 animate-pulse border border-slate-100"
                />
              ))}
            </div>
          ) : urgent.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-8 text-center border border-slate-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">All clear!</p>
              <p className="text-xs text-slate-400 mt-1">
                No urgent reminders right now
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {urgent.map((p, i) => (
                <Link href={`/patients/${p.id}`} key={p.id}>
                  <div
                    className="bg-white rounded-2xl p-3.5 border border-slate-100 active:scale-[0.99] transition-transform cursor-pointer"
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{
                          background:
                            p.tag === "urgent"
                              ? "#ef4444"
                              : p.tag === "today"
                                ? "#f97316"
                                : "#94a3b8",
                        }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {p.diseases?.join(", ")} · {p.area}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Tag tag={p.tag} />
                        <p
                          className="text-xs font-bold"
                          style={{
                            color: p.days_left <= 0 ? "#ef4444" : "#f97316",
                          }}
                        >
                          {p.days_left <= 0
                            ? "Finished"
                            : `${p.days_left}d left`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="h-6" />
      </div>

      <BottomNav urgentCount={stats?.urgent ?? 0} />
      <Toast />
    </PhoneShell>
  );
}
