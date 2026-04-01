"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetPatient, apiUpdatePatient, apiAddMedicine, apiUpdateMedicine, apiDeleteMedicine, apiRefillMedicine } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import { DISEASES } from "@/lib/utils";
import type { Patient, Medicine } from "@/types";

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13,
  fontFamily: "Inter, sans-serif", outline: "none", background: "white",
  color: COLORS.textPrimary, boxSizing: "border-box" as const,
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: COLORS.textSecondary, textTransform: "uppercase" as const,
  letterSpacing: 0.8, marginBottom: 6,
};
const card: React.CSSProperties = {
  background: "white", borderRadius: 16, padding: 16,
  border: `1px solid ${COLORS.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  marginBottom: 12,
};

export default function EditPatientPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState<"info"|"medicines">("info");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Form fields
  const [name, setName]         = useState("");
  const [mobile, setMobile]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge]           = useState("");
  const [gender, setGender]     = useState("Male");
  const [area, setArea]         = useState("");
  const [address, setAddress]   = useState("");
  const [doctor, setDoctor]     = useState("");
  const [primaryDisease, setPrimary] = useState("");
  const [diseases, setDiseases] = useState<string[]>([]);
  const [insurance, setInsurance] = useState("");
  const [insuranceDate, setInsuranceDate] = useState("");
  const [expense, setExpense]   = useState("");
  const [delivery, setDelivery] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace("/"); return; }
    apiGetPatient(id).then(res => {
      const p: Patient = res.data.data;
      setPatient(p);
      setName(p.name || "");
      setMobile(p.mobile || "");
      setWhatsapp(p.whatsapp || "");
      setAge(String(p.age || ""));
      setGender(p.gender || "Male");
      setArea(p.area || "");
      setAddress(p.address || "");
      setDoctor(p.doctor || "");
      setPrimary(p.primary_disease || "");
      setDiseases(p.diseases || []);
      setInsurance(p.insurance || "");
      setInsuranceDate(p.insurance_date ? p.insurance_date.split("T")[0] : "");
      setExpense(String(p.monthly_expense || ""));
      setDelivery(p.delivery || false);
      setDeliveryStatus(p.delivery_status || "");
    }).catch(() => { showToast("Failed to load"); router.replace("/patients"); })
    .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { showToast("Name is required"); return; }
    setSaving(true);
    try {
      await apiUpdatePatient(id, {
        name, mobile, whatsapp: whatsapp || mobile,
        age: parseInt(age) || 0, gender, area, address, doctor,
        primary_disease: primaryDisease,
        diseases: diseases.length > 0 ? diseases : [primaryDisease].filter(Boolean),
        insurance, insurance_date: insuranceDate || null,
        monthly_expense: parseInt(expense) || 0,
        delivery, delivery_status: deliveryStatus,
      });
      showToast("Patient updated successfully");
      setTimeout(() => router.push(`/patients/${id}`), 700);
    } catch { showToast("Failed to update"); }
    finally { setSaving(false); }
  };

  const toggleDisease = (d: string) =>
    setDiseases(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  if (loading) return <AppShell title="Edit Patient"><Spinner /></AppShell>;
  if (!patient) return null;

  return (
    <AppShell title={`Edit — ${patient.name}`}>
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>

        {/* Tab switcher */}
        <div style={{ background: "white", display: "flex", borderBottom: `1px solid ${COLORS.border}` }}>
          {[["info","Patient Info"],["medicines","Medicines"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as any)} style={{
              flex: 1, padding: "14px 0", fontSize: 13, fontWeight: 700,
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              color: tab === key ? COLORS.primary : COLORS.textMuted,
              borderBottom: tab === key ? `2.5px solid ${COLORS.primary}` : "2.5px solid transparent",
              transition: "all 0.15s",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>

          {/* ── PATIENT INFO TAB ── */}
          {tab === "info" && (
            <>
              <div style={card}>
                <p style={{ fontSize: 11, fontWeight: 800, color: COLORS.primary, textTransform: "uppercase" as const, letterSpacing: 1, margin: "0 0 14px" }}>Basic Info</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={lbl}>Mobile</label>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                    </div>
                    <div>
                      <label style={lbl}>WhatsApp</label>
                      <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={lbl}>Age</label>
                      <input type="number" value={age} onChange={e => setAge(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                    </div>
                    <div>
                      <label style={lbl}>Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Area</label>
                    <input type="text" value={area} onChange={e => setArea(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                  <div>
                    <label style={lbl}>Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                  <div>
                    <label style={lbl}>Doctor</label>
                    <input type="text" value={doctor} onChange={e => setDoctor(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                </div>
              </div>

              <div style={card}>
                <p style={{ fontSize: 11, fontWeight: 800, color: COLORS.primary, textTransform: "uppercase" as const, letterSpacing: 1, margin: "0 0 14px" }}>Disease & Insurance</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={lbl}>Primary Disease</label>
                    <select value={primaryDisease} onChange={e => setPrimary(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border}>
                      <option value="">-- Select --</option>
                      {DISEASES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>All Conditions</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {DISEASES.filter(d => d !== "Other").map(d => (
                        <label key={d} onClick={() => toggleDisease(d)} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
                          borderRadius: 10, cursor: "pointer",
                          background: diseases.includes(d) ? COLORS.primaryLight : "#F8FAFC",
                          border: `1.5px solid ${diseases.includes(d) ? COLORS.primary : COLORS.border}`,
                        }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            background: diseases.includes(d) ? COLORS.primary : "white",
                            border: `2px solid ${diseases.includes(d) ? COLORS.primary : COLORS.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {diseases.includes(d) && <span style={{ color: "white", fontSize: 9, fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: diseases.includes(d) ? COLORS.primary : COLORS.textPrimary }}>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={lbl}>Insurance Co.</label>
                      <input type="text" value={insurance} onChange={e => setInsurance(e.target.value)} placeholder="Star Health..." style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                    </div>
                    <div>
                      <label style={lbl}>Expiry Date</label>
                      <input type="date" value={insuranceDate} onChange={e => setInsuranceDate(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Monthly Expense (Rs)</label>
                    <input type="number" value={expense} onChange={e => setExpense(e.target.value)} placeholder="850" style={inp} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} style={{
                width: "100%", padding: 15, borderRadius: 14, border: "none",
                background: saving ? "#90A4AE" : `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                color: "white", fontSize: 15, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 12px rgba(21,101,192,0.3)",
              }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}

          {/* ── MEDICINES TAB ── */}
          {tab === "medicines" && patient && (
            <MedicinesTab patient={patient} onRefresh={loadPatient} />
          )}
        </div>
      </div>
    </AppShell>
  );

  function loadPatient() {
    apiGetPatient(id).then(res => setPatient(res.data.data)).catch(() => {});
  }
}

function MedicinesTab({ patient, onRefresh }: { patient: Patient; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [newMed, setNewMed] = useState({
    brand: "", composition: "", company: "", strength: "",
    dosage_form: "tablet", qty: 30, dose_per_day: 1,
    start_date: new Date().toISOString().split("T")[0],
  });

  const handleAdd = async () => {
    if (!newMed.brand.trim()) { showToast("Brand name required"); return; }
    try {
      await apiAddMedicine(patient.id, newMed);
      showToast("Medicine added");
      setAdding(false);
      setNewMed({ brand: "", composition: "", company: "", strength: "", dosage_form: "tablet", qty: 30, dose_per_day: 1, start_date: new Date().toISOString().split("T")[0] });
      onRefresh();
    } catch { showToast("Failed to add medicine"); }
  };

  const handleRefill = async (medId: string, brand: string) => {
    try {
      await apiRefillMedicine(medId);
      showToast(brand + " refilled — start date reset to today");
      onRefresh();
    } catch { showToast("Failed to refill"); }
  };

  const handleDelete = async (medId: string, brand: string) => {
    if (!confirm(`Remove ${brand}?`)) return;
    try {
      await apiDeleteMedicine(medId);
      showToast(brand + " removed");
      onRefresh();
    } catch { showToast("Failed to remove"); }
  };

  const supply = (qty: number, dose: number) => dose > 0 ? Math.ceil(qty / dose) : 0;

  return (
    <div>
      {/* Existing medicines */}
      {patient.medicines?.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16, border: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.textSecondary, margin: "0 0 4px" }}>No medicines added</p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>Add the first medicine below</p>
        </div>
      ) : (
        patient.medicines?.map((m, idx) => {
          const dl = m.days_left ?? 0;
          const sup = supply(m.qty, m.dose_per_day);
          const dlColor = dl <= 0 ? "#C62828" : dl <= 3 ? "#E65100" : "#2E7D32";
          const dlBg    = dl <= 0 ? "#FFEBEE" : dl <= 3 ? "#FFF3E0" : "#E8F5E9";
          return (
            <div key={m.id || idx} style={{
              background: "white", borderRadius: 16, marginBottom: 10,
              border: `1px solid ${COLORS.border}`, overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {/* Medicine header */}
              <div style={{
                padding: "10px 14px", background: "#F8FAFC",
                borderBottom: `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 2px" }}>{m.brand}</p>
                  <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}>
                    {[m.composition, m.strength, m.dosage_form].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span style={{ background: dlBg, color: dlColor, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>
                  {dl <= 0 ? "FINISHED" : `${dl}d left`}
                </span>
              </div>

              {/* Stats */}
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    ["QTY",    `${m.qty} units`],
                    ["DOSE",   `${m.dose_per_day}/day`],
                    ["SUPPLY", `${sup} days`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: "#F8FAFC", borderRadius: 10, padding: "8px", textAlign: "center", border: `1px solid ${COLORS.border}` }}>
                      <p style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 700, margin: "0 0 3px", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{l}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.textPrimary, margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* Stock status badge */}
                <div style={{
                  padding: "8px 12px", borderRadius: 10, marginBottom: 10,
                  background: dl <= 0 ? "#FFEBEE" : dl <= 7 ? "#FFF3E0" : "#E8F5E9",
                  border: `1px solid ${dl <= 0 ? "#FFCDD2" : dl <= 7 ? "#FFCC80" : "#A5D6A7"}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: dl <= 0 ? "#C62828" : dl <= 7 ? "#E65100" : "#2E7D32",
                  }} />
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: dl <= 0 ? "#C62828" : dl <= 7 ? "#E65100" : "#2E7D32" }}>
                    {dl <= 0 ? "Out of stock — needs immediate refill" :
                     dl <= 3 ? "Critical — refill within 3 days" :
                     dl <= 7 ? "Low stock — plan refill soon" :
                     "In stock — sufficient supply"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => m.id && handleRefill(m.id, m.brand)} style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    background: "#E8F5E9", color: "#2E7D32",
                    border: "1.5px solid #A5D6A7", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    Refilled Today
                  </button>
                  <button onClick={() => m.id && handleDelete(m.id, m.brand)} style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "#FFF5F5", color: "#C62828",
                    border: "1.5px solid #FFCDD2", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Add medicine form */}
      {adding ? (
        <div style={{
          background: "white", borderRadius: 16, overflow: "hidden",
          border: `1.5px solid ${COLORS.primary}`, boxShadow: "0 4px 16px rgba(21,101,192,0.12)",
          marginBottom: 12,
        }}>
          <div style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`, padding: "10px 14px" }}>
            <p style={{ color: "white", fontSize: 13, fontWeight: 800, margin: 0 }}>New Medicine</p>
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={inp_lbl}>Brand Name *</label>
              <input type="text" value={newMed.brand} onChange={e => setNewMed(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Norvasc" style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={inp_lbl}>Composition</label>
                <input type="text" value={newMed.composition} onChange={e => setNewMed(p => ({ ...p, composition: e.target.value }))} placeholder="Salt name" style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
              <div>
                <label style={inp_lbl}>Strength</label>
                <input type="text" value={newMed.strength} onChange={e => setNewMed(p => ({ ...p, strength: e.target.value }))} placeholder="5mg" style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={inp_lbl}>Quantity</label>
                <input type="number" value={newMed.qty} onChange={e => setNewMed(p => ({ ...p, qty: parseFloat(e.target.value) || 0 }))} style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
              <div>
                <label style={inp_lbl}>Dose/Day</label>
                <select value={newMed.dose_per_day} onChange={e => setNewMed(p => ({ ...p, dose_per_day: parseFloat(e.target.value) }))} style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border}>
                  {[0.5,1,1.5,2,3,4].map(v => <option key={v} value={v}>{v}/day</option>)}
                </select>
              </div>
              <div>
                <label style={inp_lbl}>Start Date</label>
                <input type="date" value={newMed.start_date} onChange={e => setNewMed(p => ({ ...p, start_date: e.target.value }))} style={inp_style} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
            </div>
            {newMed.qty > 0 && newMed.dose_per_day > 0 && (
              <div style={{ padding: "8px 12px", background: COLORS.primaryLight, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: COLORS.textSecondary, margin: 0, fontWeight: 600 }}>Estimated supply</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, margin: 0 }}>{Math.ceil(newMed.qty / newMed.dose_per_day)} days</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleAdd} style={{
                flex: 2, padding: "11px", borderRadius: 10,
                background: COLORS.primary, color: "white",
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                Add Medicine
              </button>
              <button onClick={() => setAdding(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10,
                background: "#F1F5F9", color: COLORS.textSecondary,
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{
          width: "100%", padding: 14, borderRadius: 14,
          background: COLORS.primaryLight, color: COLORS.primary,
          border: `2px dashed ${COLORS.primary}`, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "Inter, sans-serif", marginBottom: 12,
        }}>
          + Add New Medicine
        </button>
      )}
    </div>
  );
}

const inp_style: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 11,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13,
  fontFamily: "Inter, sans-serif", outline: "none", background: "white",
  color: COLORS.textPrimary, boxSizing: "border-box" as const,
};
const inp_lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: COLORS.textSecondary, textTransform: "uppercase" as const,
  letterSpacing: 0.8, marginBottom: 5,
};