"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiCreatePatient } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import { DISEASES } from "@/lib/utils";
import type { Medicine } from "@/types";

const STEPS = ["Basic Info", "Diseases", "Medicines", "Delivery", "Review"];

const EMPTY_MED: Medicine = {
  brand: "",
  composition: "",
  company: "",
  strength: "",
  dosage_form: "tablet",
  qty: 30,
  dose_per_day: 1,
  start_date: new Date().toISOString().split("T")[0],
};

export default function AddPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
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
  const [medicines, setMedicines] = useState<Medicine[]>([{ ...EMPTY_MED }]);
  const [delivery, setDelivery] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [deliveryBoy, setDeliveryBoy] = useState("");
  const [insurance, setInsurance] = useState("");
  const [insuranceDate, setInsuranceDate] = useState("");
  const [expense, setExpense] = useState("");
  const [notes, setNotes] = useState("");

  const toggleDisease = (d: string) => {
    setDiseases((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const updateMed = (i: number, field: keyof Medicine, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const addMed = () => setMedicines((prev) => [...prev, { ...EMPTY_MED }]);

  const removeMed = (i: number) => {
    if (medicines.length === 1) {
      showToast("At least one medicine required");
      return;
    }
    setMedicines((prev) => prev.filter((_, idx) => idx !== i));
  };

  const calcDays = (m: Medicine) => {
    if (!m.qty || !m.dose_per_day) return 0;
    return Math.ceil(m.qty / m.dose_per_day);
  };

  const handleSubmit = async (isDraft = false) => {
    if (!name) {
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
        diseases: diseases.length ? diseases : [primaryDisease].filter(Boolean),
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
      showToast(isDraft ? "Saved as draft" : "Patient added successfully");
      setTimeout(() => router.push("/patients"), 800);
    } catch (err) {
      const error = err as any;
      showToast(error.response?.data?.error || "Failed to save patient");
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  // ── Step renders ─────────────────────────────────────────────

  const Step1 = () => (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase tracking-wide">
        Basic Information
      </p>
      {[
        {
          label: "Full Name *",
          value: name,
          set: setName,
          type: "text",
          placeholder: "Patient full name",
        },
        {
          label: "Mobile Number",
          value: mobile,
          set: setMobile,
          type: "tel",
          placeholder: "10 digit mobile",
        },
        {
          label: "WhatsApp (if different)",
          value: whatsapp,
          set: setWhatsapp,
          type: "tel",
          placeholder: "WhatsApp number",
        },
        {
          label: "Age",
          value: age,
          set: setAge,
          type: "number",
          placeholder: "Age in years",
        },
        {
          label: "Area / Locality",
          value: area,
          set: setArea,
          type: "text",
          placeholder: "e.g. Mohalla A, Sector 5",
        },
        {
          label: "Full Address",
          value: address,
          set: setAddress,
          type: "text",
          placeholder: "Street, landmark",
        },
        {
          label: "Doctor Name",
          value: doctor,
          set: setDoctor,
          type: "text",
          placeholder: "Dr. Full Name",
        },
      ].map((f) => (
        <div key={f.label}>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
            {f.label}
          </label>
          <input
            type={f.type}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] transition-colors"
          />
        </div>
      ))}
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Gender
        </label>
        <div className="flex gap-3">
          {["Male", "Female", "Other"].map((g) => (
            <label
              key={g}
              className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold"
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={() => setGender(g)}
                className="accent-[#1a6fc4]"
              />
              {g}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase tracking-wide">
        Disease / Condition
      </p>
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Primary Disease
        </label>
        <select
          value={primaryDisease}
          onChange={(e) => setPrimary(e.target.value)}
          className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4]"
        >
          <option value="">-- Select Primary Disease --</option>
          {DISEASES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
          All Diseases (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DISEASES.filter((d) => d !== "Other").map((d) => (
            <label
              key={d}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-[1.5px] cursor-pointer text-[12px] font-semibold transition-all ${
                diseases.includes(d)
                  ? "border-[#1a6fc4] bg-[#e8f1fb] text-[#1a6fc4]"
                  : "border-[#dce6f0] text-gray-600"
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
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Insurance Company
        </label>
        <input
          type="text"
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          placeholder="e.g. Star Health, HDFC Ergo"
          className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4]"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Insurance Expiry Date
        </label>
        <input
          type="date"
          value={insuranceDate}
          onChange={(e) => setInsuranceDate(e.target.value)}
          className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4]"
        />
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase tracking-wide">
        Medicines
      </p>
      {medicines.map((m, i) => (
        <div
          key={i}
          className="bg-[#e8f1fb] rounded-xl p-3 border border-[#dce6f0]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-[#1a6fc4]">
              Medicine {i + 1}
            </span>
            {medicines.length > 1 && (
              <button
                onClick={() => removeMed(i)}
                className="text-[11px] text-red-500 font-bold"
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Brand Name (e.g. Norvasc)"
              value={m.brand}
              onChange={(e) => updateMed(i, "brand", e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
            />
            <input
              type="text"
              placeholder="Composition (Salt Name)"
              value={m.composition}
              onChange={(e) => updateMed(i, "composition", e.target.value)}
              className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Strength (e.g. 5mg)"
                value={m.strength}
                onChange={(e) => updateMed(i, "strength", e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
              />
              <select
                value={m.dosage_form}
                onChange={(e) => updateMed(i, "dosage_form", e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="powder">Powder</option>
                <option value="drops">Drops</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
                <option value="cream">Cream/Gel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={m.qty}
                  onChange={(e) =>
                    updateMed(i, "qty", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Dose/Day
                </label>
                <select
                  value={m.dose_per_day}
                  onChange={(e) =>
                    updateMed(i, "dose_per_day", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
                >
                  <option value={0.5}>0.5/day</option>
                  <option value={1}>1/day</option>
                  <option value={1.5}>1.5/day</option>
                  <option value={2}>2/day</option>
                  <option value={3}>3/day</option>
                  <option value={4}>4/day</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Start Date
              </label>
              <input
                type="date"
                value={m.start_date}
                onChange={(e) => updateMed(i, "start_date", e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-[#dce6f0] rounded-lg text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
              />
            </div>
            {m.qty > 0 && m.dose_per_day > 0 && (
              <div className="bg-white rounded-lg px-3 py-2 text-[11px] font-bold text-[#1a6fc4]">
                Supply: {m.qty} units at {m.dose_per_day}/day = {calcDays(m)}{" "}
                days
              </div>
            )}
          </div>
        </div>
      ))}
      <button
        onClick={addMed}
        className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#1a6fc4] rounded-xl text-[#1a6fc4] text-[13px] font-bold bg-[#e8f1fb]"
      >
        + Add Another Medicine
      </button>
    </div>
  );

  const Step4 = () => (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase tracking-wide">
        Delivery & Purchase
      </p>
      <div className="flex items-center justify-between p-3 border-[1.5px] border-[#dce6f0] rounded-xl bg-white">
        <div>
          <p className="text-[13px] font-bold">Home Delivery</p>
          <p className="text-[11px] text-gray-400">
            Does patient need delivery?
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
        <div className="flex flex-col gap-2 bg-[#e8f1fb] rounded-xl p-3 border border-[#dce6f0]">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
              Delivery Status
            </label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
            >
              <option value="">Not Set</option>
              <option value="requested">Requested</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
              Delivery Boy Name
            </label>
            <input
              type="text"
              value={deliveryBoy}
              onChange={(e) => setDeliveryBoy(e.target.value)}
              placeholder="Name of delivery person"
              className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] bg-white"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Monthly Medicine Expense (Rs)
        </label>
        <input
          type="number"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
          placeholder="e.g. 850"
          className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4]"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[13px] outline-none focus:border-[#1a6fc4] resize-none"
        />
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase tracking-wide">
        Review & Confirm
      </p>

      {/* Basic */}
      <div className="bg-white rounded-xl p-3 border border-[#dce6f0]">
        <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase mb-2">
          Basic Info
        </p>
        <div className="flex flex-col gap-1">
          {[
            ["Name", name],
            ["Mobile", mobile],
            ["Age / Gender", `${age} yrs · ${gender}`],
            ["Area", area],
            ["Doctor", doctor],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-[12px]">
              <span className="text-gray-500 font-semibold">{l}</span>
              <span className="font-bold text-right">{v || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Diseases */}
      <div className="bg-white rounded-xl p-3 border border-[#dce6f0]">
        <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase mb-2">
          Diseases
        </p>
        <p className="text-[12px] font-bold">{primaryDisease || "—"}</p>
        <div className="flex gap-1 flex-wrap mt-1">
          {diseases.map((d) => (
            <span
              key={d}
              className="bg-[#e8f1fb] text-[#1a6fc4] text-[10px] font-bold px-2 py-0.5 rounded"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div className="bg-white rounded-xl p-3 border border-[#dce6f0]">
        <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase mb-2">
          Medicines ({medicines.length})
        </p>
        {medicines.map((m, i) => (
          <div
            key={i}
            className="mb-2 pb-2 border-b border-gray-100 last:border-0"
          >
            <p className="text-[12px] font-bold">{m.brand || "Unnamed"}</p>
            <p className="text-[11px] text-gray-500">
              {m.qty} units · {m.dose_per_day}/day ·{" "}
              {Math.ceil(m.qty / (m.dose_per_day || 1))} days supply
            </p>
          </div>
        ))}
      </div>

      {/* Delivery */}
      {delivery && (
        <div className="bg-white rounded-xl p-3 border border-[#dce6f0]">
          <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase mb-1">
            Delivery
          </p>
          <p className="text-[12px] font-bold">
            {deliveryStatus || "Requested"}
          </p>
        </div>
      )}
    </div>
  );

  const STEP_CONTENT = [
    <Step1 key={0} />,
    <Step2 key={1} />,
    <Step3 key={2} />,
    <Step4 key={3} />,
    <Step5 key={4} />,
  ];

  return (
    <PhoneShell>
      <TopBar
        title="Add Patient"
        backHref="/patients"
        rightIcon="D"
        onRightClick={() => handleSubmit(true)}
      />

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 pt-3 pb-1">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all ${
              i < step
                ? "bg-green-500 text-white"
                : i === step
                  ? "bg-[#1a6fc4] text-white"
                  : "bg-[#dce6f0] text-gray-400"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] font-bold text-[#1a6fc4] pb-2">
        Step {step + 1}: {STEPS[step]}
      </p>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {STEP_CONTENT[step]}
      </div>

      {/* Nav buttons */}
      <div className="px-4 pb-4 pt-2 flex gap-2.5 border-t border-gray-100">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-[14px]"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              if (!canNext()) {
                showToast("Please fill patient name first");
                return;
              }
              setStep((s) => s + 1);
            }}
            className="flex-1 py-3 bg-[#1a6fc4] text-white rounded-xl font-bold text-[14px]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-[14px] disabled:opacity-60"
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
