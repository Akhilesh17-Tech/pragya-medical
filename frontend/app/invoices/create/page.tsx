"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetPatients, apiCreateInvoice } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import type { Patient, InvoiceItem } from "@/types";

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelected] = useState<Patient | null>(null);
  const [patientSearch, setPatSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      brand: "",
      composition: "",
      strength: "",
      qty: 30,
      dose_per_day: 1,
      unit_price: 0,
      total_price: 0,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState("purchased_us");
  const [purchaser, setPurchaser] = useState("Self");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetPatients()
      .then((res) => {
        const data: Patient[] = res.data.data || [];
        setPatients(data);
        const pid = searchParams.get("patient_id");
        if (pid) {
          const found = data.find((p) => p.id === pid);
          if (found) {
            setSelected(found);
            setPatSearch(found.name);
            if (found.medicines?.length) {
              setItems(
                found.medicines.map((m) => ({
                  brand: m.brand,
                  composition: m.composition || "",
                  strength: m.strength || "",
                  qty: m.qty,
                  dose_per_day: m.dose_per_day,
                  consumption_days: Math.ceil(m.qty / (m.dose_per_day || 1)),
                  unit_price: 0,
                  total_price: 0,
                })),
              );
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.mobile?.includes(patientSearch),
  );

  const selectPatient = (p: Patient) => {
    setSelected(p);
    setPatSearch(p.name);
    setShowDrop(false);
    if (p.medicines?.length) {
      setItems(
        p.medicines.map((m) => ({
          brand: m.brand,
          composition: m.composition || "",
          strength: m.strength || "",
          qty: m.qty,
          dose_per_day: m.dose_per_day,
          consumption_days: Math.ceil(m.qty / (m.dose_per_day || 1)),
          unit_price: 0,
          total_price: 0,
        })),
      );
    }
  };

  const updateItem = (i: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "unit_price" || field === "qty") {
        const qty = field === "qty" ? value : next[i].qty;
        const price = field === "unit_price" ? value : next[i].unit_price;
        next[i].total_price = (qty || 0) * (price || 0);
      }
      if (field === "qty" || field === "dose_per_day") {
        const qty = field === "qty" ? value : next[i].qty;
        const dose = field === "dose_per_day" ? value : next[i].dose_per_day;
        next[i].consumption_days = dose > 0 ? Math.ceil(qty / dose) : 0;
      }
      return next;
    });
  };

  const subtotal = items.reduce((s, i) => s + (i.total_price || 0), 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleSave = async () => {
    if (!selectedPatient) {
      showToast("Please select a patient");
      return;
    }
    if (!items[0]?.brand) {
      showToast("Add at least one medicine");
      return;
    }
    setSaving(true);
    try {
      await apiCreateInvoice({
        patient_id: selectedPatient.id,
        subtotal,
        discount,
        grand_total: grandTotal,
        purchase_status: status,
        purchaser,
        notes,
        items,
      });
      showToast("Invoice created!");
      setTimeout(() => router.push("/invoices"), 700);
    } catch (err) {
      const e = err as any;
      showToast(e.response?.data?.error || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 11,
    border: `1.5px solid ${COLORS.border}`,
    fontSize: 13,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    background: "white",
    color: COLORS.textPrimary,
    boxSizing: "border-box" as const,
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 5,
  };
  const card: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    marginBottom: 12,
    overflow: "hidden",
  };

  if (loading)
    return (
      <AppShell title="Create Invoice">
        <Spinner />
      </AppShell>
    );

  return (
    <AppShell title="Create Invoice">
      <div style={{ background: "#F8FAFC", minHeight: "100%", padding: 16 }}>
        {/* Patient selector */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Select Patient *
            </p>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatSearch(e.target.value);
                  setShowDrop(true);
                  setSelected(null);
                }}
                onFocus={(e) => {
                  setShowDrop(true);
                  e.currentTarget.style.borderColor = COLORS.primary;
                }}
                placeholder="Search by name or mobile..."
                style={inp}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  setTimeout(() => setShowDrop(false), 150);
                }}
              />
              {showDrop && patientSearch && filteredPatients.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: `1.5px solid ${COLORS.primary}`,
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    maxHeight: 200,
                    overflowY: "auto",
                    marginTop: 4,
                  }}
                >
                  {filteredPatients.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      onMouseDown={() => selectPatient(p)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = COLORS.primaryLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
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
                        {p.mobile} &bull; {p.area} &bull; {p.primary_disease}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedPatient && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  background: COLORS.primaryLight,
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.primary}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: COLORS.primary,
                      margin: "0 0 2px",
                    }}
                  >
                    {selectedPatient.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: COLORS.textSecondary,
                      margin: 0,
                    }}
                  >
                    {selectedPatient.mobile} &bull;{" "}
                    {selectedPatient.primary_disease} &bull;{" "}
                    {selectedPatient.area}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medicine items */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Medicine Items
            </p>
          </div>
          <div
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#F8FAFC",
                  borderRadius: 14,
                  padding: 12,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: COLORS.primary,
                      margin: 0,
                    }}
                  >
                    Item {i + 1}
                  </p>
                  {items.length > 1 && (
                    <button
                      onClick={() =>
                        setItems((p) => p.filter((_, idx) => idx !== i))
                      }
                      style={{
                        padding: "3px 10px",
                        borderRadius: 8,
                        background: "#FFF5F5",
                        color: "#C62828",
                        border: "1px solid #FFCDD2",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <label style={lbl}>Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Norvasc"
                        value={item.brand}
                        onChange={(e) => updateItem(i, "brand", e.target.value)}
                        style={inp}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                    <div>
                      <label style={lbl}>Strength</label>
                      <input
                        type="text"
                        placeholder="e.g. 5mg"
                        value={item.strength || ""}
                        onChange={(e) =>
                          updateItem(i, "strength", e.target.value)
                        }
                        style={inp}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <label style={lbl}>Quantity</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(i, "qty", parseFloat(e.target.value) || 0)
                        }
                        style={inp}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                    <div>
                      <label style={lbl}>Unit Price (Rs)</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "unit_price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        style={inp}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                    <div>
                      <label style={lbl}>Total</label>
                      <div
                        style={{
                          ...inp,
                          background: COLORS.primaryLight,
                          color: COLORS.primary,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Rs {(item.total_price || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                  {item.consumption_days && item.consumption_days > 0 ? (
                    <div
                      style={{
                        padding: "7px 12px",
                        background: "#E8F5E9",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "#2E7D32",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        Estimated supply
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#2E7D32",
                          margin: 0,
                        }}
                      >
                        {item.consumption_days} days
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setItems((p) => [
                  ...p,
                  {
                    brand: "",
                    composition: "",
                    strength: "",
                    qty: 30,
                    dose_per_day: 1,
                    unit_price: 0,
                    total_price: 0,
                  },
                ])
              }
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: COLORS.primaryLight,
                color: COLORS.primary,
                border: `2px dashed ${COLORS.primary}`,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {/* Invoice summary */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Invoice Summary
            </p>
          </div>
          <div style={{ padding: 14 }}>
            {[["Subtotal", `Rs ${subtotal.toLocaleString("en-IN")}`]].map(
              ([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: `1px solid #F8FAFC`,
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
                    {l}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      margin: 0,
                    }}
                  >
                    {v}
                  </p>
                </div>
              ),
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: `1px solid #F8FAFC`,
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
                Discount
              </p>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                style={{
                  width: 100,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${COLORS.border}`,
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  textAlign: "right",
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0 4px",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                  margin: 0,
                }}
              >
                Grand Total
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: COLORS.primary,
                  margin: 0,
                }}
              >
                Rs {grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase status */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Purchase Status
            </p>
          </div>
          <div
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[
              {
                val: "purchased_us",
                label: "Purchased from Us",
                color: "#2E7D32",
                bg: "#E8F5E9",
                border: "#A5D6A7",
              },
              {
                val: "purchased_other",
                label: "Purchased from Other Store",
                color: "#E65100",
                bg: "#FFF3E0",
                border: "#FFCC80",
              },
              {
                val: "pending",
                label: "Will Purchase Later",
                color: "#546E7A",
                bg: "#ECEFF1",
                border: "#CFD8DC",
              },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setStatus(s.val)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left" as const,
                  border: `2px solid ${status === s.val ? s.border : COLORS.border}`,
                  background: status === s.val ? s.bg : "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `2px solid ${status === s.val ? s.color : COLORS.border}`,
                    background: status === s.val ? s.color : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {status === s.val && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "white",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: status === s.val ? s.color : COLORS.textPrimary,
                  }}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Purchaser */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Purchased By
            </p>
          </div>
          <div style={{ padding: 14, display: "flex", gap: 8 }}>
            {["Self", "Family", "Caretaker"].map((p) => (
              <button
                key={p}
                onClick={() => setPurchaser(p)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${purchaser === p ? COLORS.primary : COLORS.border}`,
                  background: purchaser === p ? COLORS.primaryLight : "white",
                  color:
                    purchaser === p ? COLORS.primary : COLORS.textSecondary,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={card}>
          <div
            style={{
              padding: "12px 16px",
              background: "#FAFBFC",
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
                margin: 0,
              }}
            >
              Notes (Optional)
            </p>
          </div>
          <div style={{ padding: 14 }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this purchase..."
              rows={3}
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 11,
                border: `1.5px solid ${COLORS.border}`,
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                resize: "none" as const,
                lineHeight: 1.6,
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 14,
            border: "none",
            marginBottom: 16,
            background: saving
              ? "#90A4AE"
              : `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: saving ? "none" : "0 4px 12px rgba(21,101,192,0.3)",
          }}
        >
          {saving ? "Creating Invoice..." : "Create Invoice"}
        </button>
      </div>
    </AppShell>
  );
}
