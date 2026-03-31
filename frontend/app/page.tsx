"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiLogin } from "@/lib/api";
import { auth } from "@/lib/auth";
import Toast, { showToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoggedIn()) router.replace("/dashboard");
    else setTimeout(() => setShow(true), 50);
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
      showToast(e.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start">
      <div
        className="w-full max-w-[430px] min-h-screen flex flex-col bg-white"
        style={{ boxShadow: "0 0 40px rgba(0,0,0,0.12)" }}
      >
        {/* Top blue section */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 pb-8 pt-16"
          style={{
            background:
              "linear-gradient(145deg, #0f4c8a 0%, #1a6fc4 50%, #2185d9 100%)",
          }}
        >
          {/* Logo */}
          <div
            className={`transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div
              className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-5 mx-auto border border-white/30"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            >
              <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="12"
                  fill="white"
                  fillOpacity="0.2"
                />
                <path
                  d="M24 12v24M12 24h24"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="24" r="6" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-black text-center tracking-tight mb-1">
              Pragya Medical
            </h1>
            <p className="text-white/60 text-sm text-center font-medium">
              Patient Reminder System
            </p>
          </div>

          {/* Card */}
          <div
            className={`w-full mt-10 transition-all duration-700 delay-150 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div
              className="bg-white rounded-3xl p-6"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            >
              <h2 className="text-xl font-black text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-400 mb-6 font-medium">
                Sign in to your account
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pragya.com"
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm font-medium outline-none focus:border-[#1a6fc4] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm font-medium outline-none focus:border-[#1a6fc4] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all mt-2 disabled:opacity-60 active:scale-[0.98]"
                  style={{
                    background: loading
                      ? "#999"
                      : "linear-gradient(135deg, #1a6fc4, #2185d9)",
                    boxShadow: "0 4px 20px rgba(26,111,196,0.4)",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Pragya Medical &copy; 2025. All rights reserved.
          </p>
        </div>
      </div>
      <Toast />
    </div>
  );
}
