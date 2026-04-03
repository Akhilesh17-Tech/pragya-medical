"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetAnalytics } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import type { Analytics } from "@/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetAnalytics()
      .then((res) => setData(res.data.data))
      .catch(() => showToast("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AppShell title="Analytics">
        <Spinner />
      </AppShell>
    );
  if (!data)
    return (
      <AppShell title="Analytics">
        <p style={{ padding: 24, color: COLORS.textMuted }}>
          No data available
        </p>
      </AppShell>
    );

  const avgPerPatient =
    data.total_patients > 0
      ? Math.round(data.total_monthly_revenue / data.total_patients)
      : 0;

  const breakdown = [
    {
      label: "Urgent",
      val: data.urgent,
      color: "#C62828",
      bg: "#FFEBEE",
      pct: data.total_patients
        ? Math.round((data.urgent / data.total_patients) * 100)
        : 0,
    },
    {
      label: "Today",
      val: data.today,
      color: "#E65100",
      bg: "#FFF3E0",
      pct: data.total_patients
        ? Math.round((data.today / data.total_patients) * 100)
        : 0,
    },
    {
      label: "Upcoming",
      val: data.upcoming,
      color: "#F57F17",
      bg: "#FFFDE7",
      pct: data.total_patients
        ? Math.round((data.upcoming / data.total_patients) * 100)
        : 0,
    },
    {
      label: "Missed",
      val: data.missed,
      color: "#546E7A",
      bg: "#ECEFF1",
      pct: data.total_patients
        ? Math.round((data.missed / data.total_patients) * 100)
        : 0,
    },
  ];

  return (
    <AppShell title="Analytics">
      <div style={{ background: "#F8FAFC", minHeight: "100%", padding: 16 }}>
        {/* Revenue hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            borderRadius: 20,
            padding: "20px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: 1,
              margin: "0 0 6px",
            }}
          >
            Monthly Revenue
          </p>
          <p
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: 900,
              margin: "0 0 4px",
              letterSpacing: -1,
            }}
          >
            Rs {data.total_monthly_revenue.toLocaleString("en-IN")}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              margin: "0 0 16px",
              fontWeight: 500,
            }}
          >
            Avg Rs {avgPerPatient.toLocaleString("en-IN")} per patient
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { label: "Total Patients", val: data.total_patients },
              { label: "Reminders This Month", val: data.reminders_this_month },
              { label: "Insurance Expiring", val: data.insurance_expiring },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <p
                  style={{
                    color: "white",
                    fontSize: 22,
                    fontWeight: 900,
                    margin: "0 0 4px",
                  }}
                >
                  {s.val}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 10,
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {breakdown.map((b) => (
            <div
              key={b.label}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 14,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.textSecondary,
                    margin: 0,
                  }}
                >
                  {b.label}
                </p>
                <span
                  style={{
                    background: b.bg,
                    color: b.color,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  {b.pct}%
                </span>
              </div>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: b.color,
                  margin: "0 0 8px",
                }}
              >
                {b.val}
              </p>
              <div
                style={{
                  height: 6,
                  background: "#F1F5F9",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${b.pct}%`,
                    background: b.color,
                    borderRadius: 3,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary table */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              padding: "12px clamp(16px, 3vw, 32px)",
              borderBottom: `1px solid ${COLORS.border}`,
              background: "#FAFBFC",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.primary,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                margin: 0,
              }}
            >
              Summary
            </p>
          </div>
          <div style={{ padding: "4px clamp(16px, 3vw, 32px) 12px" }}>
            {[
              ["Total Patients", data.total_patients, COLORS.primary],
              ["Urgent Reminders", data.urgent, "#C62828"],
              ["Due Today", data.today, "#E65100"],
              ["Upcoming (7 days)", data.upcoming, "#F57F17"],
              ["Missed", data.missed, "#546E7A"],
              ["Insurance Expiring (30d)", data.insurance_expiring, "#2E7D32"],
              [
                "Reminders This Month",
                data.reminders_this_month,
                COLORS.primary,
              ],
              [
                "Monthly Revenue (Rs)",
                data.total_monthly_revenue?.toLocaleString("en-IN"),
                COLORS.primary,
              ],
            ].map(([label, val, color]) => (
              <div
                key={label as string}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #F8FAFC",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: COLORS.textSecondary,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: color as string,
                    margin: 0,
                  }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
