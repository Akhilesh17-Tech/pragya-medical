"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetPatients } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import BottomNav from "@/components/layout/BottomNav";
import Toast, { showToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";
import Tag from "@/components/ui/Tag";
import type { Patient } from "@/types";

const FILTERS = [
  "All",
  "BP",
  "Sugar",
  "Thyroid",
  "Heart",
  "Insurance",
  "Delivery",
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace("/");
      return;
    }
    apiGetPatients()
      .then((res) => {
        const d = res.data.data || [];
        setPatients(d);
        setFiltered(d);
      })
      .catch(() => showToast("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...patients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mobile?.includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          p.doctor?.toLowerCase().includes(q) ||
          p.diseases?.some((d) => d.toLowerCase().includes(q)) ||
          p.medicines?.some((m) => m.brand.toLowerCase().includes(q)),
      );
    }
    if (activeFilter !== "All") {
      if (activeFilter === "Insurance")
        list = list.filter((p) => !!p.insurance);
      else if (activeFilter === "Delivery")
        list = list.filter((p) => p.delivery);
      else
        list = list.filter((p) =>
          p.diseases?.some((d) => d.includes(activeFilter)),
        );
    }
    setFiltered(list);
  }, [search, activeFilter, patients]);

  return (
    <PhoneShell>
      {/* Top bar */}
      <div className="bg-[#1a6fc4] px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold"
          >
            &larr;
          </button>
          <h1 className="text-white font-extrabold text-[16px]">
            All Patients
          </h1>
          <Link href="/patients/add">
            <button className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              +
            </button>
          </Link>
        </div>
        {/* Search inside blue header */}
        <div className="bg-white/15 rounded-2xl flex items-center px-3 py-2.5 gap-2 mb-3">
          <svg
            className="w-4 h-4 text-white/60 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            className="flex-1 bg-transparent text-white placeholder-white/60 text-[13px] outline-none"
            placeholder="Search name, mobile, medicine, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/60 font-bold text-sm"
            >
              ✕
            </button>
          )}
        </div>
        {/* Filter chips */}
        <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeFilter === f
                  ? "bg-white text-[#1a6fc4]"
                  : "bg-white/20 text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
        <span className="text-[12px] font-bold text-gray-500">
          {filtered.length} patients
        </span>
        <Link href="/patients/add">
          <button className="text-[12px] font-bold text-[#1a6fc4] bg-[#e8f1fb] px-3 py-1.5 rounded-xl">
            + Add New
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#f5f8fc]">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#e8f1fb] rounded-full flex items-center justify-center text-3xl mb-3">
              👥
            </div>
            <p className="text-[14px] font-bold text-gray-500 mb-1">
              No patients found
            </p>
            <p className="text-[12px] text-gray-400 mb-4">
              Try a different search or filter
            </p>
            <Link href="/patients/add">
              <button className="px-5 py-2.5 bg-[#1a6fc4] text-white rounded-xl text-[13px] font-bold">
                Add Patient
              </button>
            </Link>
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {filtered.map((p) => (
              <Link href={`/patients/${p.id}`} key={p.id}>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 active:scale-[0.99] transition-transform">
                  <div
                    className={`h-1 w-full ${
                      p.tag === "urgent"
                        ? "bg-red-500"
                        : p.tag === "today"
                          ? "bg-orange-500"
                          : p.tag === "upcoming"
                            ? "bg-yellow-400"
                            : p.tag === "missed"
                              ? "bg-gray-400"
                              : "bg-green-400"
                    }`}
                  />
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-[14px] flex-shrink-0 ${
                            p.gender === "Female"
                              ? "bg-pink-400"
                              : "bg-[#1a6fc4]"
                          }`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-extrabold text-gray-800">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {p.age} yrs · {p.area}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Tag tag={p.tag} />
                        <p
                          className={`text-[11px] font-bold mt-1 ${
                            p.days_left <= 0
                              ? "text-red-500"
                              : p.days_left <= 3
                                ? "text-orange-500"
                                : "text-green-600"
                          }`}
                        >
                          {p.days_left <= 0
                            ? "Finished"
                            : `${p.days_left}d left`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.diseases?.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          className="bg-[#e8f1fb] text-[#1a6fc4] text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        >
                          {d}
                        </span>
                      ))}
                      {p.delivery && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          Delivery
                        </span>
                      )}
                      <span
                        className={`ml-auto text-[10px] font-bold capitalize ${
                          p.reminder_status === "sent"
                            ? "text-blue-500"
                            : p.reminder_status === "purchased"
                              ? "text-green-500"
                              : p.reminder_status === "ignored"
                                ? "text-orange-500"
                                : "text-gray-300"
                        }`}
                      >
                        {p.reminder_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {p.mobile} · Dr. {p.doctor}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>

      <BottomNav />
      <Toast />
    </PhoneShell>
  );
}
