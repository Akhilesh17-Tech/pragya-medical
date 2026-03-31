"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCreatePatient } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import { DISEASES } from "@/lib/utils";

const STEPS = ["Basic Info", "Diseases", "Medicines", "Delivery", "Review"];

const inputCls =
  "w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] transition-colors bg-white";
const labelCls =
  "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1";

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
      showToast(isDraft ? "Saved as draft" : "Patient added!");
      setTimeout(() => router.push("/patients"), 700);
    } catch (err) {
      const e = err as any;
      showToast(e.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneShell>
      <TopBar title="Add Patient" backHref="/patients" />

      {/* Step dots */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                onClick={() => i < step && setStep(i)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 transition-all ${
                  i < step
                    ? "bg-green-500 text-white cursor-pointer"
                    : i === step
                      ? "bg-[#1a6fc4] text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-green-400" : "bg-gray-100"}`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-[12px] font-bold text-[#1a6fc4]">
          {STEPS[step]}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-4">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#e8f1fb] rounded-2xl p-4 border border-[#c5d9f0]">
                <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wider mb-3">
                  Patient Information
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Patient full name"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Mobile</label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Mobile number"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp</label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="If different"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Years"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={inputCls}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Area / Locality</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Mohalla A, Sector 5"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Full Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, landmark"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Doctor Name</label>
                    <input
                      type="text"
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      placeholder="Dr. Full Name"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#e8f1fb] rounded-2xl p-4 border border-[#c5d9f0]">
                <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wider mb-3">
                  Disease / Condition
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Primary Disease</label>
                    <select
                      value={primaryDisease}
                      onChange={(e) => setPrimary(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">-- Select --</option>
                      {DISEASES.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>All Conditions</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {DISEASES.filter((d) => d !== "Other").map((d) => (
                        <label
                          key={d}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border-[1.5px] cursor-pointer text-[12px] font-semibold transition-all ${
                            diseases.includes(d)
                              ? "border-[#1a6fc4] bg-white text-[#1a6fc4]"
                              : "border-[#dce6f0] bg-white text-gray-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={diseases.includes(d)}
                            onChange={() => toggleDisease(d)}
                            className="accent-[#1a6fc4]"
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#fff8e8] rounded-2xl p-4 border border-yellow-200">
                <p className="text-[11px] font-extrabold text-orange-500 uppercase tracking-wider mb-3">
                  Insurance (Optional)
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Insurance Company</label>
                    <input
                      type="text"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      placeholder="e.g. Star Health, HDFC Ergo"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Expiry Date</label>
                    <input
                      type="date"
                      value={insuranceDate}
                      onChange={(e) => setInsuranceDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              {medicines.map((m, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#dce6f0] overflow-hidden shadow-sm"
                >
                  <div className="bg-[#1a6fc4] px-4 py-2.5 flex items-center justify-between">
                    <span className="text-white text-[12px] font-extrabold">
                      Medicine {i + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        onClick={() => removeMed(i)}
                        className="text-white/70 text-[11px] font-bold hover:text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Brand Name (e.g. Norvasc)"
                      value={m.brand}
                      onChange={(e) => updateMed(i, "brand", e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="Composition / Salt Name"
                      value={m.composition}
                      onChange={(e) =>
                        updateMed(i, "composition", e.target.value)
                      }
                      className={inputCls}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Strength (5mg)"
                        value={m.strength}
                        onChange={(e) =>
                          updateMed(i, "strength", e.target.value)
                        }
                        className={inputCls}
                      />
                      <select
                        value={m.dosage_form}
                        onChange={(e) =>
                          updateMed(i, "dosage_form", e.target.value)
                        }
                        className={inputCls}
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
                          ["other", "Other"],
                        ].map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={labelCls}>Quantity</label>
                        <input
                          type="number"
                          value={m.qty}
                          onChange={(e) =>
                            updateMed(i, "qty", parseFloat(e.target.value) || 0)
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Dose/Day</label>
                        <select
                          value={m.dose_per_day}
                          onChange={(e) =>
                            updateMed(
                              i,
                              "dose_per_day",
                              parseFloat(e.target.value),
                            )
                          }
                          className={inputCls}
                        >
                          {[0.5, 1, 1.5, 2, 3, 4].map((v) => (
                            <option key={v} value={v}>
                              {v}/day
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Start Date</label>
                        <input
                          type="date"
                          value={m.start_date}
                          onChange={(e) =>
                            updateMed(i, "start_date", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>
                    {m.qty > 0 && m.dose_per_day > 0 && (
                      <div className="bg-[#e8f1fb] rounded-xl px-3 py-2 text-[11px] font-bold text-[#1a6fc4]">
                        Supply: {m.qty} units / {m.dose_per_day}/day ={" "}
                        {Math.ceil(m.qty / m.dose_per_day)} days
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addMed}
                className="w-full py-3 border-2 border-dashed border-[#1a6fc4] rounded-2xl text-[#1a6fc4] text-[13px] font-bold bg-[#e8f1fb] hover:bg-[#d5e8f7] transition-colors"
              >
                + Add Another Medicine
              </button>
            </div>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-[#dce6f0] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">
                      Home Delivery
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Patient needs delivery service
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={delivery}
                      onChange={(e) => setDelivery(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1a6fc4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
                {delivery && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <div>
                      <label className={labelCls}>Delivery Status</label>
                      <select
                        value={deliveryStatus}
                        onChange={(e) => setDeliveryStatus(e.target.value)}
                        className={inputCls}
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
                      <label className={labelCls}>Delivery Boy</label>
                      <input
                        type="text"
                        value={deliveryBoy}
                        onChange={(e) => setDeliveryBoy(e.target.value)}
                        placeholder="Delivery person name"
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-[#dce6f0] p-4 shadow-sm">
                <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wider mb-3">
                  Additional Info
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Monthly Expense (Rs)</label>
                    <input
                      type="number"
                      value={expense}
                      onChange={(e) => setExpense(e.target.value)}
                      placeholder="e.g. 850"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] resize-none bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 4 && (
            <div className="flex flex-col gap-3">
              <div className="bg-gradient-to-r from-[#1a6fc4] to-[#2980d9] rounded-2xl p-4 text-white">
                <p className="text-[16px] font-extrabold">{name}</p>
                <p className="text-white/75 text-[12px] mt-0.5">
                  {age} yrs · {gender} · {area}
                </p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {diseases.map((d) => (
                    <span
                      key={d}
                      className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              {[
                {
                  title: "Contact",
                  rows: [
                    ["Mobile", mobile],
                    ["Doctor", doctor],
                    ["Address", address],
                  ],
                },
                {
                  title: "Disease",
                  rows: [
                    ["Primary", primaryDisease],
                    ["Insurance", insurance],
                  ],
                },
              ].map((sec) => (
                <div
                  key={sec.title}
                  className="bg-white rounded-2xl border border-[#dce6f0] p-4 shadow-sm"
                >
                  <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wider mb-2">
                    {sec.title}
                  </p>
                  {sec.rows.map(([l, v]) =>
                    v ? (
                      <div
                        key={l}
                        className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-[13px]"
                      >
                        <span className="text-gray-500 font-semibold">{l}</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
              <div className="bg-white rounded-2xl border border-[#dce6f0] p-4 shadow-sm">
                <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wider mb-2">
                  Medicines ({medicines.length})
                </p>
                {medicines.map((m, i) => (
                  <div
                    key={i}
                    className="py-2 border-b border-gray-50 last:border-0"
                  >
                    <p className="text-[13px] font-bold">
                      {m.brand || "Unnamed"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {m.qty} units · {m.dose_per_day}/day ·{" "}
                      {Math.ceil(m.qty / (m.dose_per_day || 1))} days
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="h-4" />
      </div>

      {/* Nav buttons */}
      <div className="px-4 pb-5 pt-3 flex gap-3 border-t border-gray-100 bg-white flex-shrink-0">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold text-[14px] hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              if (step === 0 && !name.trim()) {
                showToast("Enter patient name first");
                return;
              }
              setStep((s) => s + 1);
            }}
            className="flex-1 py-3.5 bg-[#1a6fc4] text-white rounded-2xl font-bold text-[14px] hover:bg-[#155a9e] transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex-1 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-[14px] disabled:opacity-60 hover:bg-green-600 transition-colors"
          >
            {saving ? "Saving..." : "Save Patient"}
          </button>
        )}
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}
