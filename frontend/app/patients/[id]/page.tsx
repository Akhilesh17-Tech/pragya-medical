"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  apiGetPatient,
  apiUpdatePatient,
  apiRefillMedicine,
  apiDeletePatient,
  apiUpdateReminderStatus,
} from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import Tag from "@/components/ui/Tag";
import { formatDate, getWALink, DELIVERY_LABELS } from "@/lib/utils";
import type { Patient } from "@/types";

export default function PatientProfilePage() {
  const [patient, setPatient]   = useState<Patient | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refilling, setRefilling] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace("/"); return; }
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const res = await apiGetPatient(id);
      setPatient(res.data.data);
    } catch (err) {
      showToast("Patient not found");
      router.replace("/patients");
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (medId: string, brand: string) => {
    setRefilling(medId);
    try {
      await apiRefillMedicine(medId);
      showToast(brand + " refilled successfully");
      loadPatient();
    } catch (err) {
      showToast("Failed to refill");
    } finally {
      setRefilling(null);
    }
  };

  const handleMarkStatus = async (status: string) => {
    try {
      await apiUpdateReminderStatus(id, status);
      showToast("Marked as " + status);
      loadPatient();
    } catch (err) {
      showToast("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this patient? This cannot be undone.")) return;
    try {
      await apiDeletePatient(id);
      showToast("Patient deleted");
      router.replace("/patients");
    } catch (err) {
      showToast("Failed to delete");
    }
  };

  if (loading) return <PhoneShell><TopBar title="Patient Profile" /><Spinner /></PhoneShell>;
  if (!patient) return null;

  const tagColor =
    patient.tag === "urgent" ? "#e74c3c" :
    patient.tag === "today"  ? "#e67e22" :
    patient.tag === "upcoming" ? "#f39c12" :
    patient.tag === "missed" ? "#95a5a6" : "#27ae60";

  const daysStr = patient.days_left <= 0
    ? "Medicine Finished"
    : `${patient.days_left} Days Left`;

  return (
    <PhoneShell>
      <TopBar title="Patient Profile" backHref="/patients" />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Hero */}
        <div className="bg-[#1a6fc4] px-4 py-4 text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl mb-3">
            {patient.gender === "Female" ? "F" : "M"}
          </div>
          <p className="text-[18px] font-extrabold">{patient.name}</p>
          <p className="text-white/75 text-[12px] mt-0.5">
            {patient.age} yrs · {patient.primary_disease} · {patient.area}
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            <span
              className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: tagColor }}
            >
              {patient.tag.toUpperCase()}
            </span>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {patient.reminder_status?.toUpperCase()}
            </span>
            {patient.delivery && (
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                DELIVERY
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            
              href={getWALink(patient.whatsapp || patient.mobile, patient.name, patient.medicines, patient.days_left)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleMarkStatus("sent")}
              className="flex-1 py-2 bg-green-500 text-white text-center rounded-lg text-[12px] font-bold"
            >
              WhatsApp
            </a>
            
              href={"tel:" + patient.mobile}
              className="flex-1 py-2 bg-white text-[#1a6fc4] text-center rounded-lg text-[12px] font-bold"
            >
              Call
            </a>
          </div>
        </div>

        {/* Basic details */}
        <InfoSection title="Basic Details">
          {[
            ["Mobile",  patient.mobile],
            ["WhatsApp", patient.whatsapp || patient.mobile],
            ["Gender",  patient.gender],
            ["Area",    patient.area],
            ["Address", patient.address],
            ["Doctor",  patient.doctor],
          ].map(([l, v]) => (
            <InfoRow key={l} label={l} value={v} />
          ))}
        </InfoSection>

        {/* Diseases */}
        <InfoSection title="Disease / Condition">
          <InfoRow label="Primary" value={patient.primary_disease} />
          {patient.diseases?.length > 1 && (
            <div className="flex gap-1 flex-wrap pt-1">
              {patient.diseases.map((d) => (
                <span key={d} className="bg-[#e8f1fb] text-[#1a6fc4] text-[10px] font-bold px-2 py-0.5 rounded">
                  {d}
                </span>
              ))}
            </div>
          )}
        </InfoSection>

        {/* Medicines */}
        <InfoSection title={`Medicines — ${daysStr}`}>
          {patient.medicines?.map((m) => {
            const dl = m.days_left ?? 0;
            const dlColor = dl <= 0 ? "#e74c3c" : dl <= 3 ? "#e67e22" : "#27ae60";
            const supply = m.qty && m.dose_per_day ? Math.ceil(m.qty / m.dose_per_day) : 0;
            return (
              <div key={m.id} className="bg-[#f7fbff] rounded-xl p-3 mb-2 border border-[#dce6f0]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[13px] font-extrabold">{m.brand}</p>
                    <p className="text-[11px] text-gray-500">
                      {m.composition} · {m.company} · {m.strength}
                    </p>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: dlColor }}>
                    {dl <= 0 ? "FINISHED" : `${dl}d left`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    ["QTY", `${m.qty} units`],
                    ["DOSE", `${m.dose_per_day}/day`],
                    ["SUPPLY", `${supply}d`],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-white rounded-lg p-1.5 text-center border border-[#dce6f0]">
                      <p className="text-[9px] text-gray-500 font-bold">{l}</p>
                      <p className="text-[11px] font-extrabold">{v}</p>
                    </div>
                  ))}
                </div>
                {m.end_date && (
                  <p className="text-[11px] text-gray-400 text-center mb-2">
                    Ends: {formatDate(m.end_date)}
                  </p>
                )}
                <button
                  onClick={() => m.id && handleRefill(m.id, m.brand)}
                  disabled={refilling === m.id}
                  className="w-full py-2 bg-green-500 text-white rounded-lg text-[12px] font-bold disabled:opacity-60"
                >
                  {refilling === m.id ? "Refilling..." : "Refilled Today"}
                </button>
              </div>
            );
          })}
          <p className="text-[12px] text-gray-500 text-right font-semibold">
            Monthly Expense: Rs {patient.monthly_expense?.toLocaleString("en-IN")}
          </p>
        </InfoSection>

        {/* Insurance */}
        {patient.insurance && (
          <InfoSection title="Insurance">
            <InfoRow label="Company" value={patient.insurance} />
            {patient.insurance_date && (
              <InfoRow label="Expiry" value={formatDate(patient.insurance_date)} />
            )}
          </InfoSection>
        )}

        {/* Delivery */}
        {patient.delivery && (
          <InfoSection title="Delivery Tracking">
            <InfoRow label="Status" value={DELIVERY_LABELS[patient.delivery_status] || "—"} />
            {patient.delivery_boy && <InfoRow label="Delivery Boy" value={patient.delivery_boy} />}
          </InfoSection>
        )}

        {/* Action buttons */}
        <div className="px-4 py-3 flex gap-2">
          <button
            onClick={() => handleMarkStatus("sent")}
            className="flex-[2] py-3 bg-[#1a6fc4] text-white rounded-xl font-bold text-[13px]"
          >
            Send Reminder
          </button>
          <button
            onClick={() => handleMarkStatus("purchased")}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-[13px]"
          >
            Purchased
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-red-50 text-red-500 border-[1.5px] border-red-200 rounded-xl font-bold text-[13px]"
          >
            Delete Patient
          </button>
        </div>

        <div className="h-4" />
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-[#dce6f0]">
      <p className="text-[11px] font-extrabold text-[#1a6fc4] uppercase tracking-wide mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-[13px]">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="font-bold text-right">{value || "—"}</span>
    </div>
  );
}