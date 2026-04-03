"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/auth";
import Toast from "@/components/ui/Toast";

// ── SVG Icons ─────────────────────────────────────────────────────
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zm-8 11.54L6 16.04V9.46l6 2.83 6-2.83v6.58l-6 2.46zM12 5.19L17.47 8 12 10.81 6.53 8 12 5.19z" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "home", group: "main" },
  { href: "/patients", label: "Patients", icon: "users", group: "main" },
  { href: "/patients/add", label: "Add Patient", icon: "add", group: "main" },
  {
    href: "/reminders",
    label: "Reminders",
    icon: "bell",
    group: "main",
    hasAlert: true,
  },
  { href: "/invoices", label: "Invoices", icon: "invoice", group: "business" },
  { href: "/inventory", label: "Inventory", icon: "box", group: "business" },
  { href: "/analytics", label: "Analytics", icon: "chart", group: "business" },
  { href: "/settings", label: "Settings", icon: "gear", group: "system" },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/patients/add", label: "Add", icon: "add" },
  { href: "/reminders", label: "Alerts", icon: "bell", hasAlert: true },
  { href: "/patients", label: "Patients", icon: "users" },
];

// NavItem component - moved outside to prevent recreation on render
const NavItem = ({
  item,
  collapsed = false,
  isActive,
  urgentCount,
  onNavClick,
}: {
  item: (typeof NAV)[0];
  collapsed?: boolean;
  isActive: (href: string) => boolean;
  urgentCount: number;
  onNavClick: () => void;
}) => {
  const active = isActive(item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavClick}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 12,
          padding: collapsed ? "10px 0" : "10px 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 12,
          margin: "1px 8px",
          cursor: "pointer",
          transition: "all 0.15s",
          background: active ? "rgba(255,255,255,0.15)" : "transparent",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!active)
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        {active && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 20,
              background: "white",
              borderRadius: "0 3px 3px 0",
            }}
          />
        )}
        <div
          style={{
            color: active ? "white" : "rgba(255,255,255,0.55)",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {Icons[item.icon as keyof typeof Icons]}
          {item.hasAlert && urgentCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 15,
                height: 15,
                borderRadius: "50%",
                background: "#EF4444",
                color: "white",
                fontSize: 8,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid #1565C0",
              }}
            >
              {urgentCount > 9 ? "9+" : urgentCount}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <span
              style={{
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                color: active ? "white" : "rgba(255,255,255,0.65)",
                flex: 1,
              }}
            >
              {item.label}
            </span>
            {item.hasAlert && urgentCount > 0 && (
              <span
                style={{
                  background: "#EF4444",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: 20,
                }}
              >
                {urgentCount}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
};

// SidebarContent component - moved outside to prevent recreation on render
const SidebarContent = ({
  user,
  urgentCount,
  isActive,
  onLogout,
  onNavClick,
}: {
  user: any;
  urgentCount: number;
  isActive: (href: string) => boolean;
  onLogout: () => void;
  onNavClick: () => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    {/* Brand */}
    <div style={{ padding: "20px 16px 16px", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,0.2)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
          </svg>
        </div>
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 9,
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Pharmacy System
          </p>
          <p
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: 800,
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            Pragya Medical
          </p>
        </div>
      </div>

      {/* User chip */}
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {user?.name?.charAt(0) || "A"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name || "Admin"}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 10,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.pharmacy_name}
          </p>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#4ADE80",
            flexShrink: 0,
          }}
        />
      </div>
    </div>

    {/* Nav groups */}
    <div
      style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}
      className="scrollbar-hide"
    >
      {[
        { label: "Main", items: NAV.filter((n) => n.group === "main") },
        { label: "Business", items: NAV.filter((n) => n.group === "business") },
        { label: "System", items: NAV.filter((n) => n.group === "system") },
      ].map((group) => (
        <div key={group.label} style={{ marginBottom: 8 }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              margin: "12px 24px 4px",
              padding: 0,
            }}
          >
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive}
              urgentCount={urgentCount}
              onNavClick={onNavClick}
            />
          ))}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div
      style={{
        padding: "12px 16px 16px",
        flexShrink: 0,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.12)",
          color: "#FCA5A5",
          border: "1px solid rgba(239,68,68,0.25)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.12)";
        }}
      >
        {Icons.logout}
        Sign Out
      </button>
      <p
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          margin: "10px 0 0",
        }}
      >
        &copy; {new Date().getFullYear()} Pragya Medical &nbsp;&bull;&nbsp;
        v1.0.0
      </p>
    </div>
  </div>
);

interface Props {
  children: React.ReactNode;
  title?: string;
  urgentCount?: number;
}

export default function AppShell({ children, title, urgentCount = 0 }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const path = usePathname();
  const user = auth.getUser();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = (href: string) =>
    href === "/patients/add" ? path === href : path.startsWith(href);

  const logout = () => {
    setDrawerOpen(false);
    if (confirm("Sign out of Pragya Medical?")) auth.logout();
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none !important; }
        body { font-family: 'Inter', sans-serif; background: #F0F4F8; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

        .app-root {
          display: flex;
          min-height: 100vh;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
          box-shadow: 4px 0 24px rgba(13,71,161,0.3);
        }

        /* ── MAIN ── */
        .main-wrap {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
        }

        /* ── TOP BAR ── */
        .topbar {
          background: white;
          border-bottom: 1px solid #E0E7EF;
          padding: 0 28px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky; top: 0; z-index: 30;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
          flex-shrink: 0;
        }

        .topbar-title {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.4px;
        }

        .topbar-sub {
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
          margin-top: 1px;
        }

        .page-body {
          flex: 1;
          overflow-y: auto;
          background: #F0F4F8;
        }
        .page-body::-webkit-scrollbar { display: none; }

        .page-inner {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── FOOTER ── */
        .footer {
          background: white;
          border-top: 1px solid #E0E7EF;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        /* ── BOTTOM NAV (mobile) ── */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top: 1px solid #E0E7EF;
          z-index: 50;
          grid-template-columns: repeat(4, 1fr);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        }

        .mobile-menu-btn { display: none; }

        /* ── TABLET ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar { width: 220px; }
          .main-wrap { margin-left: 220px; }
          .topbar { padding: 0 20px; }
          .footer { padding: 12px 20px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .sidebar { display: none; }
          .main-wrap { margin-left: 0; }
          .topbar { padding: 0 16px; height: 54px; }
          .topbar-title { font-size: 16px; }
          .footer { display: none; }
          .bottom-nav { display: grid; }
          .mobile-menu-btn { display: flex !important; }
          .page-body { padding-bottom: 80px; }
        }
      `}</style>

      <div className="app-root">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="sidebar">
          <SidebarContent
            user={user}
            urgentCount={urgentCount}
            isActive={isActive}
            onLogout={logout}
            onNavClick={() => {}}
          />
        </aside>

        {/* ── MAIN WRAPPER ── */}
        <div className="main-wrap">
          {/* Top bar */}
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Mobile hamburger */}
              <button
                className="mobile-menu-btn"
                onClick={() => setDrawerOpen(true)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#F1F5F9",
                  border: "1px solid #E0E7EF",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                  flexShrink: 0,
                }}
              >
                {Icons.menu}
              </button>

              {/* Breadcrumb-style title */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 1,
                  }}
                >
                  <span
                    style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}
                  >
                    {user?.pharmacy_name || "Pragya Medical"}
                  </span>
                  <span style={{ color: "#CBD5E1", fontSize: 11 }}>/</span>
                  <span
                    style={{ fontSize: 11, color: "#1565C0", fontWeight: 600 }}
                  >
                    {title || "Dashboard"}
                  </span>
                </div>
                <h1 className="topbar-title">{title || "Dashboard"}</h1>
              </div>
            </div>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Add patient button */}
              <Link href="/patients/add" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 16px",
                    borderRadius: 10,
                    background: "#1565C0",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 2px 8px rgba(21,101,192,0.35)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0D47A1";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1565C0";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {Icons.add}
                  <span style={{ display: isMobile ? "none" : "inline" }}>
                    Add Patient
                  </span>
                </button>
              </Link>

              {/* Bell */}
              <Link href="/reminders" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: urgentCount > 0 ? "#FFEBEE" : "#F1F5F9",
                    border:
                      urgentCount > 0
                        ? "1.5px solid #FFCDD2"
                        : "1px solid #E0E7EF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: urgentCount > 0 ? "#C62828" : "#64748B",
                    position: "relative",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      urgentCount > 0 ? "#FFCDD2" : "#E2E8F0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      urgentCount > 0 ? "#FFEBEE" : "#F1F5F9")
                  }
                >
                  {Icons.bell}
                  {urgentCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "#EF4444",
                        color: "white",
                        fontSize: 8,
                        fontWeight: 900,
                        borderRadius: "50%",
                        width: 17,
                        height: 17,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                      }}
                    >
                      {urgentCount > 9 ? "9+" : urgentCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* User avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #1565C0, #1976D2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(21,101,192,0.3)",
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>
          </header>

          {/* Page body */}
          <main className="page-body">
            <div className="page-inner">{children}</div>
          </main>

          {/* Footer */}
          <footer className="footer">
            <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} Pragya Medical. All rights
              reserved.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Use", "Contact Support"].map(
                (l) => (
                  <span
                    key={l}
                    style={{
                      fontSize: 12,
                      color: "#94A3B8",
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#1565C0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#94A3B8")
                    }
                  >
                    {l}
                  </span>
                ),
              )}
            </div>
            <p style={{ fontSize: 11, color: "#CBD5E1" }}>v1.0.0</p>
          </footer>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="bottom-nav">
          {BOTTOM_TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 10,
                    paddingBottom: 8,
                    color: active ? "#1565C0" : "#94A3B8",
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 28,
                        height: 3,
                        background: "#1565C0",
                        borderRadius: "0 0 4px 4px",
                      }}
                    />
                  )}
                  <div style={{ position: "relative", marginBottom: 4 }}>
                    {Icons[tab.icon as keyof typeof Icons]}
                    {tab.hasAlert && urgentCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#EF4444",
                          color: "white",
                          fontSize: 7,
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1.5px solid white",
                        }}
                      >
                        {urgentCount}
                      </span>
                    )}
                  </div>
                  <span
                    style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── MOBILE DRAWER ── */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 60,
                backdropFilter: "blur(3px)",
                animation: "fadeIn 0.2s ease",
              }}
            />
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "82%",
                maxWidth: 300,
                background:
                  "linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
                zIndex: 61,
                animation: "slideIn 0.25s ease",
                boxShadow: "8px 0 32px rgba(13,71,161,0.4)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {Icons.close}
              </button>
              <SidebarContent
                user={user}
                urgentCount={urgentCount}
                isActive={isActive}
                onLogout={logout}
                onNavClick={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}
      </div>

      <Toast />
    </>
  );
}
