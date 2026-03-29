"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/patients/add", label: "Add" },
  { href: "/reminders", label: "Reminders" },
  { href: "/patients", label: "Patients" },
];

export default function BottomNav({
  urgentCount = 0,
}: {
  urgentCount?: number;
}) {
  const path = usePathname();

  return (
    <nav className="bg-white border-t border-gray-100 grid grid-cols-4 py-2 flex-shrink-0">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/patients/add"
            ? path === tab.href
            : path.startsWith(tab.href);
        const isReminder = tab.href === "/reminders";

        return (
          <Link key={tab.href} href={tab.href}>
            <div className="flex flex-col items-center gap-0.5 py-1 cursor-pointer relative">
              {isReminder && urgentCount > 0 && (
                <span className="absolute top-0 right-4 w-2 h-2 bg-red-500 rounded-full" />
              )}
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
                  isActive ? "bg-[#1a6fc4] text-white" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
