"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetInvoices } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

const STATUS_CONFIG = {
  purchased_us: {
    label: "From Us",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  purchased_other: {
    label: "Other Store",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  pending: {
    label: "Will Buy Later",
    bg: "bg-gray-100",
    text: "text-gray-500",
  },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filtered, setFiltered] = useState<Invoice[]>([]);
  const [activeFilter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetInvoices()
      .then((res) => {
        const data = res.data.data || [];
        setInvoices(data);
        setFiltered(data);
      })
      .catch(() => showToast("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFiltered(invoices);
      return;
    }
    setFiltered(invoices.filter((inv) => inv.purchase_status === activeFilter));
  }, [activeFilter, invoices]);

  const total = invoices.length;
  const fromUs = invoices.filter(
    (i) => i.purchase_status === "purchased_us",
  ).length;
  const otherOrPending = total - fromUs;

  return (
    <PhoneShell>
      <TopBar
        title="Invoices"
        backHref="/dashboard"
        rightIcon="+"
        onRightClick={() => router.push("/invoices/create")}
      />

      {/* Stats bar */}
      <div className="bg-[#e8f1fb] px-4 py-3 border-b border-[#dce6f0]">
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: total, label: "Total", color: "text-[#1a6fc4]" },
            { val: fromUs, label: "From Us", color: "text-green-600" },
            { val: otherOrPending, label: "Other", color: "text-orange-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-2.5 text-center border border-[#dce6f0]"
            >
              <p className={`text-[18px] font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-400 font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        {[
          { key: "all", label: "All" },
          { key: "purchased_us", label: "From Us" },
          { key: "purchased_other", label: "Other Store" },
          { key: "pending", label: "Pending" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border-[1.5px] flex-shrink-0 transition-all ${
              activeFilter === f.key
                ? "bg-[#1a6fc4] border-[#1a6fc4] text-white"
                : "bg-white border-[#dce6f0] text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] text-gray-400 mb-3">No invoices yet</p>
            <Link href="/invoices/create">
              <button className="px-4 py-2 bg-[#1a6fc4] text-white rounded-xl text-[13px] font-bold">
                Create First Invoice
              </button>
            </Link>
          </div>
        ) : (
          filtered.map((inv) => {
            const sc =
              STATUS_CONFIG[inv.purchase_status] || STATUS_CONFIG.pending;
            return (
              <div
                key={inv.id}
                className="mx-4 mb-3 bg-white rounded-xl shadow-sm border border-[#dce6f0] overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#1a6fc4] px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-extrabold text-[13px]">
                      {inv.patient?.name || "Patient"}
                    </p>
                    <p className="text-white/70 text-[10px]">
                      {inv.patient?.mobile}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-extrabold text-[14px]">
                      Rs {inv.grand_total?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-white/70 text-[10px]">
                      {formatDate(inv.created_at)}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#1a6fc4]">
                      {inv.invoice_no}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {inv.items && inv.items.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {inv.items.map((item, i) => (
                        <span
                          key={i}
                          className="bg-[#e8f1fb] text-[#1a6fc4] text-[10px] px-2 py-0.5 rounded font-semibold"
                        >
                          {item.brand}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      Subtotal: Rs {inv.subtotal?.toLocaleString("en-IN")}
                      {inv.discount > 0 && ` · Discount: Rs ${inv.discount}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div className="h-4" />
      </div>

      {/* Create button */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <Link href="/invoices/create">
          <button className="w-full py-3 bg-[#1a6fc4] text-white rounded-xl font-bold text-[14px]">
            + Create New Invoice
          </button>
        </Link>
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}
