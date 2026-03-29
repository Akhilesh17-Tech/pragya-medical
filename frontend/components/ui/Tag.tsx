import { TAG_CONFIG } from "@/lib/utils";
import type { PatientTag } from "@/types";

export default function Tag({ tag }: { tag: PatientTag }) {
  const c = TAG_CONFIG[tag];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}
