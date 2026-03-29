"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { apiGetPatients, apiDeletePatient } from "@/lib/api";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
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
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await apiGetPatients();
      const data: Patient[] = res.data.data || [];
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      showToast("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

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
      else list = list.filter((p) => p.diseases?.includes(activeFilter));
    }
    setFiltered(list);
  }, [search, activeFilter, patients]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Delete " + name + "? This cannot be undone.")) return;
    try {
      await apiDeletePatient(id);
      showToast("Patient deleted");
      loadPatients();
    } catch (err) {
      showToast("Failed to delete patient");
    }
  };

  return (
    <PhoneShell>
      <TopBar title="All Patients" backHref="/dashboard" />

      {/* Search */}
      <div className="mx-4 my-3 bg-white border-[1.5px] border-[#dce6f0] rounded-[10px] flex items-center px-3 py-2.5 gap-2">
        <span className="text-gray-400 text-sm">Search</span>
        <input
          className="flex-1 border-none outline-none text-[13px]"
          placeholder="Name, mobile, medicine, area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-gray-400 text-sm"
          >
            x
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border-[1.5px] transition-all flex-shrink-0 ${
              activeFilter === f
                ? "bg-[#1a6fc4] border-[#1a6fc4] text-white"
                : "bg-white border-[#dce6f0] text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Count bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#dce6f0] bg-white">
        <span className="text-[12px] font-bold text-gray-500">
          {filtered.length} Patients
        </span>
        <Link href="/patients/add">
          <button className="px-3 py-1.5 bg-[#1a6fc4] text-white rounded-lg text-[11px] font-bold">
            + Add New
          </button>
        </Link>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-2">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] text-gray-400 mb-3">No patients found</p>
            <Link href="/patients/add">
              <button className="px-4 py-2 bg-[#1a6fc4] text-white rounded-xl text-[13px] font-bold">
                Add First Patient
              </button>
            </Link>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="mx-4 mb-2.5">
              <Link href={`/patients/${p.id}`}>
                <div
                  className={`bg-white rounded-xl p-3 shadow-sm border-[1.5px] border-transparent hover:border-[#1a6fc4] transition-all cursor-pointer border-l-4 ${
                    p.tag === "urgent"
                      ? "border-l-red-500"
                      : p.tag === "today"
                        ? "border-l-orange-500"
                        : p.tag === "missed"
                          ? "border-l-gray-400"
                          : p.tag === "upcoming"
                            ? "border-l-yellow-400"
                            : "border-l-green-400"
                  }`}
                >
                  {/* Row 1 */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-[14px] font-bold">{p.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {p.mobile} · {p.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[11px] font-bold ${
                          p.days_left <= 0
                            ? "text-red-500"
                            : p.days_left <= 3
                              ? "text-orange-500"
                              : "text-green-600"
                        }`}
                      >
                        {p.days_left <= 0 ? "Missed" : `${p.days_left}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Diseases */}
                  <div className="flex gap-1 flex-wrap my-1">
                    {p.diseases?.map((d) => (
                      <span
                        key={d}
                        className="bg-[#e8f1fb] text-[#1a6fc4] text-[10px] font-bold px-1.5 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-2 mt-1">
                    <Tag tag={p.tag} />
                    {p.delivery && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Delivery
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold ml-auto ${
                        p.reminder_status === "sent"
                          ? "text-blue-500"
                          : p.reminder_status === "purchased"
                            ? "text-green-600"
                            : p.reminder_status === "ignored"
                              ? "text-orange-500"
                              : "text-gray-400"
                      }`}
                    >
                      {p.reminder_status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Link>
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
