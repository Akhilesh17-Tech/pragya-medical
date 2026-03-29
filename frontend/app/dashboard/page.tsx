"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetAnalytics, apiGetPatients } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import BottomNav from "@/components/layout/BottomNav";
import Toast from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import Tag from "@/components/ui/Tag";
import type { Analytics, Patient, User } from "@/types";

const ACTIONS = [
  { href: "/patients/add", icon: "➕", label: "Add Patient" },
  { href: "/patients", icon: "👥", label: "All Patients" },
  { href: "/reminders", icon: "🔔", label: "Reminders" },
  { href: "/analytics", icon: "📊", label: "Analytics" },
  { href: "/invoices", icon: "🧾", label: "Invoices" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function DashboardPage() {
  const [user] = useState<User | null>(() =>
    auth.isLoggedIn() ? auth.getUser() : null,
  );
  const [stats, setStats] = useState<Analytics | null>(null);
  const [urgent, setUrgent] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }

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
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          val: stats.total_patients,
          label: "Total Patients",
          style: "bg-white/15",
        },
        {
          val: stats.urgent,
          label: "Urgent Reminders",
          style: "bg-red-500/80",
        },
        { val: stats.today, label: "Today Due", style: "bg-orange-500/80" },
        { val: stats.missed, label: "Missed", style: "bg-red-500/60" },
        {
          val: stats.insurance_expiring,
          label: "Insurance Expiring",
          style: "bg-green-500/70",
        },
        {
          val: stats.upcoming,
          label: "Upcoming (7 Days)",
          style: "bg-white/12",
        },
      ]
    : [];

  return (
    <PhoneShell>
      {/* Top bar */}
      <div className="bg-[#1a6fc4] px-4 py-3 flex items-center justify-between text-white flex-shrink-0">
        <div className="w-8" />
        <h2 className="text-[15px] font-extrabold">Pragya Medical</h2>
        <Link href="/settings">
          <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">
            ⚙️
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Stats hero */}
        <div className="bg-[#1a6fc4] px-4 pb-5">
          <p className="text-white/70 text-[12px] mb-0.5">Good morning,</p>
          <p className="text-white text-[17px] font-extrabold mb-3">
            {user?.pharmacy_name || "Pragya Medical"}
          </p>

          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/15 rounded-xl p-3 h-16 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {statCards.map((s, i) => (
                <Link href="/reminders" key={i}>
                  <div
                    className={`${s.style} rounded-xl p-2.5 text-center cursor-pointer`}
                  >
                    <div className="text-[22px] font-extrabold text-white leading-tight">
                      {s.val}
                    </div>
                    <div className="text-[10px] text-white/75 font-semibold mt-0.5 leading-tight">
                      {s.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions grid */}
        <div className="p-4 grid grid-cols-2 gap-2.5">
          {ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="bg-white border-[1.5px] border-[#dce6f0] rounded-[14px] p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#1a6fc4] hover:bg-[#e8f1fb] transition-all shadow-sm">
                <span className="text-[28px]">{a.icon}</span>
                <span className="text-[13px] font-bold text-[#2c3e50]">
                  {a.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Urgent patients preview */}
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[14px] font-extrabold text-[#2c3e50]">
            Urgent Reminders
          </span>
          <Link href="/reminders">
            <span className="text-[12px] text-[#1a6fc4] font-semibold">
              See All
            </span>
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : urgent.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-6">
            No urgent reminders
          </p>
        ) : (
          urgent.map((p) => (
            <Link href={`/patients/${p.id}`} key={p.id}>
              <div
                className={`mx-4 mb-2.5 bg-white rounded-xl p-3 shadow-sm border-l-4 cursor-pointer ${
                  p.tag === "urgent"
                    ? "border-l-red-500"
                    : p.tag === "today"
                      ? "border-l-orange-500"
                      : "border-l-gray-400"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-[13px] font-bold">{p.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {p.diseases?.join(", ")} · {p.area}
                    </p>
                  </div>
                  <Tag tag={p.tag} />
                </div>
                <p className="text-[11px] font-bold text-red-500">
                  {p.medicines?.[0]?.brand}:{" "}
                  {p.days_left <= 0 ? "Finished" : `${p.days_left} days left`}
                </p>
              </div>
            </Link>
          ))
        )}

        <div className="h-4" />
      </div>

      <BottomNav urgentCount={stats?.urgent ?? 0} />
      <Toast />
    </PhoneShell>
  );
}
