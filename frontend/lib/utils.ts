import type { PatientTag, Medicine } from "@/types";

export const TAG_CONFIG: Record<
  PatientTag,
  { bg: string; text: string; border: string; label: string }
> = {
  urgent: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-l-red-500",
    label: "URGENT",
  },
  today: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-l-orange-500",
    label: "TODAY",
  },
  upcoming: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-l-yellow-400",
    label: "UPCOMING",
  },
  missed: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-l-gray-400",
    label: "MISSED",
  },
  ok: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-l-green-500",
    label: "OK",
  },
};

export const REMINDER_STATUS_COLOR: Record<string, string> = {
  pending: "text-gray-400",
  sent: "text-blue-500",
  purchased: "text-green-600",
  ignored: "text-orange-500",
};

export const DELIVERY_LABELS: Record<string, string> = {
  "": "None",
  requested: "Requested",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export function calcMedDaysLeft(m: Medicine): number {
  if (!m.start_date || !m.qty || !m.dose_per_day) return 0;
  const start = new Date(m.start_date);
  const totalDays = Math.ceil(m.qty / m.dose_per_day);
  const end = new Date(start);
  end.setDate(end.getDate() + totalDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - today.getTime()) / 86_400_000);
}

export function calcPatientDaysLeft(medicines: Medicine[]): number {
  if (!medicines?.length) return 0;
  return Math.min(...medicines.map(calcMedDaysLeft));
}

export function getTag(daysLeft: number): PatientTag {
  if (daysLeft <= 0) return "missed";
  if (daysLeft <= 2) return "urgent";
  if (daysLeft === 3) return "today";
  if (daysLeft <= 7) return "upcoming";
  return "ok";
}

export function getWALink(
  mobile: string,
  name: string,
  medicines: Medicine[],
  daysLeft: number,
): string {
  const medNames = medicines.map((m) => m.brand).join(", ");
  const status =
    daysLeft <= 0
      ? "aapki dawai " + medNames + " khatam ho gayi hai"
      : "aapki dawai " +
        medNames +
        " sirf " +
        daysLeft +
        " din mein khatam hogi";
  const msg =
    "Namaste " +
    name +
    " ji\n\n" +
    status +
    ".\n\nKripya jaldi refill karwayein.\n\nPragya Medical";
  const phone = mobile.replace(/\D/g, "");
  return "https://wa.me/91" + phone + "?text=" + encodeURIComponent(msg);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const DOSAGE_FORMS = {
  tablet: {
    label: "Tablet",
    icon: "[T]",
    unit: "tablets",
    doseUnit: "tablet/day",
  },
  capsule: {
    label: "Capsule",
    icon: "[C]",
    unit: "capsules",
    doseUnit: "capsule/day",
  },
  syrup: { label: "Syrup", icon: "[S]", unit: "ml", doseUnit: "ml/day" },
  powder: {
    label: "Powder/Sachet",
    icon: "[P]",
    unit: "sachets",
    doseUnit: "sachet/day",
  },
  drops: { label: "Drops", icon: "[D]", unit: "ml", doseUnit: "doses/day" },
  injection: {
    label: "Injection",
    icon: "[I]",
    unit: "vials",
    doseUnit: "injection/wk",
  },
  inhaler: {
    label: "Inhaler",
    icon: "[IH]",
    unit: "puffs",
    doseUnit: "puffs/day",
  },
  cream: {
    label: "Cream/Gel",
    icon: "[CR]",
    unit: "gm",
    doseUnit: "applications/day",
  },
  other: { label: "Other", icon: "[O]", unit: "units", doseUnit: "units/day" },
} as const;

export const DISEASES = [
  "BP (Blood Pressure)",
  "Sugar (Diabetes)",
  "Thyroid",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
  "Arthritis",
  "Epilepsy",
  "Migraine",
  "PCOD/PCOS",
  "Liver Disease",
  "Cancer",
  "Other",
];
