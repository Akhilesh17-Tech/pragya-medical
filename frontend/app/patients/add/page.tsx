"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCreatePatient } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Toast, { showToast } from "@/components/ui/Toast";
import { DISEASES } from "@/lib/utils";
import { COLORS } from "@/lib/theme";
import MedicineSearch from "@/components/ui/MedicineSearch";

const STEPS = ["Basic Info", "Diseases", "Medicines", "Delivery", "Review"];

interface MedRow {
  brand: string;
  composition: string;
  company: string;
  strength: string;
  dosage_form: string;
  qty: number;
  dose_per_day: number;
  start_date: string;
}

const emptyMed = (): MedRow => ({
  brand: "",
  composition: "",
  company: "",
  strength: "",
  dosage_form: "tablet",
  qty: 30,
  dose_per_day: 1,
  start_date: new Date().toISOString().split("T")[0],
});

const inp = (extra?: object): React.CSSProperties => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  background: "white",
  color: COLORS.textPrimary,
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
  ...extra,
});

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: COLORS.textSecondary,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  marginBottom: 6,
};

export default function AddPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [doctor, setDoctor] = useState("");
  const [primaryDisease, setPrimary] = useState("");
  const [diseases, setDiseases] = useState<string[]>([]);
  const [insurance, setInsurance] = useState("");
  const [insuranceDate, setInsuranceDate] = useState("");
  const [medicines, setMedicines] = useState<MedRow[]>([emptyMed()]);
  const [delivery, setDelivery] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [deliveryBoy, setDeliveryBoy] = useState("");
  const [expense, setExpense] = useState("");
  const [notes, setNotes] = useState("");

  const toggleDisease = (d: string) =>
    setDiseases((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const updateMed = (i: number, field: keyof MedRow, value: any) =>
    setMedicines((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [field]: value };
      return n;
    });

  const addMed = () => setMedicines((p) => [...p, emptyMed()]);
  const removeMed = (i: number) => {
    if (medicines.length === 1) {
      showToast("At least one medicine required");
      return;
    }
    setMedicines((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!name.trim()) {
      showToast("Patient name is required");
      return;
    }
    setSaving(true);
    try {
      await apiCreatePatient({
        name,
        mobile,
        whatsapp: whatsapp || mobile,
        age: parseInt(age) || 0,
        gender,
        area,
        address,
        doctor,
        primary_disease: primaryDisease,
        diseases:
          diseases.length > 0
            ? diseases
            : primaryDisease
              ? [primaryDisease]
              : ["General"],
        medicines,
        delivery,
        delivery_status: deliveryStatus,
        delivery_boy: deliveryBoy,
        insurance,
        insurance_date: insuranceDate || null,
        monthly_expense: parseInt(expense) || 0,
        notes,
        is_draft: isDraft,
      });
      showToast(isDraft ? "Saved as draft" : "Patient added successfully!");
      setTimeout(() => router.push("/patients"), 700);
    } catch (err) {
      const e = err as any;
      showToast(e.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  };

  const sectionTitle = (
    title: string,
    color = COLORS.primary,
  ): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 800,
    color,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    margin: "0 0 14px",
  });

  return (
    <AppShell title={`Add Patient — Step ${step + 1}`}>
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
        {/* Step progress */}
        <div
          style={{
            background: "white",
            padding: "14px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? 1 : "none",
                }}
              >
                <div
                  onClick={() => i < step && setStep(i)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: i < step ? "pointer" : "default",
                    transition: "all 0.2s",
                    background:
                      i < step
                        ? "#E8F5E9"
                        : i === step
                          ? COLORS.primary
                          : "#F1F5F9",
                    color:
                      i < step
                        ? "#2E7D32"
                        : i === step
                          ? "white"
                          : COLORS.textMuted,
                    border:
                      i < step
                        ? "2px solid #A5D6A7"
                        : i === step
                          ? `2px solid ${COLORS.primary}`
                          : "2px solid transparent",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      margin: "0 4px",
                      background: i < step ? "#A5D6A7" : "#E0E7EF",
                      borderRadius: 1,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: COLORS.textPrimary,
                margin: 0,
              }}
            >
              {STEPS[step]}
            </p>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}>
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* STEP 1 — Basic Info */}
          {step === 0 && (
            <>
              <div style={sectionStyle}>
                <p style={sectionTitle("Personal Information")}>
                  Personal Information
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter patient's full name"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
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
                      <label style={lbl}>Mobile Number</label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10-digit number"
                        style={inp()}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                    <div>
                      <label style={lbl}>WhatsApp</label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="If different"
                        style={inp()}
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
                      <label style={lbl}>Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Years"
                        style={inp()}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                    <div>
                      <label style={lbl}>Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={inp()}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("Location & Doctor")}>
                  Location & Doctor
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <label style={lbl}>Area / Locality</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Mohalla A, Sector 5, Civil Lines"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={lbl}>Full Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, landmark, city"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={lbl}>Doctor Name</label>
                    <input
                      type="text"
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      placeholder="Dr. Full Name"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 — Diseases */}
          {step === 1 && (
            <>
              <div style={sectionStyle}>
                <p style={sectionTitle("Primary Condition")}>
                  Primary Condition
                </p>
                <div>
                  <label style={lbl}>Primary Disease</label>
                  <select
                    value={primaryDisease}
                    onChange={(e) => setPrimary(e.target.value)}
                    style={inp()}
                    onFocus={(e) =>
                      (e.target.style.borderColor = COLORS.primary)
                    }
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  >
                    <option value="">-- Select Primary Disease --</option>
                    {DISEASES.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("All Conditions")}>
                  All Conditions (select all that apply)
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {DISEASES.filter((d) => d !== "Other").map((d) => (
                    <label
                      key={d}
                      onClick={() => toggleDisease(d)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background: diseases.includes(d)
                          ? COLORS.primaryLight
                          : "#F8FAFC",
                        border: `1.5px solid ${diseases.includes(d) ? COLORS.primary : COLORS.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          flexShrink: 0,
                          background: diseases.includes(d)
                            ? COLORS.primary
                            : "white",
                          border: `2px solid ${diseases.includes(d) ? COLORS.primary : COLORS.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {diseases.includes(d) && (
                          <span
                            style={{
                              color: "white",
                              fontSize: 11,
                              fontWeight: 900,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: diseases.includes(d)
                            ? COLORS.primary
                            : COLORS.textPrimary,
                        }}
                      >
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("Insurance (Optional)", "#E65100")}>
                  Insurance (Optional)
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div>
                    <label style={lbl}>Insurance Company</label>
                    <input
                      type="text"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      placeholder="e.g. Star Health, HDFC Ergo"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={lbl}>Expiry Date</label>
                    <input
                      type="date"
                      value={insuranceDate}
                      onChange={(e) => setInsuranceDate(e.target.value)}
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Medicines */}
          {step === 2 && (
            <>
              {medicines.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: 800,
                        margin: 0,
                      }}
                    >
                      Medicine {i + 1}
                    </p>
                    {medicines.length > 1 && (
                      <button
                        onClick={() => removeMed(i)}
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={lbl}>Brand Name</label>
                      <MedicineSearch
                        value={m.brand}
                        onChange={(val) => updateMed(i, "brand", val)}
                        onSelect={(item) => {
                          // Auto-fill all medicine fields when selected from inventory
                          updateMed(i, "brand", item.brand);
                          updateMed(i, "composition", item.composition);
                          updateMed(i, "company", item.company);
                          updateMed(i, "strength", item.strength);
                          updateMed(i, "dosage_form", item.dosage_form);
                        }}
                        field="brand"
                        placeholder="Type brand name..."
                      />
                    </div>
                    <div>
                      <label style={lbl}>Composition / Salt Name</label>
                      <MedicineSearch
                        value={m.composition}
                        onChange={(val) => updateMed(i, "composition", val)}
                        onSelect={(item) => {
                          updateMed(i, "brand", item.brand);
                          updateMed(i, "composition", item.composition);
                          updateMed(i, "strength", item.strength);
                        }}
                        field="composition"
                        placeholder="Type salt name (e.g. Telmisartan)..."
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
                        <label style={lbl}>Strength</label>
                        <input
                          type="text"
                          placeholder="e.g. 5mg, 500mg"
                          value={m.strength}
                          onChange={(e) =>
                            updateMed(i, "strength", e.target.value)
                          }
                          style={inp()}
                          onFocus={(e) =>
                            (e.target.style.borderColor = COLORS.primary)
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = COLORS.border)
                          }
                        />
                      </div>
                      <div>
                        <label style={lbl}>Dosage Form</label>
                        <select
                          value={m.dosage_form}
                          onChange={(e) =>
                            updateMed(i, "dosage_form", e.target.value)
                          }
                          style={inp()}
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
                            ["powder", "Powder/Sachet"],
                            ["drops", "Drops"],
                            ["injection", "Injection"],
                            ["inhaler", "Inhaler"],
                            ["cream", "Cream/Gel"],
                            ["other", "Other"],
                          ].map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 12,
                        padding: 12,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: COLORS.primary,
                          textTransform: "uppercase" as const,
                          letterSpacing: 0.8,
                          margin: "0 0 10px",
                        }}
                      >
                        Dosage & Schedule
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 10,
                        }}
                      >
                        <div>
                          <label style={lbl}>Quantity</label>
                          <input
                            type="number"
                            value={m.qty}
                            onChange={(e) =>
                              updateMed(
                                i,
                                "qty",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            style={inp()}
                            onFocus={(e) =>
                              (e.target.style.borderColor = COLORS.primary)
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = COLORS.border)
                            }
                          />
                        </div>
                        <div>
                          <label style={lbl}>Dose/Day</label>
                          <select
                            value={m.dose_per_day}
                            onChange={(e) =>
                              updateMed(
                                i,
                                "dose_per_day",
                                parseFloat(e.target.value),
                              )
                            }
                            style={inp()}
                            onFocus={(e) =>
                              (e.target.style.borderColor = COLORS.primary)
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = COLORS.border)
                            }
                          >
                            {[0.5, 1, 1.5, 2, 3, 4].map((v) => (
                              <option key={v} value={v}>
                                {v}/day
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Start Date</label>
                          <input
                            type="date"
                            value={m.start_date}
                            onChange={(e) =>
                              updateMed(i, "start_date", e.target.value)
                            }
                            style={inp()}
                            onFocus={(e) =>
                              (e.target.style.borderColor = COLORS.primary)
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = COLORS.border)
                            }
                          />
                        </div>
                      </div>

                      {m.qty > 0 && m.dose_per_day > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "8px 12px",
                            background: COLORS.primaryLight,
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              color: COLORS.textSecondary,
                              margin: 0,
                              fontWeight: 600,
                            }}
                          >
                            Estimated Supply
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: COLORS.primary,
                              margin: 0,
                            }}
                          >
                            {Math.ceil(m.qty / m.dose_per_day)} days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMed}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 14,
                  background: COLORS.primaryLight,
                  color: COLORS.primary,
                  border: `2px dashed ${COLORS.primary}`,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                + Add Another Medicine
              </button>
            </>
          )}

          {/* STEP 4 — Delivery */}
          {step === 3 && (
            <>
              <div style={sectionStyle}>
                <p style={sectionTitle("Home Delivery")}>Home Delivery</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                        margin: "0 0 2px",
                      }}
                    >
                      Enable Delivery
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: COLORS.textMuted,
                        margin: 0,
                      }}
                    >
                      Patient needs home delivery
                    </p>
                  </div>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: 48,
                      height: 26,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={delivery}
                      onChange={(e) => setDelivery(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 13,
                        background: delivery ? COLORS.primary : "#CBD5E1",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 3,
                          left: delivery ? 25 : 3,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "white",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          transition: "left 0.2s",
                        }}
                      />
                    </div>
                  </label>
                </div>

                {delivery && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={lbl}>Delivery Status</label>
                      <select
                        value={deliveryStatus}
                        onChange={(e) => setDeliveryStatus(e.target.value)}
                        style={inp()}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      >
                        <option value="">Not Set</option>
                        <option value="requested">Requested</option>
                        <option value="out_for_delivery">
                          Out for Delivery
                        </option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Delivery Person</label>
                      <input
                        type="text"
                        value={deliveryBoy}
                        onChange={(e) => setDeliveryBoy(e.target.value)}
                        placeholder="Name of delivery person"
                        style={inp()}
                        onFocus={(e) =>
                          (e.target.style.borderColor = COLORS.primary)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = COLORS.border)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("Additional Details")}>
                  Additional Details
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div>
                    <label style={lbl}>Monthly Medicine Expense (Rs)</label>
                    <input
                      type="number"
                      value={expense}
                      onChange={(e) => setExpense(e.target.value)}
                      placeholder="e.g. 850"
                      style={inp()}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={lbl}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes about this patient..."
                      rows={3}
                      style={{
                        ...inp(),
                        resize: "none" as const,
                        lineHeight: 1.5,
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = COLORS.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = COLORS.border)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 5 — Review */}
          {step === 4 && (
            <>
              {/* Summary hero */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                  borderRadius: 16,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "white",
                    }}
                  >
                    {name.charAt(0) || "P"}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: 900,
                        margin: "0 0 3px",
                      }}
                    >
                      {name || "—"}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 12,
                        margin: 0,
                      }}
                    >
                      {age} yrs &bull; {gender} &bull; {area || "—"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(diseases.length > 0 ? diseases : [primaryDisease])
                    .filter(Boolean)
                    .map((d) => (
                      <span
                        key={d}
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 8,
                        }}
                      >
                        {d}
                      </span>
                    ))}
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("Contact Details")}>Contact Details</p>
                {[
                  ["Mobile", mobile],
                  ["Doctor", doctor],
                  ["Address", address],
                ].map(([l, v]) =>
                  v ? (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "9px 0",
                        borderBottom: "1px solid #F8FAFC",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: COLORS.textMuted,
                          margin: 0,
                          fontWeight: 600,
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
                  ) : null,
                )}
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitle("Medicines")}>
                  Medicines ({medicines.length})
                </p>
                {medicines.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 0",
                      borderBottom:
                        i < medicines.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: COLORS.textPrimary,
                        margin: "0 0 3px",
                      }}
                    >
                      {m.brand || "Unnamed"}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: COLORS.textMuted,
                        margin: 0,
                      }}
                    >
                      {m.qty} units &bull; {m.dose_per_day}/day &bull;{" "}
                      {Math.ceil(m.qty / (m.dose_per_day || 1))} days supply
                    </p>
                  </div>
                ))}
              </div>

              {/* Confirm box */}
              <div
                style={{
                  background: "#E8F5E9",
                  borderRadius: 14,
                  padding: 14,
                  border: "1.5px solid #A5D6A7",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#2E7D32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <span
                    style={{ color: "white", fontSize: 11, fontWeight: 900 }}
                  >
                    ✓
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#1B5E20",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Please review all details before saving. Once saved, you can
                  edit from the patient profile.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            padding: "12px 16px",
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            gap: 10,
            boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 14,
                background: "#F1F5F9",
                color: COLORS.textSecondary,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => {
                if (step === 0 && !name.trim()) {
                  showToast("Please enter patient name");
                  return;
                }
                setStep((s) => s + 1);
              }}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 12px rgba(21,101,192,0.3)",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: saving
                  ? "#90A4AE"
                  : "linear-gradient(135deg, #1B5E20, #2E7D32)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: saving ? "none" : "0 4px 12px rgba(46,125,50,0.3)",
              }}
            >
              {saving ? "Saving..." : "Save Patient"}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
