"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/patients/add", label: "Add" },
  { href: "/reminders", label: "Reminders" },
  { href: "/patients", label: "Patients" },
];

const ICONS = [
  // Home
  <svg key="home" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>,
  // Plus
  <svg key="add" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M12 5a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5V6a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>,
  // Bell
  <svg key="bell" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h16a1 1 0 00.707-1.707L20 11.586V8a6 6 0 00-6-6 6 6 0 00-4 0zm0 16a2 2 0 104 0h-4z" />
  </svg>,
  // Users
  <svg key="users" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>,
];

export default function BottomNav({
  urgentCount = 0,
}: {
  urgentCount?: number;
}) {
  const path = usePathname();

  return (
    <nav
      className="bg-white border-t border-slate-100 flex-shrink-0"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
    >
      <div className="grid grid-cols-4 px-2 py-1">
        {TABS.map((tab, i) => {
          const isActive =
            tab.href === "/patients/add"
              ? path === tab.href
              : path.startsWith(tab.href);
          const isReminder = tab.href === "/reminders";

          return (
            <Link key={tab.href} href={tab.href}>
              <div className="flex flex-col items-center justify-center py-2 gap-1 relative cursor-pointer">
                <div
                  className={`relative p-2 rounded-2xl transition-all ${isActive ? "bg-[#e8f1fb]" : ""}`}
                  style={{ color: isActive ? "#1a6fc4" : "#94a3b8" }}
                >
                  {ICONS[i]}
                  {isReminder && urgentCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-black border-2 border-white"
                      style={{ fontSize: "8px" }}
                    >
                      {urgentCount > 9 ? "9+" : urgentCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold transition-colors ${isActive ? "text-[#1a6fc4]" : "text-slate-400"}`}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
