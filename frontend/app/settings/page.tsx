"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetSettings, apiUpdateSettings } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import type { Settings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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

  const update = (field: keyof Settings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiUpdateSettings(settings);
      showToast("Settings saved successfully");
    } catch (err) {
      showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (!confirm("Logout?")) return;
    auth.logout();
  };

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1a6fc4] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
    </label>
  );

  const ChipGroup = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold border-[1.5px] transition-all capitalize ${
            value === o
              ? "bg-[#1a6fc4] border-[#1a6fc4] text-white"
              : "bg-white border-[#dce6f0] text-gray-500"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <PhoneShell>
      <TopBar title="Settings" backHref="/dashboard" />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading || !settings ? (
          <Spinner />
        ) : (
          <>
            {/* Auto reminder */}
            <Section title="Reminder Settings">
              <Row
                label="Enable Auto Reminder"
                sub="System sends reminders automatically"
              >
                <Toggle
                  value={settings.auto_reminder_on}
                  onChange={(v) => update("auto_reminder_on", v)}
                />
              </Row>
              <Row label="Daily Auto Reminder">
                <Toggle
                  value={settings.daily_auto}
                  onChange={(v) => update("daily_auto", v)}
                />
              </Row>
              <div className="pt-2">
                <p className="text-[12px] font-bold text-gray-500 mb-2">
                  Send Reminder Before
                </p>
                <ChipGroup
                  options={["7", "5", "3", "1"]}
                  value={String(settings.remind_before_days)}
                  onChange={(v) => update("remind_before_days", parseInt(v))}
                />
              </div>
            </Section>

            {/* Mode & time */}
            <Section title="Reminder Mode">
              <div className="mb-3">
                <p className="text-[12px] font-bold text-gray-500 mb-2">
                  Default Channel
                </p>
                <ChipGroup
                  options={["whatsapp", "sms", "call"]}
                  value={settings.reminder_mode}
                  onChange={(v) => update("reminder_mode", v as any)}
                />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-500 mb-2">
                  Default Time
                </p>
                <ChipGroup
                  options={["morning", "afternoon", "evening"]}
                  value={settings.reminder_time}
                  onChange={(v) => update("reminder_time", v as any)}
                />
              </div>
            </Section>

            {/* Schedule time */}
            <Section title="Scheduled Time">
              <input
                type="time"
                value={settings.scheduled_time}
                onChange={(e) => update("scheduled_time", e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[14px] outline-none focus:border-[#1a6fc4]"
              />
            </Section>

            {/* WhatsApp template */}
            <Section title="WhatsApp Message Template">
              <p className="text-[11px] text-gray-400 mb-2">
                Use {"{name}"}, {"{medicine}"}, {"{days}"} as variables
              </p>
              <textarea
                value={settings.wa_template}
                onChange={(e) => update("wa_template", e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#dce6f0] rounded-xl text-[12px] outline-none focus:border-[#1a6fc4] resize-none"
              />
            </Section>

            {/* Save */}
            <div className="px-4 pb-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-[#1a6fc4] text-white rounded-xl font-bold text-[14px] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {/* Logout */}
            <div className="px-4 pb-6">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-500 border-[1.5px] border-red-200 rounded-xl font-bold text-[14px]"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-[#dce6f0]">
      <p className="text-[13px] font-extrabold text-[#2c3e50] mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-[13px] font-semibold">{label}</p>
        {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
