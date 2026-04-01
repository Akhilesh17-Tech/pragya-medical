"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import { formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";
import { apiGetInvoices, apiDeleteInvoice } from "@/lib/api";

const STATUS = {
  purchased_us: {
    label: "From Us",
    color: "#2E7D32",
    bg: "#E8F5E9",
    border: "#A5D6A7",
    dot: "#43A047",
  },
  purchased_other: {
    label: "Other Store",
    color: "#E65100",
    bg: "#FFF3E0",
    border: "#FFCC80",
    dot: "#FF7043",
  },
  pending: {
    label: "Will Buy Later",
    color: "#546E7A",
    bg: "#ECEFF1",
    border: "#CFD8DC",
    dot: "#90A4AE",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "purchased_us", label: "From Us" },
  { key: "purchased_other", label: "Other Store" },
  { key: "pending", label: "Pending" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [activeFilter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetInvoices()
      .then((res) => {
        const data = res.data.data || [];
        setInvoices(data);
        setFiltered(data);
      })
      .catch(() => showToast("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      activeFilter === "all"
        ? invoices
        : invoices.filter((i) => i.purchase_status === activeFilter),
    );
  }, [activeFilter, invoices]);

  const total = invoices.length;
  const fromUs = invoices.filter(
    (i) => i.purchase_status === "purchased_us",
  ).length;
  const otherStore = invoices.filter(
    (i) => i.purchase_status === "purchased_other",
  ).length;
  const pending = invoices.filter(
    (i) => i.purchase_status === "pending",
  ).length;
  const revenue = invoices
    .filter((i) => i.purchase_status === "purchased_us")
    .reduce((s, i) => s + (i.grand_total || 0), 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await apiDeleteInvoice(id);
      showToast("Invoice deleted");
      // Reload
      apiGetInvoices().then((res) => {
        const data = res.data.data || [];
        setInvoices(data);
        setFiltered(data);
      });
    } catch {
      showToast("Failed to delete invoice");
    }
  };

  return (
    <AppShell title="Invoices">
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
        {/* Hero stats */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            padding: "16px 16px 20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {/* Revenue card */}
            <div
              style={{
                gridColumn: "span 2",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 11,
                    fontWeight: 700,
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Total Revenue (From Us)
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: 26,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: -0.5,
                  }}
                >
                  Rs {revenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🧾
              </div>
            </div>
          </div>

          {/* 4 stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { label: "Total", val: total, bg: "rgba(255,255,255,0.15)" },
              { label: "From Us", val: fromUs, bg: "rgba(67,160,71,0.4)" },
              { label: "Other", val: otherStore, bg: "rgba(255,112,67,0.4)" },
              { label: "Pending", val: pending, bg: "rgba(144,164,174,0.4)" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.bg,
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontWeight: 900,
                    margin: "0 0 3px",
                    lineHeight: 1,
                  }}
                >
                  {s.val}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 10,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + create button */}
        <div
          style={{
            background: "white",
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "10px 16px",
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
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.textSecondary,
                margin: 0,
              }}
            >
              {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
            </p>
            <Link href="/invoices/create">
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
                }}
              >
                + New Invoice
              </button>
            </Link>
          </div>

          {/* Filter chips */}
          <div
            style={{ display: "flex", gap: 6, overflowX: "auto" }}
            className="scrollbar-hide"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  background:
                    activeFilter === f.key ? COLORS.primary : "#F1F5F9",
                  color:
                    activeFilter === f.key ? "white" : COLORS.textSecondary,
                  boxShadow:
                    activeFilter === f.key
                      ? `0 2px 8px ${COLORS.primary}40`
                      : "none",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice list */}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textSecondary,
                margin: "0 0 6px",
              }}
            >
              No invoices {activeFilter !== "all" ? "in this category" : "yet"}
            </p>
            <p
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                margin: "0 0 20px",
              }}
            >
              Create your first invoice to start tracking sales
            </p>
            <Link href="/invoices/create">
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Create Invoice
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
            {filtered.map((inv) => {
              const sc =
                STATUS[inv.purchase_status as keyof typeof STATUS] ||
                STATUS.pending;
              return (
                <div
                  key={inv.id}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Patient header */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: "rgba(255,255,255,0.2)",
                          border: "1.5px solid rgba(255,255,255,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 900,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {(inv.patient?.name || "P").charAt(0)}
                      </div>
                      <div>
                        <p
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: 800,
                            margin: "0 0 2px",
                          }}
                        >
                          {inv.patient?.name || "Unknown Patient"}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: 11,
                            margin: 0,
                          }}
                        >
                          {inv.patient?.mobile} &bull; {inv.patient?.area}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontWeight: 900,
                          margin: "0 0 2px",
                        }}
                      >
                        Rs {(inv.grand_total || 0).toLocaleString("en-IN")}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 10,
                          margin: 0,
                        }}
                      >
                        {formatDate(inv.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Invoice body */}
                  <div style={{ padding: "12px 14px" }}>
                    {/* Invoice number + status */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: sc.dot,
                          }}
                        />
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: COLORS.primary,
                            margin: 0,
                          }}
                        >
                          {inv.invoice_no}
                        </p>
                      </div>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        {sc.label}
                      </span>
                    </div>

                    {/* Medicine tags */}
                    {inv.items && inv.items.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          flexWrap: "wrap",
                          marginBottom: 10,
                        }}
                      >
                        {inv.items.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            style={{
                              background: COLORS.primaryLight,
                              color: COLORS.primary,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 7,
                            }}
                          >
                            {item.brand} {item.strength}
                          </span>
                        ))}
                        {inv.items.length > 3 && (
                          <span
                            style={{
                              background: "#F1F5F9",
                              color: COLORS.textMuted,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 7,
                            }}
                          >
                            +{inv.items.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Financials */}
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 12,
                        padding: "8px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div style={{ display: "flex", gap: 16 }}>
                        <div>
                          <p
                            style={{
                              fontSize: 9,
                              color: COLORS.textMuted,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              margin: "0 0 2px",
                            }}
                          >
                            Subtotal
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: COLORS.textPrimary,
                              margin: 0,
                            }}
                          >
                            Rs {(inv.subtotal || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        {inv.discount > 0 && (
                          <div>
                            <p
                              style={{
                                fontSize: 9,
                                color: COLORS.textMuted,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                margin: "0 0 2px",
                              }}
                            >
                              Discount
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#E65100",
                                margin: 0,
                              }}
                            >
                              - Rs {inv.discount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontSize: 9,
                            color: COLORS.textMuted,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            margin: "0 0 2px",
                          }}
                        >
                          Grand Total
                        </p>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: COLORS.primary,
                            margin: 0,
                          }}
                        >
                          Rs {(inv.grand_total || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Purchaser */}
                    {inv.purchaser && (
                      <p
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          margin: "8px 0 0",
                          fontWeight: 500,
                        }}
                      >
                        Purchased by:{" "}
                        <strong style={{ color: COLORS.textSecondary }}>
                          {inv.purchaser}
                        </strong>
                      </p>
                    )}

                    {/* Next reminder */}
                    {inv.next_reminder_date && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "7px 10px",
                          background: "#FFF3E0",
                          borderRadius: 10,
                          border: "1px solid #FFCC80",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#E65100",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{
                            fontSize: 11,
                            color: "#E65100",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          Next reminder: {formatDate(inv.next_reminder_date)}
                        </p>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <Link
                        href={`/invoices/create?patient_id=${inv.patient_id}`}
                        style={{ flex: 1, textDecoration: "none" }}
                      >
                        <button
                          style={{
                            width: "100%",
                            padding: "9px 0",
                            borderRadius: 10,
                            background: COLORS.primaryLight,
                            color: COLORS.primary,
                            border: `1.5px solid ${COLORS.primary}30`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          New Invoice
                        </button>
                      </Link>
                      <Link
                        href={`/patients/${inv.patient_id}`}
                        style={{ flex: 1, textDecoration: "none" }}
                      >
                        <button
                          style={{
                            width: "100%",
                            padding: "9px 0",
                            borderRadius: 10,
                            background: "#F8FAFC",
                            color: COLORS.textSecondary,
                            border: `1.5px solid ${COLORS.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          View Patient
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        style={{
                          padding: "9px 12px",
                          borderRadius: 10,
                          background: "#FFF5F5",
                          color: "#C62828",
                          border: "1.5px solid #FFCDD2",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
