"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiLogin } from "@/lib/api";
import { auth } from "@/lib/auth";
import Toast, { showToast } from "@/components/ui/Toast";
import { COLORS } from "@/lib/theme";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoggedIn()) router.replace("/dashboard");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      auth.setToken(res.data.data.token);
      auth.setUser(res.data.data.user);
      router.push("/dashboard");
    } catch (err) {
      const e = err as any;
      showToast(e.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: `2px solid ${COLORS.border}`, fontSize: 14,
    fontFamily: "Inter, sans-serif", outline: "none", background: "#FAFBFC",
    transition: "border-color 0.2s", boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(145deg, #0D47A1 0%, #1565C0 40%, #1976D2 70%, #0288D1 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 400, background: "white", borderRadius: 28,
        overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
      }}>
        {/* Top brand section */}
        <div style={{
          background: "linear-gradient(145deg, #0D47A1, #1565C0, #1976D2)",
          padding: "40px 32px 32px", textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.35)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>
            <svg viewBox="0 0 48 48" fill="none" width="36" height="36">
              <rect x="8" y="8" width="32" height="32" rx="10" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M24 14v20M14 24h20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Pragya Medical</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "6px 0 0", fontWeight: 500 }}>Patient Reminder & Management System</p>
        </div>

        {/* Form section */}
        <div style={{ padding: "32px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.textPrimary, margin: "0 0 4px" }}>Sign in</h2>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 24px" }}>Enter your credentials to continue</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@pragya.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = COLORS.primary}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = COLORS.primary}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "15px", borderRadius: 14,
                background: loading ? "#90A4AE" : `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
                color: "white", fontSize: 15, fontWeight: 700, border: "none",
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: loading ? "none" : "0 4px 16px rgba(21,101,192,0.4)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`,
            textAlign: "center",
          }}>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0 }}>
              &copy; {new Date().getFullYear()} Pragya Medical. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}