"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { apiGetAnalytics } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import type { Analytics } from "@/types";

export default function AnalyticsPage() {
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace("/"); return; }
    apiGetAnalytics()
      .then((res) => setData(res.data.data))
      .catch(() => showToast("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dce6f0] text-center">
      <p className={`text-[26px] font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{label}</p>
    </div>
  );

  return (
    <PhoneShell>
      <TopBar title="Analytics" backHref="/dashboard" />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? <Spinner /> : !data ? null : (
          <>
            {/* Summary cards */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <StatCard label="Total Patients"    value={data.total_patients}        color="text-[#1a6fc4]" />
              <StatCard label="Urgent"            value={data.urgent}                color="text-red-500"   />
              <StatCard label="Today Due"         value={data.today}                 color="text-orange-500"/>
              <StatCard label="Upcoming (7 days)" value={data.upcoming}              color="text-yellow-600"/>
              <StatCard label="Missed"            value={data.missed}                color="text-gray-500"  />
              <StatCard label="Insurance Expiring"value={data.insurance_expiring}    color="text-green-600" />
            </div>

            {/* Revenue */}
            <div className="mx-4 bg-[#1a6fc4] rounded-xl p-4 text-white mb-4">
              <p className="text-[12px] text-white/70 font-semibold uppercase tracking-wide mb-1">
                Total Monthly Revenue
              </p>
              <p className="text-[32px] font-extrabold">
                Rs {data.total_monthly_revenue?.toLocaleString("en-IN")}
              </p>
              <p className="text-[12px] text-white/70 mt-1">
                Avg per patient: Rs{" "}
                {data.total_patients
                  ? Math.round(data.total_monthly_revenue / data.total_patients).toLocaleString("en-IN")
                  : 0}
              </p>
            </div>

            {/* Reminders */}
            <div className="mx-4 bg-white rounded-xl p-4 border border-[#dce6f0] mb-4">
              <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase mb-3">
                Reminders This Month
              </p>
              <p className="text-[28px] font-extrabold text-[#2c3e50]">
                {data.reminders_this_month}
              </p>
              <p className="text-[12px] text-gray-400">reminders sent</p>
            </div>

            {/* Reminder breakdown bar */}
            <div className="mx-4 bg-white rounded-xl p-4 border border-[#dce6f0] mb-4">
              <p className="text-[12px] font-extrabold text-[#1a6fc4] uppercase mb-3">
                Patient Status Breakdown
              </p>
              {[
                { label: "Urgent",   value: data.urgent,   color: "bg-red-500",    total: data.total_patients },
                { label: "Today",    value: data.today,    color: "bg-orange-400", total: data.total_patients },
                { label: "Upcoming", value: data.upcoming, color: "bg-yellow-400", total: data.total_patients },
                { label: "Missed",   value: data.missed,   color: "bg-gray-400",   total: data.total_patients },
              ].map((row) => (
                <div key={row.label} className="mb-3">
                  <div className="flex justify-between text-[12px] font-semibold mb-1">
                    <span>{row.label}</span>
                    <span>{row.value} patients</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${row.color} h-2 rounded-full transition-all`}
                      style={{
                        width: row.total
                          ? `${Math.round((row.value / row.total) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="h-4" />
      </div>
      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}