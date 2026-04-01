import { COLORS } from "@/lib/theme";

export default function Spinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `4px solid ${COLORS.primaryLight}`,
        borderTop: `4px solid ${COLORS.primary}`,
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500, margin: 0 }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}