"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetPatients } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Tag from "@/components/ui/Tag";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import type { Patient } from "@/types";

const FILTERS = [
  "All",
  "BP",
  "Sugar",
  "Thyroid",
  "Heart",
  "Insurance",
  "Delivery",
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetPatients()
      .then((res) => {
        const d = res.data.data || [];
        setPatients(d);
        setFiltered(d);
      })
      .catch(() => showToast("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...patients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mobile?.includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          p.doctor?.toLowerCase().includes(q) ||
          p.diseases?.some((d) => d.toLowerCase().includes(q)) ||
          p.medicines?.some((m) => m.brand.toLowerCase().includes(q)),
      );
    }
    if (activeFilter !== "All") {
      if (activeFilter === "Insurance")
        list = list.filter((p) => !!p.insurance);
      else if (activeFilter === "Delivery")
        list = list.filter((p) => p.delivery);
      else
        list = list.filter((p) =>
          p.diseases?.some((d) => d.includes(activeFilter)),
        );
    }
    setFiltered(list);
  }, [search, activeFilter, patients]);

  return (
    <AppShell title="All Patients">
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
        {/* Search + filter section */}
        <div
          style={{
            background: "white",
            padding: "12px 16px 0",
            borderBottom: `1px solid ${COLORS.border}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {/* Search box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#F1F5F9",
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 12,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, mobile, medicine, area..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                color: COLORS.textPrimary,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: COLORS.textMuted,
                  padding: 0,
                  fontSize: 16,
                }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 12,
            }}
            className="scrollbar-hide"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s",
                  background: activeFilter === f ? COLORS.primary : "#F1F5F9",
                  color: activeFilter === f ? "white" : COLORS.textSecondary,
                  border: `1.5px solid ${activeFilter === f ? COLORS.primary : "transparent"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Count bar */}
        <div
          style={{
            padding: "10px 16px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textMuted,
              margin: 0,
            }}
          >
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
          </p>
          <Link href="/patients/add">
            <button
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                background: COLORS.primary,
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              + Add New
            </button>
          </Link>
        </div>

        {/* Patient list */}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textSecondary,
                margin: "0 0 6px",
              }}
            >
              No patients found
            </p>
            <p
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                margin: "0 0 20px",
              }}
            >
              Try a different search or add a new patient
            </p>
            <Link href="/patients/add">
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: COLORS.primary,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add First Patient
              </button>
            </Link>
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
            {filtered.map((p) => (
              <Link
                href={`/patients/${p.id}`}
                key={p.id}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Color bar */}
                  <div
                    style={{
                      height: 3,
                      background:
                        p.tag === "urgent"
                          ? "#C62828"
                          : p.tag === "today"
                            ? "#E65100"
                            : p.tag === "upcoming"
                              ? "#F9A825"
                              : p.tag === "missed"
                                ? "#90A4AE"
                                : "#43A047",
                    }}
                  />
                  <div style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            flexShrink: 0,
                            background:
                              p.gender === "Female" ? "#FCE4EC" : "#E3F2FD",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 17,
                            fontWeight: 900,
                            color:
                              p.gender === "Female"
                                ? "#C2185B"
                                : COLORS.primary,
                          }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: COLORS.textPrimary,
                              margin: "0 0 2px",
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: COLORS.textMuted,
                              margin: 0,
                            }}
                          >
                            {p.age} yrs &bull; {p.area}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Tag tag={p.tag} />
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            margin: "4px 0 0",
                            color:
                              p.days_left <= 0
                                ? "#C62828"
                                : p.days_left <= 3
                                  ? "#E65100"
                                  : "#2E7D32",
                          }}
                        >
                          {p.days_left <= 0
                            ? "Finished"
                            : `${p.days_left}d left`}
                        </p>
                      </div>
                    </div>

                    {/* Diseases */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      {p.diseases?.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          style={{
                            background: COLORS.primaryLight,
                            color: COLORS.primary,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {d}
                        </span>
                      ))}
                      {p.delivery && (
                        <span
                          style={{
                            background: "#E8F5E9",
                            color: "#2E7D32",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Delivery
                        </span>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          margin: 0,
                        }}
                      >
                        {p.mobile} &bull; Dr. {p.doctor || "—"}
                      </p>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background:
                            p.reminder_status === "sent"
                              ? "#E3F2FD"
                              : p.reminder_status === "purchased"
                                ? "#E8F5E9"
                                : p.reminder_status === "ignored"
                                  ? "#FFF3E0"
                                  : "#F1F5F9",
                          color:
                            p.reminder_status === "sent"
                              ? COLORS.primary
                              : p.reminder_status === "purchased"
                                ? "#2E7D32"
                                : p.reminder_status === "ignored"
                                  ? "#E65100"
                                  : COLORS.textMuted,
                        }}
                      >
                        {p.reminder_status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
