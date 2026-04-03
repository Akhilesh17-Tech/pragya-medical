"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  apiGetInventory,
  apiCreateInventory,
  apiUpdateInventory,
  apiDeleteInventory,
  apiUpdateStock,
  apiGetStockMovements,
} from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import type { InventoryItem, StockMovement } from "@/types";

const CATEGORIES = ["All", "BP", "Sugar", "Thyroid", "Heart", "Pain", "Other"];

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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lowOnly, setLowOnly] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItem, setSelected] = useState<InventoryItem | null>(null);
  const [showStock, setShowStock] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const router = useRouter();

  // Add form
  const [newBrand, setNewBrand] = useState("");
  const [newComp, setNewComp] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newStrength, setNewStrength] = useState("");
  const [newForm, setNewForm] = useState("tablet");
  const [newCat, setNewCat] = useState("BP");
  const [newStock, setNewStock] = useState("");
  const [newMinAlert, setNewMinAlert] = useState("10");
  const [newUnit, setNewUnit] = useState("tablets");
  const [newPurchasePrice, setNewPP] = useState("");
  const [newSellingPrice, setNewSP] = useState("");

  // Stock update form
  const [stockType, setStockType] = useState<"add" | "deduct" | "adjustment">(
    "add",
  );
  const [stockQty, setStockQty] = useState("");
  const [stockReason, setStockReason] = useState("purchase");
  const [stockNotes, setStockNotes] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    load();
  }, [search, category, lowOnly]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGetInventory({
        search: search || undefined,
        category: category !== "All" ? category : undefined,
        low_stock: lowOnly ? "true" : undefined,
      });
      setItems(res.data.data || []);
    } catch {
      showToast("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newBrand.trim()) {
      showToast("Brand name required");
      return;
    }
    try {
      await apiCreateInventory({
        brand: newBrand,
        composition: newComp,
        company: newCompany,
        strength: newStrength,
        dosage_form: newForm,
        category: newCat,
        current_stock: parseFloat(newStock) || 0,
        min_stock_alert: parseFloat(newMinAlert) || 10,
        unit: newUnit,
        purchase_price: parseFloat(newPurchasePrice) || 0,
        selling_price: parseFloat(newSellingPrice) || 0,
      });
      showToast("Medicine added to inventory");
      setShowAdd(false);
      resetAddForm();
      load();
    } catch {
      showToast("Failed to add");
    }
  };

  const resetAddForm = () => {
    setNewBrand("");
    setNewComp("");
    setNewCompany("");
    setNewStrength("");
    setNewForm("tablet");
    setNewCat("BP");
    setNewStock("");
    setNewMinAlert("10");
    setNewUnit("tablets");
    setNewPP("");
    setNewSP("");
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete ${item.brand} from inventory?`)) return;
    try {
      await apiDeleteInventory(item.id);
      showToast("Deleted from inventory");
      load();
    } catch {
      showToast("Failed to delete");
    }
  };

  const openStockModal = async (item: InventoryItem) => {
    setSelected(item);
    setShowStock(true);
    setStockQty("");
    setStockType("add");
    setStockReason("purchase");
    setStockNotes("");
    try {
      const res = await apiGetStockMovements(item.id);
      setMovements(res.data.data || []);
    } catch {}
  };

  const handleStockUpdate = async () => {
    if (!selectedItem || !stockQty) {
      showToast("Enter quantity");
      return;
    }
    setStockSaving(true);
    try {
      const res = await apiUpdateStock(selectedItem.id, {
        type: stockType,
        quantity: parseFloat(stockQty),
        reason: stockReason,
        notes: stockNotes,
      });
      showToast(
        "Stock updated — " +
          res.data.current_stock +
          " " +
          selectedItem.unit +
          " remaining",
      );
      setShowStock(false);
      load();
    } catch {
      showToast("Failed to update stock");
    } finally {
      setStockSaving(false);
    }
  };

  const lowCount = items.filter((i) => i.low_stock).length;

  return (
    <AppShell title="Inventory">
      <div style={{ background: "#F8FAFC", minHeight: "100%", padding: "0" }}>
        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            padding: "16px clamp(16px, 3vw, 32px) 20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[
              {
                label: "Total Medicines",
                val: items.length,
                bg: "rgba(255,255,255,0.15)",
              },
              {
                label: "Low Stock",
                val: lowCount,
                bg:
                  lowCount > 0
                    ? "rgba(198,40,40,0.5)"
                    : "rgba(255,255,255,0.1)",
              },
              {
                label: "Categories",
                val: CATEGORIES.length - 1,
                bg: "rgba(255,255,255,0.1)",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.bg,
                  borderRadius: 14,
                  padding: "12px 10px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
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
                    color: "rgba(255,255,255,0.65)",
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

          {/* Search */}
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, salt, company..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            background: "white",
            padding: "10px clamp(16px, 3vw, 32px)",
            borderBottom: `1px solid ${COLORS.border}`,
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
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setLowOnly(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  background: !lowOnly ? COLORS.primary : "#F1F5F9",
                  color: !lowOnly ? "white" : COLORS.textSecondary,
                }}
              >
                All Stock
              </button>
              <button
                onClick={() => setLowOnly(true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  background: lowOnly ? "#C62828" : "#FFEBEE",
                  color: lowOnly ? "white" : "#C62828",
                }}
              >
                Low Stock {lowCount > 0 && `(${lowCount})`}
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
              }}
            >
              + Add Medicine
            </button>
          </div>

          {/* Category chips */}
          <div
            style={{ display: "flex", gap: 6, overflowX: "auto" }}
            className="scrollbar-hide"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  background: category === cat ? COLORS.primary : "#F1F5F9",
                  color: category === cat ? "white" : COLORS.textSecondary,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💊</p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.textSecondary,
                margin: "0 0 6px",
              }}
            >
              No medicines found
            </p>
            <p
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                margin: "0 0 20px",
              }}
            >
              Add medicines to track your stock
            </p>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add First Medicine
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "16px clamp(16px, 3vw, 32px)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "white",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${item.low_stock ? "#FFCDD2" : COLORS.border}`,
                  boxShadow: item.low_stock
                    ? "0 2px 8px rgba(198,40,40,0.1)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {/* Top bar */}
                <div
                  style={{
                    height: 4,
                    background:
                      item.current_stock <= 0
                        ? "#C62828"
                        : item.current_stock <= item.min_stock_alert
                          ? "#F57F17"
                          : "#43A047",
                  }}
                />

                <div style={{ padding: "12px 14px" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 3,
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
                          {item.brand}
                        </p>
                        {item.low_stock && (
                          <span
                            style={{
                              background: "#FFEBEE",
                              color: "#C62828",
                              fontSize: 9,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 6,
                              letterSpacing: 0.5,
                            }}
                          >
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          margin: 0,
                        }}
                      >
                        {item.composition} &bull; {item.strength} &bull;{" "}
                        {item.company}
                      </p>
                    </div>
                    <span
                      style={{
                        background: COLORS.primaryLight,
                        color: COLORS.primary,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 9px",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Stock + price grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      {
                        label: "In Stock",
                        val: `${item.current_stock} ${item.unit}`,
                        color:
                          item.current_stock <= 0
                            ? "#C62828"
                            : item.current_stock <= item.min_stock_alert
                              ? "#E65100"
                              : "#2E7D32",
                      },
                      {
                        label: "Min Alert",
                        val: `${item.min_stock_alert} ${item.unit}`,
                        color: COLORS.textSecondary,
                      },
                      {
                        label: "Buy Price",
                        val: `Rs ${item.purchase_price}`,
                        color: COLORS.textSecondary,
                      },
                      {
                        label: "Sell Price",
                        val: `Rs ${item.selling_price}`,
                        color: COLORS.primary,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: "#F8FAFC",
                          borderRadius: 10,
                          padding: "8px 6px",
                          textAlign: "center",
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            color: COLORS.textMuted,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: 0.4,
                            margin: "0 0 3px",
                          }}
                        >
                          {stat.label}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: stat.color,
                            margin: 0,
                          }}
                        >
                          {stat.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Stock progress bar */}
                  <div style={{ marginBottom: 10 }}>
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
                          borderRadius: 3,
                          transition: "width 0.5s ease",
                          background:
                            item.current_stock <= 0
                              ? "#C62828"
                              : item.current_stock <= item.min_stock_alert
                                ? "#F57F17"
                                : "#43A047",
                          width: `${Math.min(100, (item.current_stock / (item.min_stock_alert * 3)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: 10,
                        color: COLORS.textMuted,
                        margin: "4px 0 0",
                        fontWeight: 500,
                      }}
                    >
                      {item.current_stock <= 0
                        ? "Out of stock"
                        : item.current_stock <= item.min_stock_alert
                          ? `Low — reorder soon (min: ${item.min_stock_alert})`
                          : `Adequate stock`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openStockModal(item)}
                      style={{
                        flex: 2,
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
                      Update Stock
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        flex: 1,
                        padding: "9px 0",
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
            ))}
            <div style={{ height: 8 }} />
          </div>
        )}

        {/* ── ADD MEDICINE MODAL ── */}
        {showAdd && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 100,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setShowAdd(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "20px 20px 0 0",
                width: "100%",
                maxWidth: 480,
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: COLORS.border,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: COLORS.textPrimary,
                  margin: "0 0 16px",
                }}
              >
                Add Medicine to Inventory
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div>
                  <label style={lbl}>Brand Name *</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Norvasc, Glucophage"
                    style={inp}
                    onFocus={(e) =>
                      (e.target.style.borderColor = COLORS.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lbl}>Composition / Salt</label>
                    <input
                      type="text"
                      value={newComp}
                      onChange={(e) => setNewComp(e.target.value)}
                      placeholder="e.g. Amlodipine"
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
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      placeholder="e.g. 5mg"
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
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lbl}>Company</label>
                    <input
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="e.g. Pfizer"
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
                    <label style={lbl}>Category</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      style={inp}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    >
                      {[
                        "BP",
                        "Sugar",
                        "Thyroid",
                        "Heart",
                        "Pain",
                        "Asthma",
                        "Other",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lbl}>Dosage Form</label>
                    <select
                      value={newForm}
                      onChange={(e) => setNewForm(e.target.value)}
                      style={inp}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    >
                      {[
                        ["tablet", "Tablet"],
                        ["capsule", "Capsule"],
                        ["syrup", "Syrup"],
                        ["powder", "Powder"],
                        ["drops", "Drops"],
                        ["injection", "Injection"],
                        ["inhaler", "Inhaler"],
                        ["cream", "Cream/Gel"],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Unit</label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      style={inp}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    >
                      {[
                        "tablets",
                        "capsules",
                        "ml",
                        "sachets",
                        "vials",
                        "puffs",
                        "gm",
                      ].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lbl}>Opening Stock</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      placeholder="0"
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
                    <label style={lbl}>Min Stock Alert</label>
                    <input
                      type="number"
                      value={newMinAlert}
                      onChange={(e) => setNewMinAlert(e.target.value)}
                      placeholder="10"
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
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={lbl}>Purchase Price (Rs)</label>
                    <input
                      type="number"
                      value={newPurchasePrice}
                      onChange={(e) => setNewPP(e.target.value)}
                      placeholder="0"
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
                    <label style={lbl}>Selling Price (Rs)</label>
                    <input
                      type="number"
                      value={newSellingPrice}
                      onChange={(e) => setNewSP(e.target.value)}
                      placeholder="0"
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

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    onClick={handleAdd}
                    style={{
                      flex: 2,
                      padding: 13,
                      borderRadius: 12,
                      border: "none",
                      background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Add to Inventory
                  </button>
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      resetAddForm();
                    }}
                    style={{
                      flex: 1,
                      padding: 13,
                      borderRadius: 12,
                      border: `1.5px solid ${COLORS.border}`,
                      background: "white",
                      color: COLORS.textSecondary,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STOCK UPDATE MODAL ── */}
        {showStock && selectedItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 100,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setShowStock(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "20px 20px 0 0",
                width: "100%",
                maxWidth: 480,
                maxHeight: "85vh",
                overflowY: "auto",
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: COLORS.border,
                  borderRadius: 2,
                  margin: "0 auto 16px",
                }}
              />

              {/* Current stock info */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                  borderRadius: 14,
                  padding: "14px",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    margin: "0 0 4px",
                    fontWeight: 600,
                  }}
                >
                  Updating stock for
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: 800,
                    margin: "0 0 2px",
                  }}
                >
                  {selectedItem.brand}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    margin: "0 0 10px",
                  }}
                >
                  {selectedItem.composition} &bull; {selectedItem.strength}
                </p>
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 12,
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    Current Stock
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: 15,
                      fontWeight: 900,
                      margin: 0,
                    }}
                  >
                    {selectedItem.current_stock} {selectedItem.unit}
                    {selectedItem.low_stock && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "#C62828",
                          padding: "1px 7px",
                          borderRadius: 5,
                          marginLeft: 8,
                        }}
                      >
                        LOW
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Operation type */}
              <p style={{ ...lbl, marginBottom: 8 }}>Operation Type</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    val: "add" as const,
                    label: "Add Stock",
                    color: "#2E7D32",
                    bg: "#E8F5E9",
                    border: "#A5D6A7",
                  },
                  {
                    val: "deduct" as const,
                    label: "Deduct",
                    color: "#C62828",
                    bg: "#FFEBEE",
                    border: "#FFCDD2",
                  },
                  {
                    val: "adjustment" as const,
                    label: "Set Exact",
                    color: "#E65100",
                    bg: "#FFF3E0",
                    border: "#FFCC80",
                  },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setStockType(opt.val)}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      border: `2px solid ${stockType === opt.val ? opt.border : COLORS.border}`,
                      background: stockType === opt.val ? opt.bg : "white",
                      color:
                        stockType === opt.val
                          ? opt.color
                          : COLORS.textSecondary,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div>
                  <label style={lbl}>
                    {stockType === "add"
                      ? "Quantity to Add"
                      : stockType === "deduct"
                        ? "Quantity to Deduct"
                        : "New Total Stock"}
                  </label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder={`Enter quantity in ${selectedItem.unit}`}
                    style={{ ...inp, fontSize: 16, fontWeight: 700 }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = COLORS.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  />
                </div>

                <div>
                  <label style={lbl}>Reason</label>
                  <select
                    value={stockReason}
                    onChange={(e) => setStockReason(e.target.value)}
                    style={inp}
                    onFocus={(e) =>
                      (e.target.style.borderColor = COLORS.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  >
                    <option value="purchase">Purchase / Restock</option>
                    <option value="patient_dispensed">
                      Dispensed to Patient
                    </option>
                    <option value="expired">Expired Medicine</option>
                    <option value="damaged">Damaged / Lost</option>
                    <option value="return">Customer Return</option>
                    <option value="adjustment">Stock Adjustment</option>
                  </select>
                </div>

                <div>
                  <label style={lbl}>Notes (Optional)</label>
                  <input
                    type="text"
                    value={stockNotes}
                    onChange={(e) => setStockNotes(e.target.value)}
                    placeholder="e.g. Purchased 100 strips from wholesaler"
                    style={inp}
                    onFocus={(e) =>
                      (e.target.style.borderColor = COLORS.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  />
                </div>

                {/* Preview */}
                {stockQty && parseFloat(stockQty) > 0 && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background:
                        stockType === "add"
                          ? "#E8F5E9"
                          : stockType === "deduct"
                            ? "#FFEBEE"
                            : "#FFF3E0",
                      border: `1px solid ${stockType === "add" ? "#A5D6A7" : stockType === "deduct" ? "#FFCDD2" : "#FFCC80"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        margin: 0,
                        color: COLORS.textSecondary,
                      }}
                    >
                      After update:
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        margin: 0,
                        color:
                          stockType === "add"
                            ? "#2E7D32"
                            : stockType === "deduct"
                              ? "#C62828"
                              : "#E65100",
                      }}
                    >
                      {stockType === "add"
                        ? selectedItem.current_stock + parseFloat(stockQty)
                        : stockType === "deduct"
                          ? Math.max(
                              0,
                              selectedItem.current_stock - parseFloat(stockQty),
                            )
                          : parseFloat(stockQty)}{" "}
                      {selectedItem.unit}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleStockUpdate}
                  disabled={stockSaving}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    border: "none",
                    background: stockSaving
                      ? "#90A4AE"
                      : `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: stockSaving ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 4px 12px rgba(21,101,192,0.3)",
                  }}
                >
                  {stockSaving ? "Updating..." : "Update Stock"}
                </button>
              </div>

              {/* Recent movements */}
              {movements.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: `1px solid ${COLORS.border}`,
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
                    Recent Movements
                  </p>
                  {movements.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: `1px solid #F8FAFC`,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: COLORS.textPrimary,
                            margin: "0 0 2px",
                            textTransform: "capitalize" as const,
                          }}
                        >
                          {m.reason?.replace(/_/g, " ") || m.type}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: COLORS.textMuted,
                            margin: 0,
                          }}
                        >
                          {new Date(m.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color:
                            m.type === "add"
                              ? "#2E7D32"
                              : m.type === "deduct"
                                ? "#C62828"
                                : "#E65100",
                        }}
                      >
                        {m.type === "add"
                          ? "+"
                          : m.type === "deduct"
                            ? "-"
                            : "="}
                        {m.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
