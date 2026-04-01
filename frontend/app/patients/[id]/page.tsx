"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  apiGetPatient,
  apiUpdatePatient,
  apiRefillMedicine,
  apiDeletePatient,
  apiUpdateReminderStatus,
} from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Tag from "@/components/ui/Tag";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { formatDate, getWALink, DELIVERY_LABELS } from "@/lib/utils";
import { COLORS } from "@/lib/theme";
import type { Patient } from "@/types";

export default function PatientProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [refilling, setRefilling] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const res = await apiGetPatient(id);
      setPatient(res.data.data);
    } catch {
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
    } catch {
      showToast("Failed to refill");
    } finally {
      setRefilling(null);
    }
  };

  const handleMark = async (status: string, label: string) => {
    try {
      await apiUpdateReminderStatus(id, status);
      showToast("Marked as " + label);
      loadPatient();
    } catch {
      showToast("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this patient? This cannot be undone.")) return;
    try {
      await apiDeletePatient(id);
      showToast("Patient deleted");
      router.replace("/patients");
    } catch {
      showToast("Failed to delete");
    }
  };

  if (loading)
    return (
      <AppShell title="Patient Profile">
        <Spinner />
      </AppShell>
    );
  if (!patient) return null;

  const tagColor =
    patient.tag === "urgent"
      ? "#C62828"
      : patient.tag === "today"
        ? "#E65100"
        : patient.tag === "upcoming"
          ? "#F57F17"
          : patient.tag === "missed"
            ? "#546E7A"
            : "#2E7D32";

  const tagBg =
    patient.tag === "urgent"
      ? "#FFEBEE"
      : patient.tag === "today"
        ? "#FFF3E0"
        : patient.tag === "upcoming"
          ? "#FFFDE7"
          : patient.tag === "missed"
            ? "#ECEFF1"
            : "#E8F5E9";

  const daysStr =
    patient.days_left <= 0
      ? "Medicine Finished"
      : `${patient.days_left} Days Left`;

  return (
    <AppShell title={patient.name}>
      <div style={{ background: "#F8FAFC", minHeight: "100%" }}>
        {/* Hero card */}
        <div
          style={{
            background: `linear-gradient(145deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            padding: "20px 20px 24px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            {/* Avatar */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                flexShrink: 0,
                background:
                  patient.gender === "Female"
                    ? "rgba(236,64,122,0.3)"
                    : "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 900,
                color: "white",
              }}
            >
              {patient.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: 900,
                  margin: "0 0 4px",
                  letterSpacing: -0.3,
                }}
              >
                {patient.name}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  margin: "0 0 10px",
                  fontWeight: 500,
                }}
              >
                {patient.age} yrs &bull; {patient.gender} &bull; {patient.area}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: tagBg,
                    color: tagColor,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 8,
                    letterSpacing: 0.5,
                  }}
                >
                  {patient.tag.toUpperCase()}
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {patient.reminder_status?.toUpperCase()}
                </span>
                {patient.delivery && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    DELIVERY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Days left pill */}
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 14,
              background:
                patient.days_left <= 0
                  ? "rgba(198,40,40,0.3)"
                  : patient.days_left <= 3
                    ? "rgba(230,81,0,0.3)"
                    : "rgba(46,125,50,0.3)",
              border: `1px solid ${patient.days_left <= 0 ? "rgba(198,40,40,0.5)" : "rgba(255,255,255,0.2)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
                margin: 0,
                fontWeight: 600,
              }}
            >
              Medicine Status
            </p>
            <p
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: 800,
                margin: 0,
              }}
            >
              {daysStr}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <a
              href={getWALink(
                patient.whatsapp || patient.mobile,
                patient.name,
                patient.medicines,
                patient.days_left,
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleMark("sent", "sent")}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 12,
                background: "#25D366",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                textDecoration: "none",
                display: "block",
              }}
            >
              WhatsApp
            </a>
            <a
              href={"tel:" + patient.mobile}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 12,
                background: "rgba(255,255,255,0.2)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                border: "1.5px solid rgba(255,255,255,0.3)",
                textDecoration: "none",
                display: "block",
              }}
            >
              Call
            </a>
            <Link
              href={`/patients/${id}/edit`}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                border: "1.5px solid rgba(255,255,255,0.2)",
                textDecoration: "none",
                display: "block",
              }}
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Basic details card */}
          <InfoCard title="Basic Details">
            {[
              ["Mobile", patient.mobile],
              ["WhatsApp", patient.whatsapp || patient.mobile],
              ["Gender", patient.gender],
              ["Area", patient.area],
              ["Address", patient.address],
              ["Doctor", patient.doctor],
            ].map(([l, v]) =>
              v ? <InfoRow key={l} label={l} value={v} /> : null,
            )}
          </InfoCard>

          {/* Disease card */}
          <InfoCard title="Disease / Condition">
            <InfoRow
              label="Primary Disease"
              value={patient.primary_disease || "—"}
            />
            {patient.diseases?.length > 1 && (
              <div
                style={{
                  paddingTop: 8,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {patient.diseases.map((d) => (
                  <span
                    key={d}
                    style={{
                      background: COLORS.primaryLight,
                      color: COLORS.primary,
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
            )}
          </InfoCard>

          {/* Medicines card */}
          <InfoCard title="Medicines">
            {patient.medicines?.map((m, idx) => {
              const dl = m.days_left ?? 0;
              const supply =
                m.qty && m.dose_per_day ? Math.ceil(m.qty / m.dose_per_day) : 0;
              const dlColor =
                dl <= 0 ? "#C62828" : dl <= 3 ? "#E65100" : "#2E7D32";
              return (
                <div
                  key={m.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: idx < patient.medicines.length - 1 ? 10 : 0,
                    border: "1px solid #E0E7EF",
                  }}
                >
                  {/* Medicine header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: COLORS.textPrimary,
                          margin: "0 0 3px",
                        }}
                      >
                        {m.brand}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          margin: 0,
                        }}
                      >
                        {[m.composition, m.company, m.strength]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: dlColor,
                        background:
                          dl <= 0 ? "#FFEBEE" : dl <= 3 ? "#FFF3E0" : "#E8F5E9",
                        padding: "4px 10px",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    >
                      {dl <= 0 ? "FINISHED" : `${dl}d left`}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      ["QTY", `${m.qty} units`],
                      ["DOSE", `${m.dose_per_day}/day`],
                      ["SUPPLY", `${supply} days`],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          background: "white",
                          borderRadius: 10,
                          padding: "8px 6px",
                          textAlign: "center",
                          border: "1px solid #E0E7EF",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            color: COLORS.textMuted,
                            fontWeight: 700,
                            margin: "0 0 3px",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: COLORS.textPrimary,
                            margin: 0,
                          }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>

                  {m.end_date && (
                    <p
                      style={{
                        fontSize: 11,
                        color: COLORS.textMuted,
                        textAlign: "center",
                        margin: "0 0 10px",
                      }}
                    >
                      Ends: {formatDate(m.end_date)}
                    </p>
                  )}

                  <button
                    onClick={() => m.id && handleRefill(m.id, m.brand)}
                    disabled={refilling === m.id}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      background: refilling === m.id ? "#E0E7EF" : "#E8F5E9",
                      color: refilling === m.id ? COLORS.textMuted : "#2E7D32",
                      border: `1.5px solid ${refilling === m.id ? "#E0E7EF" : "#A5D6A7"}`,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: refilling === m.id ? "not-allowed" : "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {refilling === m.id
                      ? "Refilling..."
                      : "Mark as Refilled Today"}
                  </button>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: COLORS.primaryLight,
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Monthly Expense
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: COLORS.primary,
                  margin: 0,
                }}
              >
                Rs {patient.monthly_expense?.toLocaleString("en-IN") || "0"}
              </p>
            </div>
          </InfoCard>

          {/* Insurance */}
          {patient.insurance && (
            <InfoCard title="Insurance">
              <InfoRow label="Company" value={patient.insurance} />
              {patient.insurance_date && (
                <InfoRow
                  label="Expiry"
                  value={formatDate(patient.insurance_date)}
                />
              )}
            </InfoCard>
          )}

          {/* Delivery */}
          {patient.delivery && (
            <InfoCard title="Delivery Tracking">
              <InfoRow
                label="Status"
                value={DELIVERY_LABELS[patient.delivery_status] || "—"}
              />
              {patient.delivery_boy && (
                <InfoRow label="Delivery By" value={patient.delivery_boy} />
              )}
            </InfoCard>
          )}

          {/* Action buttons */}
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}
          >
            <button
              onClick={() => handleMark("sent", "Reminder Sent")}
              style={{
                padding: "14px",
                borderRadius: 14,
                background: COLORS.primary,
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 12px rgba(21,101,192,0.3)",
              }}
            >
              Send Reminder
            </button>
            <button
              onClick={() => handleMark("purchased", "Purchased")}
              style={{
                padding: "14px",
                borderRadius: 14,
                background: "#E8F5E9",
                color: "#2E7D32",
                fontSize: 13,
                fontWeight: 700,
                border: "1.5px solid #A5D6A7",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Purchased
            </button>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <button
              onClick={() => handleMark("ignored", "Ignored")}
              style={{
                padding: "12px",
                borderRadius: 14,
                background: "#F8FAFC",
                color: COLORS.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                border: `1.5px solid ${COLORS.border}`,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Mark Ignored
            </button>
            <Link
              href={`/invoices/create?patient_id=${patient.id}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 14,
                  background: "#FFF3E0",
                  color: "#E65100",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1.5px solid #FFCC80",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Create Invoice
              </button>
            </Link>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              background: "#FFF5F5",
              color: "#C62828",
              fontSize: 13,
              fontWeight: 700,
              border: "1.5px solid #FFCDD2",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Delete Patient
          </button>

          <div style={{ height: 8 }} />
        </div>
      </div>
    </AppShell>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #E0E7EF",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #F1F5F9",
          background: "#FAFBFC",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: COLORS.primary,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: "4px 16px 12px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 0",
        borderBottom: "1px solid #F8FAFC",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: COLORS.textMuted,
          fontWeight: 600,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.textPrimary,
          margin: 0,
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
