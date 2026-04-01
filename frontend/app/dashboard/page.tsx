"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetAnalytics, apiGetPatients } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Tag from "@/components/ui/Tag";
import Spinner from "@/components/ui/Spinner";
import type { Analytics, Patient } from "@/types";
import { COLORS } from "@/lib/theme";

const STAT_CARDS = (s: Analytics) => [
  { val: s.total_patients,     label: "Total Patients",    color: "#1565C0", bg: "#E3F2FD", icon: "👥" },
  { val: s.urgent,             label: "Urgent",            color: "#C62828", bg: "#FFEBEE", icon: "🚨" },
  { val: s.today,              label: "Due Today",         color: "#E65100", bg: "#FFF3E0", icon: "📅" },
  { val: s.upcoming,           label: "Upcoming",          color: "#F57F17", bg: "#FFFDE7", icon: "⏰" },
  { val: s.missed,             label: "Missed",            color: "#546E7A", bg: "#ECEFF1", icon: "⚠️" },
  { val: s.insurance_expiring, label: "Insurance Expiring",color: "#2E7D32", bg: "#E8F5E9", icon: "🛡️" },
];

const QUICK_ACTIONS = [
  { href: "/patients/add", label: "Add Patient",  desc: "Register new patient",    color: "#1565C0", bg: "#E3F2FD" },
  { href: "/patients",     label: "Patients",     desc: "View all patients",       color: "#6A1B9A", bg: "#F3E5F5" },
  { href: "/reminders",    label: "Reminders",    desc: "Send medicine reminders", color: "#C62828", bg: "#FFEBEE" },
  { href: "/invoices",     label: "Invoices",     desc: "Manage billing",          color: "#E65100", bg: "#FFF3E0" },
  { href: "/analytics",    label: "Analytics",    desc: "Reports & insights",      color: "#2E7D32", bg: "#E8F5E9" },
  { href: "/settings",     label: "Settings",     desc: "App preferences",         color: "#546E7A", bg: "#ECEFF1" },
];

export default function DashboardPage() {
  const [stats, setStats]     = useState<Analytics | null>(null);
  const [urgent, setUrgent]   = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace("/"); return; }
    Promise.all([apiGetAnalytics(), apiGetPatients()])
      .then(([aRes, pRes]) => {
        setStats(aRes.data.data);
        const all: Patient[] = pRes.data.data || [];
        setUrgent(all.filter(p => ["urgent","today","missed"].includes(p.tag)).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Dashboard" urgentCount={stats?.urgent ?? 0}>
      {loading ? <Spinner /> : (
        <div style={{ padding: "16px 16px 24px" }}>

          {/* Stats grid */}
          {stats && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
                Today's Overview
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {STAT_CARDS(stats).map((s, i) => (
                  <Link href="/reminders" key={i}>
                    <div style={{
                      background: s.bg, borderRadius: 16, padding: "14px 10px", textAlign: "center",
                      cursor: "pointer", transition: "transform 0.15s", border: `1px solid ${s.bg}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                      <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                      <p style={{ fontSize: 10, color: s.color, fontWeight: 600, margin: "4px 0 0", opacity: 0.8, lineHeight: 1.2 }}>{s.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
              Quick Actions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <Link key={a.href} href={a.href}>
                  <div style={{
                    background: "white", borderRadius: 16, padding: "14px",
                    border: `1px solid ${COLORS.border}`, cursor: "pointer",
                    transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.boxShadow = `0 4px 12px ${a.bg}`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: a.color, opacity: 0.7 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "2px 0 0" }}>{a.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Urgent patients */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, margin: 0 }}>
                Urgent Attention
              </p>
              <Link href="/reminders">
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, background: COLORS.primaryLight, padding: "4px 10px", borderRadius: 8 }}>
                  View All
                </span>
              </Link>
            </div>

            {urgent.length === 0 ? (
              <div style={{
                background: "#F0FDF4", borderRadius: 16, padding: 24, textAlign: "center",
                border: "1px solid #BBF7D0",
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#166534", margin: 0 }}>All patients on track!</p>
                <p style={{ fontSize: 12, color: "#4ADE80", margin: "4px 0 0" }}>No urgent reminders right now</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {urgent.map(p => (
                  <Link href={`/patients/${p.id}`} key={p.id}>
                    <div style={{
                      background: "white", borderRadius: 16, padding: "12px 14px",
                      border: `1px solid ${COLORS.border}`, cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      borderLeft: `4px solid ${p.tag === "urgent" ? "#C62828" : p.tag === "today" ? "#E65100" : "#90A4AE"}`,
                      transition: "transform 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "translateX(2px)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "translateX(0)")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: p.tag === "urgent" ? "#FFEBEE" : p.tag === "today" ? "#FFF3E0" : "#ECEFF1",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 900,
                          color: p.tag === "urgent" ? "#C62828" : p.tag === "today" ? "#E65100" : "#546E7A",
                        }}>
                          {p.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>{p.name}</p>
                          <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "2px 0 0" }}>
                            {p.diseases?.join(", ")} &bull; {p.area}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <Tag tag={p.tag} />
                          <p style={{ fontSize: 11, fontWeight: 700, margin: 0, color: p.days_left <= 0 ? "#C62828" : "#E65100" }}>
                            {p.days_left <= 0 ? "Finished" : `${p.days_left}d left`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}