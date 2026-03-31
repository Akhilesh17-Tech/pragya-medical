import { TAG_CONFIG } from "@/lib/utils";
import type { PatientTag } from "@/types";

export default function Tag({ tag }: { tag: PatientTag }) {
  const styles: Record<string, { bg: string; color: string }> = {
    urgent: { bg: "#fee2e2", color: "#dc2626" },
    today: { bg: "#ffedd5", color: "#ea580c" },
    upcoming: { bg: "#fef9c3", color: "#ca8a04" },
    missed: { bg: "#f1f5f9", color: "#64748b" },
    ok: { bg: "#dcfce7", color: "#16a34a" },
  };
  const labels: Record<string, string> = {
    urgent: "URGENT",
    today: "TODAY",
    upcoming: "UPCOMING",
    missed: "MISSED",
    ok: "OK",
  };
  const s = styles[tag] || styles.ok;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {labels[tag]}
    </span>
  );
}
