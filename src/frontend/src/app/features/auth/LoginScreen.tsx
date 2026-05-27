import React, { useState } from "react";

import {
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

import { authApi, LoginUser } from "./authApi";

export type LoginMode = "student" | "staff";

type LoginScreenProps = {
  onLogin: (user: LoginUser, mode: LoginMode) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<LoginMode>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await authApi.login({
        email,
        password,
      });

      const userRole = result.user.role?.toUpperCase();
      if (mode === "student" && userRole !== "STUDENT") {
      setError("This account is not a student account.");
      return;
      }

      if (
        mode === "staff" &&
        userRole !== "STAFF"
      ) {
        setError("This account is not a staff/admin account.");
        return;
      }

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      localStorage.setItem("loginMode", mode);

      onLogin(result.user, mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <div
        className="hidden lg:flex lg:w-[58%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: "#1B365D" }}
      >
        <div
          className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full"
          style={{ backgroundColor: "rgba(13,148,136,0.13)" }}
        />
        <div
          className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full"
          style={{ backgroundColor: "rgba(13,148,136,0.08)" }}
        />
        <div
          className="absolute top-1/3 right-12 w-52 h-52 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        />

        <div className="flex items-center gap-3 z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#0D9488" }}
          >
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-tight tracking-tight">
              Smart Career Roadmap
            </p>
            <p className="text-blue-300 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              University Academic Portal
            </p>
          </div>
        </div>

        <div className="z-10 space-y-11">
          <div>
            <p
              className="text-xs font-bold tracking-[0.22em] uppercase mb-5"
              style={{ color: "#0D9488", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Academic Intelligence Platform
            </p>
            <h1 className="text-[3.2rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
              Smart Career &<br />Learning Roadmap
            </h1>
            <p className="text-blue-200 text-base leading-relaxed max-w-lg">
              Navigate your academic journey with intelligence. Align every
              course you take with real-world career outcomes.
            </p>
          </div>

          <div className="space-y-7">
            {[
              {
                n: "01",
                title: "Track Your Academic Progress",
                desc: "Monitor GPA, completed courses, and prerequisite status in real time.",
              },
              {
                n: "02",
                title: "Discover Personalized Career Roadmaps",
                desc: "Visual skill trees and learning paths tailored to your target role.",
              },
              {
                n: "03",
                title: "Consult with our AI Virtual Mentor",
                desc: "Get personalized academic and career guidance, available 24/7.",
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-4 items-start">
                <span
                  className="font-black text-xs mt-0.5 w-5 shrink-0"
                  style={{ color: "#0D9488", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.n}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-blue-300 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-blue-500 text-xs z-10"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          © 2024 University Career & Academic Development Office
        </p>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: "#F1F5F9" }}
      >
        <div className="w-full max-w-[22rem]">
          <div className="flex items-center gap-2 mb-7 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1B365D" }}
            >
              <GraduationCap className="text-white" size={17} />
            </div>
            <span className="font-bold text-sm" style={{ color: "#1B365D" }}>
              Smart Career Roadmap
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
            <div
              className="flex p-1 rounded-xl mb-7"
              style={{ backgroundColor: "#F1F5F9" }}
            >
              {(["student", "staff"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    mode === m
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {m === "student" ? "Student" : "Staff / Admin"}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2
                className="text-xl font-extrabold tracking-tight"
                style={{ color: "#1B365D" }}
              >
                Welcome back
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {mode === "student"
                  ? "Sign in with your University Gmail account"
                  : "Staff Administration Portal — authorized access only"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                  University Gmail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === "student"
                      ? "student.id@student.uni.edu"
                      : "staff.name@university.edu"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white transition-all pr-10 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: "#1B365D" }}
                />
                <label htmlFor="remember" className="text-xs text-slate-500 font-medium">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                style={{ backgroundColor: "#0D9488" }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Access issues? Contact{" "}
                <span className="font-semibold text-slate-600">
                  it-support@university.edu
                </span>
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5 leading-relaxed">
            Secure internal system. Accounts are provisioned by university staff only.
            <br />
            No self-registration is available.
          </p>
        </div>
      </div>
    </div>
  );
}