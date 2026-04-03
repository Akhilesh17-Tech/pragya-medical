"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetSettings, apiUpdateSettings } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Spinner from "@/components/ui/Spinner";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";
import type { Settings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const user = auth.getUser();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetSettings()
      .then((res) => setSettings(res.data.data))
      .catch(() => showToast("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof Settings, value: any) =>
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiUpdateSettings(settings);
      showToast("Settings saved successfully");
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const sectionCard: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    marginBottom: 12,
    overflow: "hidden",
  };
  const sectionHeader = (title: string, subtitle?: string) => (
    <div
      style={{
        padding: "12px clamp(16px, 3vw, 32px)",
        background: "#FAFBFC",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: COLORS.primary,
          textTransform: "uppercase" as const,
          letterSpacing: 1,
          margin: 0,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "3px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        cursor: "pointer",
        position: "relative",
        width: 48,
        height: 26,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 13,
          background: value ? COLORS.primary : "#CBD5E1",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: value ? 25 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );

  const Chips = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            background: value === o ? COLORS.primary : "#F1F5F9",
            color: value === o ? "white" : COLORS.textSecondary,
            boxShadow: value === o ? `0 2px 8px ${COLORS.primary}50` : "none",
            textTransform: "capitalize" as const,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );

  const DayChips = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div style={{ display: "flex", gap: 8 }}>
      {[7, 5, 3, 1].map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            background: value === d ? COLORS.primary : "#F1F5F9",
            color: value === d ? "white" : COLORS.textSecondary,
            boxShadow: value === d ? `0 2px 8px ${COLORS.primary}50` : "none",
          }}
        >
          {d}
        </button>
      ))}
    </div>
  );

  if (loading)
    return (
      <AppShell title="Settings">
        <Spinner />
      </AppShell>
    );
  if (!settings) return null;

  return (
    <AppShell title="Settings">
      <div style={{ background: "#F8FAFC", minHeight: "100%", padding: 16 }}>
        {/* User profile card */}
        <div style={{ ...sectionCard, marginBottom: 12 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: 800,
                    margin: "0 0 3px",
                  }}
                >
                  {user?.name}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 12,
                    margin: "0 0 3px",
                  }}
                >
                  {user?.email}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    margin: 0,
                  }}
                >
                  {user?.pharmacy_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder toggles */}
        <div style={sectionCard}>
          {sectionHeader(
            "Auto Reminders",
            "Configure automatic reminder behavior",
          )}
          <div style={{ padding: "4px clamp(16px, 3vw, 32px) 12px" }}>
            {[
              {
                label: "Enable Auto Reminder",
                sub: "System sends reminders automatically",
                field: "auto_reminder_on" as const,
              },
              {
                label: "Daily Auto Reminder",
                sub: "Run reminder check every day",
                field: "daily_auto" as const,
              },
            ].map((row) => (
              <div
                key={row.field}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #F8FAFC",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                      margin: "0 0 2px",
                    }}
                  >
                    {row.label}
                  </p>
                  <p
                    style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}
                  >
                    {row.sub}
                  </p>
                </div>
                <Toggle
                  value={settings[row.field] as boolean}
                  onChange={(v) => update(row.field, v)}
                />
              </div>
            ))}
            <div style={{ paddingTop: 14 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  margin: "0 0 10px",
                }}
              >
                Send reminder before (days)
              </p>
              <DayChips
                value={settings.remind_before_days}
                onChange={(v) => update("remind_before_days", v)}
              />
            </div>
          </div>
        </div>

        {/* Channel & time */}
        <div style={sectionCard}>
          {sectionHeader("Channel & Timing", "How and when to send reminders")}
          <div
            style={{
              padding: "14px clamp(16px, 3vw, 32px)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  margin: "0 0 10px",
                }}
              >
                Default Channel
              </p>
              <Chips
                options={["whatsapp", "sms", "call"]}
                value={settings.reminder_mode}
                onChange={(v) => update("reminder_mode", v as any)}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  margin: "0 0 10px",
                }}
              >
                Preferred Time
              </p>
              <Chips
                options={["morning", "afternoon", "evening"]}
                value={settings.reminder_time}
                onChange={(v) => update("reminder_time", v as any)}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  margin: "0 0 8px",
                }}
              >
                Scheduled Time
              </p>
              <input
                type="time"
                value={settings.scheduled_time}
                onChange={(e) => update("scheduled_time", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.border}`,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box" as const,
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
            </div>
          </div>
        </div>

        {/* WA Template */}
        <div style={sectionCard}>
          {sectionHeader(
            "WhatsApp Template",
            "Use {name}, {medicine}, {days} as variables",
          )}
          <div style={{ padding: 16 }}>
            <textarea
              value={settings.wa_template}
              onChange={(e) => update("wa_template", e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`,
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                resize: "none" as const,
                lineHeight: 1.6,
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 14,
            border: "none",
            background: saving
              ? "#90A4AE"
              : `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
            boxShadow: saving ? "none" : "0 4px 12px rgba(21,101,192,0.3)",
            marginBottom: 10,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            if (confirm("Sign out?")) auth.logout();
          }}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            background: "#FFF5F5",
            color: "#C62828",
            border: "1.5px solid #FFCDD2",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Sign Out
        </button>

        <div style={{ height: 16 }} />
      </div>
    </AppShell>
  );
}
