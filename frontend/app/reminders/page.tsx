"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetReminders, apiUpdateReminderStatus } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Tag from "@/components/ui/Tag";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { getWALink } from "@/lib/utils";
import { COLORS } from "@/lib/theme";
import type { Patient } from "@/types";

type Tab = "urgent" | "today" | "upcoming" | "missed" | "all";
type Sort = "days_left" | "area" | "medicine";

const TABS: { key: Tab; label: string; color: string; bg: string }[] = [
  { key: "urgent", label: "Urgent", color: "#C62828", bg: "#FFEBEE" },
  { key: "today", label: "Today", color: "#E65100", bg: "#FFF3E0" },
  { key: "upcoming", label: "Upcoming", color: "#F57F17", bg: "#FFFDE7" },
  { key: "missed", label: "Missed", color: "#546E7A", bg: "#ECEFF1" },
  { key: "all", label: "All", color: COLORS.primary, bg: COLORS.primaryLight },
];

export default function RemindersPage() {
  const [tab, setTab] = useState<Tab>("urgent");
  const [sort, setSort] = useState<Sort>("days_left");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) router.replace("/");
  }, []);
  useEffect(() => {
    load();
  }, [tab, sort]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGetReminders(tab, sort);
      setPatients(res.data.data || []);
    } catch {
      showToast("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (
    patientId: string,
    status: string,
    label: string,
  ) => {
    try {
      await apiUpdateReminderStatus(patientId, status);
      showToast("Marked as " + label);
      load();
    } catch {
      showToast("Failed to update");
    }
  };

  const handleBulkSend = async () => {
    if (!patients.length) return;
    await Promise.all(
      patients.map((p) => apiUpdateReminderStatus(p.id, "sent")),
    );
    showToast(`Reminders marked for ${patients.length} patients`);
    load();
  };

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <AppShell
      title="Reminder Panel"
      urgentCount={patients.filter((p) => p.tag === "urgent").length}
    >
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
        {/* Priority guide */}
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: COLORS.primary,
              textTransform: "uppercase" as const,
              letterSpacing: 1,
              margin: "0 0 10px",
            }}
          >
            Priority Guide
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              {
                color: "#C62828",
                bg: "#FFEBEE",
                label: "URGENT",
                desc: "0–2 days left. Call immediately.",
              },
              {
                color: "#E65100",
                bg: "#FFF3E0",
                label: "TODAY",
                desc: "3 days left. Send reminder today.",
              },
              {
                color: "#F57F17",
                bg: "#FFFDE7",
                label: "UPCOMING",
                desc: "4–7 days. Plan in advance.",
              },
              {
                color: "#546E7A",
                bg: "#ECEFF1",
                label: "MISSED",
                desc: "Medicine over. Follow up urgently.",
              },
            ].map((g) => (
              <div
                key={g.label}
                style={{
                  background: g.bg,
                  borderRadius: 10,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: g.color,
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: g.color,
                      margin: "0 0 2px",
                    }}
                  >
                    {g.label}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: g.color,
                      margin: 0,
                      opacity: 0.8,
                      lineHeight: 1.3,
                    }}
                  >
                    {g.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab pills */}
        <div
          style={{
            background: "white",
            padding: "10px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{ display: "flex", gap: 6, overflowX: "auto" }}
            className="scrollbar-hide"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  background: tab === t.key ? t.color : "#F1F5F9",
                  color: tab === t.key ? "white" : COLORS.textSecondary,
                  boxShadow: tab === t.key ? `0 2px 8px ${t.color}50` : "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + bulk */}
        <div
          style={{
            background: "white",
            padding: "8px 16px 10px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.textMuted,
                margin: 0,
                textTransform: "uppercase" as const,
                letterSpacing: 0.8,
              }}
            >
              Sort:
            </p>
            {(["days_left", "area", "medicine"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  background: sort === s ? COLORS.primaryLight : "#F8FAFC",
                  color: sort === s ? COLORS.primary : COLORS.textMuted,
                  border: `1px solid ${sort === s ? COLORS.primary : COLORS.border}`,
                }}
              >
                {s === "days_left"
                  ? "Days Left"
                  : s === "area"
                    ? "Area"
                    : "Medicine"}
              </button>
            ))}
          </div>
          {patients.length > 0 && (
            <button
              onClick={handleBulkSend}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                background: "#E8F5E9",
                color: "#2E7D32",
                border: "1.5px solid #A5D6A7",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Mark All Sent
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <Spinner />
        ) : patients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: activeTab.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              <span style={{ color: activeTab.color, fontWeight: 900 }}>✓</span>
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textSecondary,
                margin: "0 0 6px",
              }}
            >
              No {tab} patients
            </p>
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
              {tab === "urgent"
                ? "Great! No urgent cases right now."
                : tab === "missed"
                  ? "No missed cases."
                  : "No patients in this category."}
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Bulk info bar */}
            <div
              style={{
                background: activeTab.bg,
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: `1px solid ${activeTab.color}30`,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab.color,
                  margin: 0,
                }}
              >
                {patients.length} patient{patients.length !== 1 ? "s" : ""} need
                {patients.length === 1 ? "s" : ""} attention
              </p>
              <Tag tag={tab === "all" ? "urgent" : tab} />
            </div>

            {patients.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {/* Left border */}
                <div
                  style={{
                    height: 4,
                    background:
                      p.tag === "urgent"
                        ? "#C62828"
                        : p.tag === "today"
                          ? "#E65100"
                          : p.tag === "upcoming"
                            ? "#F9A825"
                            : "#90A4AE",
                  }}
                />
                <div style={{ padding: "12px 14px" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <Link
                        href={`/patients/${p.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: COLORS.textPrimary,
                            margin: "0 0 3px",
                          }}
                        >
                          {p.name}
                        </p>
                      </Link>
                      <p
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          margin: 0,
                        }}
                      >
                        {p.diseases?.join(", ")} &bull; {p.area} &bull;{" "}
                        {p.mobile}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <Tag tag={p.tag} />
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          margin: 0,
                          color: p.days_left <= 0 ? "#C62828" : "#E65100",
                        }}
                      >
                        {p.days_left <= 0 ? "Finished" : `${p.days_left}d left`}
                      </p>
                    </div>
                  </div>

                  {/* Medicines */}
                  {p.medicines?.slice(0, 2).map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 10px",
                        background: "#F8FAFC",
                        borderRadius: 8,
                        marginBottom: 4,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.textPrimary,
                          margin: 0,
                        }}
                      >
                        {m.brand}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          margin: 0,
                          color:
                            (m.days_left ?? 0) <= 0
                              ? "#C62828"
                              : (m.days_left ?? 0) <= 3
                                ? "#E65100"
                                : COLORS.textMuted,
                        }}
                      >
                        {(m.days_left ?? 0) <= 0
                          ? "FINISHED"
                          : `${m.days_left}d`}
                      </p>
                    </div>
                  ))}
                  {p.medicines?.length > 2 && (
                    <p
                      style={{
                        fontSize: 11,
                        color: COLORS.textMuted,
                        margin: "4px 0 0",
                      }}
                    >
                      +{p.medicines.length - 2} more medicines
                    </p>
                  )}

                  {/* Action buttons */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: 6,
                      marginTop: 10,
                    }}
                  >
                    <a
                      href={getWALink(
                        p.whatsapp || p.mobile,
                        p.name,
                        p.medicines,
                        p.days_left,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMark(p.id, "sent", "sent")}
                      style={{
                        gridColumn: "span 2",
                        padding: "9px 0",
                        borderRadius: 10,
                        background: "#25D366",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: "center",
                        textDecoration: "none",
                        display: "block",
                      }}
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={() => handleMark(p.id, "purchased", "Purchased")}
                      style={{
                        padding: "9px 0",
                        borderRadius: 10,
                        background: "#E8F5E9",
                        color: "#2E7D32",
                        border: "1.5px solid #A5D6A7",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Bought
                    </button>
                    <button
                      onClick={() => handleMark(p.id, "ignored", "Ignored")}
                      style={{
                        padding: "9px 0",
                        borderRadius: 10,
                        background: "#F8FAFC",
                        color: COLORS.textMuted,
                        border: `1px solid ${COLORS.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
