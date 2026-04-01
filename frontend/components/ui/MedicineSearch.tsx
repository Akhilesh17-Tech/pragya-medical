"use client";
import { useState, useRef, useEffect } from "react";
import { apiSearchInventory } from "@/lib/api";
import { COLORS } from "@/lib/theme";
import type { InventoryItem } from "@/types";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (item: InventoryItem) => void;
  placeholder?: string;
  field?: "brand" | "composition";
  style?: React.CSSProperties;
}

export default function MedicineSearch({
  value,
  onChange,
  onSelect,
  placeholder,
  field = "brand",
  style,
}: Props) {
  const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleInput = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setSuggestions([]);
      setShow(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiSearchInventory(val, field);
        setSuggestions(res.data.data || []);
        setShow(true);
      } catch {
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleSelect = (item: InventoryItem) => {
    onChange(field === "brand" ? item.brand : item.composition);
    setSuggestions([]);
    setShow(false);
    onSelect?.(item);
  };

  const baseInp: React.CSSProperties = {
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
    ...style,
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.primary;
          if (suggestions.length) setShow(true);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = COLORS.border;
          setTimeout(() => setShow(false), 150);
        }}
        placeholder={
          placeholder ||
          (field === "brand"
            ? "Type brand name..."
            : "Type salt/composition...")
        }
        style={baseInp}
        autoComplete="off"
      />

      {loading && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: `2px solid ${COLORS.border}`,
              borderTop: `2px solid ${COLORS.primary}`,
              animation: "spin 0.6s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {show && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 200,
            background: "white",
            border: `1.5px solid ${COLORS.primary}`,
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            maxHeight: 220,
            overflowY: "auto",
            marginTop: 2,
          }}
        >
          {suggestions.map((item) => (
            <div
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              style={{
                padding: "10px 13px",
                cursor: "pointer",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = COLORS.primaryLight)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: COLORS.primary,
                      margin: "0 0 2px",
                    }}
                  >
                    {item.brand}
                  </p>
                  <p
                    style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}
                  >
                    {item.composition} &bull; {item.strength} &bull;{" "}
                    {item.company}
                  </p>
                </div>
                <div
                  style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background:
                        item.current_stock <= 0
                          ? "#FFEBEE"
                          : item.low_stock
                            ? "#FFF3E0"
                            : "#E8F5E9",
                      color:
                        item.current_stock <= 0
                          ? "#C62828"
                          : item.low_stock
                            ? "#E65100"
                            : "#2E7D32",
                    }}
                  >
                    {item.current_stock <= 0
                      ? "OUT OF STOCK"
                      : item.low_stock
                        ? `LOW: ${item.current_stock}`
                        : `${item.current_stock} ${item.unit}`}
                  </span>
                  <p
                    style={{
                      fontSize: 10,
                      color: COLORS.textMuted,
                      margin: "3px 0 0",
                    }}
                  >
                    Rs {item.selling_price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {show && suggestions.length === 0 && value.length >= 2 && !loading && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 200,
            background: "white",
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: "0 0 12px 12px",
            padding: "10px 14px",
            marginTop: 2,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: COLORS.textMuted,
              margin: 0,
              fontWeight: 500,
            }}
          >
            No medicine found for "{value}" — you can still type manually or add
            it to inventory first.
          </p>
        </div>
      )}
    </div>
  );
}
