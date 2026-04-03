"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { COLORS } from "@/lib/theme";
import Toast from "@/components/ui/Toast";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const InvoiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M20 7l-8-4-8 4v10l8 4 8-4V7zm-8 11.54L6 16.04V9.46l6 2.83 6-2.83v6.58l-6 2.46zM12 5.19L17.47 8 12 10.81 6.53 8 12 5.19z" />
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/patients", label: "Patients", Icon: UsersIcon },
  { href: "/patients/add", label: "Add Patient", Icon: AddIcon },
  { href: "/reminders", label: "Reminders", Icon: BellIcon },
  { href: "/invoices", label: "Invoices", Icon: InvoiceIcon },
  { href: "/inventory", label: "Inventory", Icon: BoxIcon },
  { href: "/analytics", label: "Analytics", Icon: ChartIcon },
  { href: "/settings", label: "Settings", Icon: GearIcon },
];

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/patients/add", label: "Add", Icon: AddIcon },
  { href: "/reminders", label: "Reminders", Icon: BellIcon },
  { href: "/patients", label: "Patients", Icon: UsersIcon },
];

interface Props {
  children: React.ReactNode;
  title?: string;
  urgentCount?: number;
}

export default function AppShell({ children, title, urgentCount = 0 }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const user = auth.getUser();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    if (confirm("Sign out?")) auth.logout();
  };

  const isActive = (href: string) =>
    href === "/patients/add" ? path === href : path.startsWith(href);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #F0F4F8; font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        /* DESKTOP LAYOUT */
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: #F0F4F8;
        }

        /* SIDEBAR — desktop only */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: white;
          border-right: 1px solid #E0E7EF;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 40;
          box-shadow: 2px 0 12px rgba(0,0,0,0.06);
        }

        .sidebar-brand {
          padding: 20px 20px 16px;
          background: linear-gradient(135deg, #0D47A1, #1565C0);
          flex-shrink: 0;
        }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }

        .sidebar-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 20px; cursor: pointer;
          transition: all 0.15s; text-decoration: none;
          border-right: 3px solid transparent;
          margin-bottom: 2px;
        }
        .sidebar-nav-item:hover { background: #F0F4F8; }
        .sidebar-nav-item.active {
          background: #E3F2FD;
          border-right-color: #1565C0;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #E0E7EF;
          flex-shrink: 0;
          background: #FAFBFC;
        }

        /* MAIN CONTENT AREA */
        .main-area {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* TOP HEADER BAR */
        .top-header {
          background: linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%);
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky; top: 0; z-index: 30;
          box-shadow: 0 2px 12px rgba(21,101,192,0.3);
        }

        /* PAGE CONTENT */
        .page-content {
          flex: 1;
          overflow-y: auto;
          background: #F0F4F8;
        }

        /* DESKTOP FOOTER */
        .desktop-footer {
          background: white;
          border-top: 1px solid #E0E7EF;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        /* MOBILE — hide sidebar, show bottom nav */
        @media (max-width: 767px) {
          .sidebar { display: none; }
          .main-area { margin-left: 0; }
          .desktop-footer { display: none; }
          .top-header { padding: 12px 16px; }
          .page-content { padding-bottom: 70px; }
        }

        /* TABLET */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar { width: 200px; }
          .main-area { margin-left: 200px; }
        }

        /* MOBILE BOTTOM NAV */
        .bottom-nav-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top: 1px solid #E0E7EF;
          z-index: 50;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        }
        @media (max-width: 767px) {
          .bottom-nav-bar { display: grid; grid-template-columns: repeat(4, 1fr); }
        }

        /* MOBILE MENU BUTTON — only on mobile */
        .mobile-menu-btn { display: none; }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex; }
        }

        /* PAGE CARD — wraps content nicely on desktop */
        .page-card {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* GRID RESPONSIVE */
        .grid-responsive-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid-responsive-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) {
          .grid-responsive-2 { grid-template-columns: 1fr; }
          .grid-responsive-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="app-layout">
        {/* ── SIDEBAR (desktop) ── */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.2)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 9,
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {user?.pharmacy_name || "Pragya Medical"}
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: 900,
                    margin: 0,
                  }}
                >
                  Pragya Medical
                </p>
              </div>
            </div>
            {/* User chip */}
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "8px 12px",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {user?.name}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    margin: 0,
                  }}
                >
                  Admin
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="sidebar-nav scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const isReminder = item.href === "/reminders";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: "none" }}
                >
                  <div className={`sidebar-nav-item ${active ? "active" : ""}`}>
                    <div
                      style={{
                        color: active ? COLORS.primary : COLORS.textMuted,
                        position: "relative",
                      }}
                    >
                      <item.Icon />
                      {isReminder && urgentCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#C62828",
                            color: "white",
                            fontSize: 8,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid white",
                          }}
                        >
                          {urgentCount > 9 ? "9+" : urgentCount}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        color: active ? COLORS.primary : COLORS.textSecondary,
                      }}
                    >
                      {item.label}
                    </span>
                    {isReminder && urgentCount > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "#FFEBEE",
                          color: "#C62828",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 6,
                        }}
                      >
                        {urgentCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="sidebar-footer">
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                background: "#FFF5F5",
                color: "#C62828",
                border: "1.5px solid #FFCDD2",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <LogoutIcon />
              Sign Out
            </button>
            <p
              style={{
                fontSize: 10,
                color: COLORS.textMuted,
                textAlign: "center",
                margin: "10px 0 0",
              }}
            >
              &copy; {new Date().getFullYear()} Pragya Medical v1.0.0
            </p>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="main-area">
          {/* Top header */}
          <header className="top-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile menu button */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <MenuIcon />
              </button>

              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 11,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {user?.pharmacy_name || "Pragya Medical"}
                </p>
                <h1
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: -0.3,
                  }}
                >
                  {title || "Dashboard"}
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/patients/add">
                <button
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    borderRadius: 10,
                    padding: "7px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <AddIcon />
                  <span style={{ display: isMobile ? "none" : "inline" }}>
                    Add Patient
                  </span>
                </button>
              </Link>
              <Link href="/reminders">
                <button
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    borderRadius: 10,
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <BellIcon />
                  {urgentCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        background: "#EF5350",
                        color: "white",
                        fontSize: 8,
                        fontWeight: 900,
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
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
            </div>
          </header>

          {/* Page content */}
          <main className="page-content scrollbar-hide">
            <div className="page-card">{children}</div>
          </main>

          {/* Desktop footer */}
          <footer className="desktop-footer">
            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: 0,
                fontWeight: 500,
              }}
            >
              &copy; {new Date().getFullYear()} Pragya Medical. All rights
              reserved.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy Policy", "Terms of Use", "Support"].map((link) => (
                <span
                  key={link}
                  style={{
                    fontSize: 12,
                    color: COLORS.textMuted,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = COLORS.primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = COLORS.textMuted)
                  }
                >
                  {link}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}>
              v1.0.0
            </p>
          </footer>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="bottom-nav-bar">
          {BOTTOM_NAV.map((tab) => {
            const active = isActive(tab.href);
            const isReminder = tab.href === "/reminders";
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
                    padding: "10px 0 8px",
                    color: active ? COLORS.primary : COLORS.textMuted,
                    position: "relative",
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 32,
                        height: 3,
                        background: COLORS.primary,
                        borderRadius: "0 0 4px 4px",
                      }}
                    />
                  )}
                  <div style={{ position: "relative", marginBottom: 3 }}>
                    <tab.Icon />
                    {isReminder && urgentCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#EF5350",
                          color: "white",
                          fontSize: 7,
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1.5px solid white",
                        }}
                      >
                        {urgentCount > 9 ? "9+" : urgentCount}
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
          {/* Copyright inside bottom nav on mobile */}
          <div
            style={{
              position: "absolute",
              bottom: -18,
              left: 0,
              right: 0,
              background: "#FAFBFC",
              borderTop: `1px solid ${COLORS.border}`,
              padding: "3px 16px",
              display: "flex",
              justifyContent: "space-between",
            }}
 