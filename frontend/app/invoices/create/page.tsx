"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetPatients, apiCreateInvoice } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import type { Patient, InvoiceItem } from "@/types";

const EMPTY_ITEM: InvoiceItem = {
  brand: "",
  composition: "",
  strength: "",
  qty: 30,
  dose_per_day: 1,
  unit_price: 0,
  total_price: 0,
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelected] = useState<Patient | null>(null);
  const [patientSearch, setPatSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [discount, setDiscount] = useState(0);
  const [purchaseStatus, setStatus] = useState("purchased_us");
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
        // Pre-select if patient_id passed in URL
        const pid = searchParams.get("patient_id");
        if (pid) {
          const found = data.find((p) => p.id === pid);
          if (found) {
            setSelected(found);
            setPatSearch(found.name);
            // Auto-fill medicines from patient
            if (found.medicines?.length) {
              setItems(
                found.medicines.map((m) => ({
                  brand: m.brand,
                  composition: m.composition,
                  strength: m.strength,
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
    setShowDropdown(false);
    // Auto-fill items from patient medicines
    if (p.medicines?.length) {
      setItems(
        p.medicines.map((m) => ({
          brand: m.brand,
          composition: m.composition,
          strength: m.strength,
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
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      // Auto-calc total_price and consumption_days
      if (field === "unit_price" || field === "qty") {
        updated[i].total_price =
          (field === "qty" ? value : updated[i].qty) *
          (field === "unit_price" ? value : updated[i].unit_price);
      }
      if (field === "qty" || field === "dose_per_day") {
        const qty = field === "qty" ? value : updated[i].qty;
        const dose = field === "dose_per_day" ? value : updated[i].dose_per_day;
        updated[i].consumption_days = dose > 0 ? Math.ceil(qty / dose) : 0;
      }
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (i: number) => {
    if (items.length === 1) {
      showToast("At least one item required");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0,
  );
  const grandTotal = Math.max(0, subtotal - discount);

  const handleSave = async () => {
    if (!selectedPatient) {
      showToast("Please select a patient");
      return;
    }
    if (!items[0].brand) {
      showToast("Please add at least one medicine");
      return;
    }

    setSaving(true);
    try {
      await apiCreateInvoice({
        patient_id: selectedPatient.id,
        subtotal,
        discount,
        grand_total: grandTotal,
        purchase_status: purchaseStatus,
        purchaser,
        notes,
        items,
      });
      showToast("Invoice created successfully");
      setTimeout(() => router.push("/invoices"), 800);
    } catch (err) {
      const error = err as any;
      showToast(error.response?.data?.error || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PhoneShell>
        <TopBar title="Create Invoice" backHref="/invoices" />
        <Spinner />
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopBar title="Create Invoice" backHref="/invoices" />

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3">
        {/* Patient selector */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Select Patient *
          </label>
          <div className="relative">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatSearch(e.target.value);
                setShowDropdown(true);
                setSelected(null);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search patient name or mobile..."
              className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4]"
            />
            {showDropdown && patientSearch && filteredPatients.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#dce6f0] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
                {filteredPatients.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#e8f1fb] border-b border-gray-50 last:border-0"
                  >
                    <p className="text-[13px] font-bold">{p.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {p.mobile} · {p.area}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected patient card */}
          {selectedPatient && (
            <div className="mt-2 bg-[#e8f1fb] rounded-xl p-3 border border-[#1a6fc4]/20">
              <p className="text-[13px] font-extrabold text-[#1a6fc4]">
                {selectedPatient.name}
              </p>
              <p className="text-[11px] text-gray-500">
                {selectedPatient.mobile} · {selectedPatient.area} ·{" "}
                {selectedPatient.primary_disease}
              </p>
            </div>
          )}
        </div>

        {/* Medicine items */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Medicine Items
          </p>

          {items.map((item, i) => (
            <div
              key={i}
              className="bg-[#f7fbff] rounded-xl p-3 mb-2 border border-[#dce6f0]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-extrabold text-[#1a6fc4]">
                  Item {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="text-[11px] text-red-500 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Brand name"
                    value={item.brand}
                    onChange={(e) => updateItem(i, "brand", e.target.value)}
                    className="px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[12px] outline-none focus:border-[#1a6fc4] bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Strength"
                    value={item.strength || ""}
                    onChange={(e) => updateItem(i, "strength", e.target.value)}
                    className="px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[12px] outline-none focus:border-[#1a6fc4] bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(i, "qty", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[12px] outline-none focus:border-[#1a6fc4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                      Unit Price
                    </label>
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
                      className="w-full px-2 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[12px] outline-none focus:border-[#1a6fc4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                      Total
                    </label>
                    <div className="px-2 py-2 bg-[#e8f1fb] rounded-lg text-[12px] font-bold text-[#1a6fc4]">
                      Rs {item.total_price?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {item.consumption_days && item.consumption_days > 0 ? (
                  <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                    Supply: {item.qty} units / {item.dose_per_day}/day ={" "}
                    {item.consumption_days} days
                  </p>
                ) : null}
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="w-full py-2.5 border-2 border-dashed border-[#1a6fc4] rounded-xl text-[#1a6fc4] text-[12px] font-bold bg-[#e8f1fb]"
          >
            + Add Another Medicine
          </button>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl p-3 border border-[#dce6f0] mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-3">
            Invoice Summary
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">
                Rs {subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-[#dce6f0] rounded-lg text-right text-[12px] outline-none focus:border-[#1a6fc4]"
              />
            </div>
            <div className="flex justify-between text-[15px] font-extrabold border-t border-dashed border-gray-200 pt-2 mt-1">
              <span>Grand Total</span>
              <span className="text-[#1a6fc4]">
                Rs {grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Purchase status */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Purchase Status
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                val: "purchased_us",
                label: "From Us",
                color: "border-green-400 bg-green-50 text-green-700",
              },
              {
                val: "purchased_other",
                label: "Other Store",
                color: "border-orange-400 bg-orange-50 text-orange-700",
              },
              {
                val: "pending",
                label: "Will Buy",
                color: "border-gray-300 bg-gray-50 text-gray-500",
              },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setStatus(s.val)}
                className={`py-2.5 rounded-xl border-2 text-[11px] font-bold transition-all ${
                  purchaseStatus === s.val
                    ? s.color + " border-2"
                    : "border-[#dce6f0] bg-white text-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purchaser */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            Purchased By
          </p>
          <div className="flex gap-2">
            {["Self", "Family", "Caretaker"].map((p) => (
              <button
                key={p}
                onClick={() => setPurchaser(p)}
                className={`flex-1 py-2 rounded-xl border-[1.5px] text-[12px] font-bold transition-all ${
                  purchaser === p
                    ? "bg-[#1a6fc4] border-[#1a6fc4] text-white"
                    : "bg-white border-[#dce6f0] text-gray-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this purchase..."
            rows={3}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] resize-none"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-[#1a6fc4] text-white rounded-xl font-bold text-[15px] disabled:opacity-60 mb-2"
        >
          {saving ? "Creating Invoice..." : "Create Invoice"}
        </button>

        <div className="h-6" />
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}
