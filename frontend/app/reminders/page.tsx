"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetReminders, apiUpdateReminderStatus } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import Tag from "@/components/ui/Tag";
import { getWALink } from "@/lib/utils";
import type { Patient } from "@/types";

type Tab  = "urgent" | "today" | "upcoming" | "missed" | "all";
type Sort = "days_left" | "area" | "medicine";

const TABS: { key: Tab; label: string; activeClass: string }[] = [
  { key: "urgent",   label: "URGENT",   activeClass: "bg-red-500 text-white border-red-500"       },
  { key: "today",    label: "TODAY",    activeClass: "bg-orange-500 text-white border-orange-500"  },
  { key: "upcoming", label: "UPCOMING", activeClass: "bg-yellow-400 text-white border-yellow-400"  },
  { key: "missed",   label: "MISSED",   activeClass: "bg-gray-500 text-white border-gray-500"      },
  { key: "all",      label: "ALL",      activeClass: "bg-[#1a6fc4] text-white border-[#1a6fc4]"    },
];

export default function RemindersPage() {
  const [tab, setTab]         = useState<Tab>("urgent");
  const [sort, setSort]       = useState<Sort>("days_left");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace("/"); return; }
  }, []);

  useEffect(() => {
    load();
  }, [tab, sort]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGetReminders(tab, sort);
      setPatients(res.data.data || []);
    } catch (err) {
      showToast("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (patientId: string, status: string) => {
    try {
      await apiUpdateReminderStatus(patientId, status);
      showToast("Marked as " + status);
      load();
    } catch (err) {
      showToast("Failed to update");
    }
  };

  const handleBulkSend = async () => {
    if (!patients.length) return;
    try {
      await Promise.all(patients.map((p) => apiUpdateReminderStatus(p.id, "sent")));
      showToast("Sent reminders to " + patients.length + " patients");
      load();
    } catch (err) {
      showToast("Failed to send bulk reminders");
    }
  };

  return (
    <PhoneShell>
      <TopBar title="Reminder Panel" backHref="/dashboard" />

      {/* Priority guide */}
      <div className="mx-4 mt-2.5 bg-[#e8f1fb] rounded-xl p-3 border border-[#dce6f0]">
        <p className="text-[11px] font-extrabold text-[#1a6fc4] mb-1.5">Priority Guide</p>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold text-gray-600">
          <p>URGENT: 0-2 days left</p>
          <p>TODAY: 3 days left</p>
          <p>UPCOMING: 4-7 days</p>
          <p>MISSED: Medicine over</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 px-4 py-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-1.5 rounded-lg text-[10px] font-bold border-[1.5px] transition-all ${
              tab === t.key ? t.activeClass : "bg-white border-[#dce6f0] text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1.5 px-4 pb-2 items-center">
        <span className="text-[10px] font-bold text-gray-400">SORT:</span>
        {(["days_left", "area", "medicine"] as Sort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-[1.5px] transition-all ${
              sort === s
                ? "bg-[#1a6fc4] border-[#1a6fc4] text-white"
                : "bg-white border-[#dce6f0] text-gray-400"
            }`}
          >
            {s === "days_left" ? "Days Left" : s === "area" ? "Area" : "Medicine"}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {patients.length > 0 && (
        <div className="mx-4 mb-2 bg-[#e8f1fb] rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#1a6fc4] flex-1">
            {patients.length} patients
          </span>
          <button
            onClick={handleBulkSend}
            className="bg-green-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg"
          >
            Mark All Sent
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <Spinner />
        ) : patients.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-10">
            No patients in this category
          </p>
        ) : (
          patients.map((p) => (
            <div
              key={p.id}
              className={`mx-4 mb-2.5 bg-white rounded-xl p-3 shadow-sm border-l-4 ${
                p.tag === "urgent" ? "border-l-red-500" :
                p.tag === "today"  ? "border-l-orange-500" :
                p.tag === "upcoming" ? "border-l-yellow-400" : "border-l-gray-400"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <Link href={`/patients/${p.id}`}>
                  <p className="text-[14px] font-bold">{p.name}</p>
                </Link>
                <Tag tag={p.tag} />
              </div>
              <p className="text-[11px] text-gray-500 mb-0.5">
                {p.diseases?.join(", ")} · {p.area}
              </p>
              <p className="text-[11px] text-gray-500 mb-2">
                {p.mobile} · Dr. {p.doctor}
              </p>

              {/* Medicine pills */}
              {p.medicines?.slice(0, 2).map((m) => (
                <div key={m.id} className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-700">{m.brand}</span>
                  <span
                    className={`text-[11px] font-bold ${
                      (m.days_left ?? 0) <= 0 ? "text-red-500" :
                      (m.days_left ?? 0) <= 3 ? "text-orange-500" : "text-gray-500"
                    }`}
                  >
                    {(m.days_left ?? 0) <= 0 ? "FINISHED" : `${m.days_left}d left`}
                  </span>
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-1.5 mt-2">
                <a
                  href={getWALink(p.whatsapp || p.mobile, p.name, p.medicines, p.days_left)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMark(p.id, "sent")}
                  className="flex-1 py-1.5 bg-green-500 text-white text-center rounded-lg text-[11px] font-bold"
                >
                  WhatsApp
                </a>
                <a
                  href={"tel:" + p.mobile}
                  className="flex-1 py-1.5 bg-[#e8f1fb] text-[#1a6fc4] text-center rounded-lg text-[11px] font-bold"
                >
                  Call
                </a>
                <button
                  onClick={() => handleMark(p.id, "purchased")}
                  className="flex-1 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-[11px] font-bold"
                >
                  Purchased
                </button>
                <button
                  onClick={() => handleMark(p.id, "ignored")}
                  className="px-2 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-[11px] font-bold"
                >
                  Skip
                </button>
              </div>
            </div>
          ))
        )}
        <div className="h-4" />
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}