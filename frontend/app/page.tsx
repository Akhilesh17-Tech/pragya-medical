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
      const error = err as { response?: { data?: { error?: string } } };
      showToast(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4fb] flex justify-center items-start p-0 sm:p-5">
      <div className="w-full sm:w-[390px] min-h-screen sm:min-h-[780px] bg-white sm:rounded-[28px] sm:shadow-2xl overflow-hidden flex flex-col">
        <div
          className="flex-1 flex flex-col items-center justify-center px-7 pb-8 pt-12"
          style={{
            background:
              "linear-gradient(160deg,#1a6fc4 0%,#2980d9 60%,#1558a0 100%)",
          }}
        >
          <div className="w-[90px] h-[90px] rounded-full bg-white/15 border-[3px] border-white/30 flex items-center justify-center text-[42px] mb-4">
            🏥
          </div>
          <h1 className="text-white text-[22px] font-extrabold mb-1">
            Pragya Medical
          </h1>
          <p className="text-white/75 text-[13px] mb-8">
            Patient Reminder System
          </p>

          <div className="bg-white rounded-[20px] p-7 w-full shadow-2xl">
            <h2 className="text-[18px] font-bold text-[#2c3e50] text-center mb-5">
              Welcome Back
            </h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#7f8c8d] uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pragya.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#dce6f0] text-[14px] outline-none focus:border-[#1a6fc4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7f8c8d] uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#dce6f0] text-[14px] outline-none focus:border-[#1a6fc4] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1a6fc4] hover:bg-[#155a9e] text-white rounded-xl font-bold text-[15px] transition-colors disabled:opacity-60 mt-1 cursor-pointer"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}
