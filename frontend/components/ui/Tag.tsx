import { TAG_STYLES } from "@/lib/theme";
import type { PatientTag } from "@/types";

export default function Tag({ tag }: { tag: PatientTag }) {
  const s = TAG_STYLES[tag] || TAG_STYLES.ok;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
      padding: "3px 8px", borderRadius: 6, display: "inline-flex",
      alignItems: "center",
    }}>
      {s.label}
    </span>
  );
}