"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { COLORS } from "@/lib/theme";
import Toast from "@/components/ui/Toast";

// Icons as SVG components
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
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
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const NAV_TABS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/patients/add", label: "Add", Icon: AddIcon },
  { href: "/reminders", label: "Reminders", Icon: BellIcon },
  { href: "/patients", label: "Patients", Icon: UsersIcon },
];

const MENU_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "All Patients" },
  { href: "/reminders", label: "Reminders" },
  { href: "/invoices", label: "Invoices" },
  { href: "/inventory", label: "Inventory" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

interface Props {
  children: React.ReactNode;
  title?: string;
  urgentCount?: number;
  hideHeader?: boolean;
}

export default function AppShell({
  children,
  title,
  urgentCount = 0,
  hideHeader,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const user = auth.getUser();

  const handleLogout = () => {
    setDrawerOpen(false);
    if (confirm("Are you sure you want to logout?")) auth.logout();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bgPage,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          minHeight: "100vh",
          background: COLORS.bgCard,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* ── HEADER ── */}
        {!hideHeader && (
          <header
            style={{
              background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #1976D2 100%)`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              position: "relative",
              zIndex: 10,
              boxShadow: "0 2px 12px rgba(21,101,192,0.4)",
            }}
          >
            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                    fontSize: 10,
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {user?.pharmacy_name || "Pragya Medical"}
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: 15,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: -0.3,
                  }}
                >
                  {title || "Dashboard"}
                </p>
              </div>
            </div>

            {/* Right side actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/patients/add">
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
                    transition: "all 0.15s",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="18"
                    height="18"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
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
              <button
                onClick={() => setDrawerOpen(true)}
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
                }}
              >
                <MenuIcon />
              </button>
            </div>
          </header>
        )}

        {/* ── MAIN CONTENT ── */}
        <main
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          className="scrollbar-hide"
        >
          {children}
        </main>

        {/* ── BOTTOM NAV ── */}
        <nav
          style={{
            background: "white",
            borderTop: `1px solid ${COLORS.border}`,
            flexShrink: 0,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {NAV_TABS.map((tab) => {
              const isActive =
                tab.href === "/patients/add"
                  ? path === tab.href
                  : path.startsWith(tab.href);
              const isReminder = tab.href === "/reminders";
              return (
                <Link key={tab.href} href={tab.href}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 0 6px",
                      cursor: "pointer",
                      color: isActive ? COLORS.primary : COLORS.textMuted,
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                  >
                    {isActive && (
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
                            background: "#EF5350",
                            color: "white",
                            fontSize: 7,
                            fontWeight: 900,
                            borderRadius: "50%",
                            width: 14,
                            height: 14,
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
                        fontSize: 10,
                        fontWeight: isActive ? 700 : 500,
                        lineHeight: 1,
                      }}
                    >
                      {tab.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Copyright */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#FAFBFC",
            }}
          >
            <p
              style={{
                fontSize: 9,
                color: COLORS.textMuted,
                margin: 0,
                fontWeight: 500,
              }}
            >
              &copy; {new Date().getFullYear()} Pragya Medical. All rights
              reserved.
            </p>
            <p style={{ fontSize: 9, color: COLORS.textMuted, margin: 0 }}>
              v1.0.0
            </p>
          </div>
        </nav>

        {/* ── DRAWER MENU ── */}
        {drawerOpen && (
          <>
            {/* Overlay */}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 50,
                backdropFilter: "blur(2px)",
              }}
            />
            {/* Drawer */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "75%",
                maxWidth: 300,
                background: "white",
                zIndex: 51,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-8px 0 32px rgba(0,0,0,0.2)",
                animation: "slideUp 0.2s ease",
              }}
            >
              {/* Drawer header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                  padding: "20px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.2)",
                        border: "2px solid rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 900,
                        color: "white",
                        marginBottom: 10,
                      }}
                    >
                      {user?.name?.charAt(0) || "A"}
                    </div>
                    <p
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {user?.name || "Admin"}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 11,
                        margin: "2px 0 0",
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 9,
                      margin: "0 0 2px",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Pharmacy
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {user?.pharmacy_name || "Pragya Medical"}
                  </p>
                </div>
              </div>

              {/* Menu links */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: COLORS.textMuted,
                    padding: "8px 16px 4px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Navigation
                </p>
                {MENU_LINKS.map((link) => {
                  const isActive = path.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        onClick={() => setDrawerOpen(false)}
                        style={{
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          background: isActive
                            ? COLORS.primaryLight
                            : "transparent",
                          borderRight: isActive
                            ? `3px solid ${COLORS.primary}`
                            : "3px solid transparent",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isActive
                              ? COLORS.primary
                              : COLORS.border,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: isActive ? 700 : 500,
                            color: isActive
                              ? COLORS.primary
                              : COLORS.textPrimary,
                          }}
                        >
                          {link.label}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              color: COLORS.primary,
                              fontWeight: 700,
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Drawer footer */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#FFF5F5",
                    border: "1.5px solid #FFCDD2",
                    color: "#C62828",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
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
            </div>
          </>
        )}

        <Toast />
      </div>
    </div>
  );
}
