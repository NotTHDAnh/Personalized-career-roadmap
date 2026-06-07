import { useState } from "react";
import AuthIntro from "./AuthIntro";
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
      const result = await authApi.login({ email, password });
      const userRole = result.user.role?.toUpperCase();
      if (mode === "student" && userRole !== "STUDENT") {
        setError("This account is not a student account.");
        return;
      }
      if (mode === "staff" && userRole !== "STAFF") {
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-0 bg-[#f8f9ff] text-[#0b1c30]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <main className="w-full max-w-[1200px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px] shadow-md border border-[#c4c6cf]">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        <AuthIntro />
        <section className="md:w-1/2 bg-[#f8f9ff] p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <header className="mb-10 text-center md:text-left">
              <h3 className="text-3xl font-semibold tracking-tight text-[#002046] mb-2">Welcome Back</h3>
              <p className="text-base leading-6 text-[#44474e]">Please select your role and sign in to access your dashboard.</p>
            </header>
            <div className="flex bg-[#eff4ff] p-1 rounded-lg mb-8" role="tablist">
              <button type="button" aria-selected={mode === "student"} onClick={() => { setMode("student"); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === "student" ? "bg-white text-[#002046] shadow-sm" : "text-[#44474e] hover:text-[#002046]"}`}>Student Login</button>
              <button type="button" aria-selected={mode === "staff"} onClick={() => { setMode("staff"); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === "staff" ? "bg-white text-[#002046] shadow-sm" : "text-[#44474e] hover:text-[#002046]"}`}>Staff Login</button>
            </div>
            <button type="button" className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border border-[#c4c6cf] rounded-xl text-sm font-semibold text-[#002046] hover:bg-[#eff4ff] transition-colors duration-200 mb-8 active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Sign in with University Google Account
            </button>
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow h-px bg-[#c4c6cf]" /><span className="text-xs font-bold text-[#74777f] uppercase tracking-widest">or use credentials</span><div className="flex-grow h-px bg-[#c4c6cf]" />
            </div>
            {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-[#0b1c30] mb-2" htmlFor="email">{mode === "student" ? "University Email" : "Staff Identification ID"}</label>
                <input className="w-full px-4 py-3 bg-white border border-[#c4c6cf] rounded-xl focus:ring-2 focus:ring-[#006b5f] focus:border-[#006b5f] outline-none transition-all placeholder:text-[#44474e]/40 text-base" id="email" placeholder={mode === "student" ? "name@university.edu" : "staff.name@university.edu"} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-[#0b1c30]" htmlFor="password">Password</label>
                  <button type="button" className="text-xs font-bold text-[#006b5f] hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input className="w-full px-4 py-3 pr-12 bg-white border border-[#c4c6cf] rounded-xl focus:ring-2 focus:ring-[#006b5f] focus:border-[#006b5f] outline-none transition-all placeholder:text-[#44474e]/40 text-base" id="password" placeholder="••••••••" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#44474e] hover:text-[#002046]">
                    <span className="material-symbols-outlined text-[20px]">{password ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#44474e]"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-[#c4c6cf]" /> Remember me on this device</label>
              <button className="w-full py-4 bg-[#006b5f] text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Signing In..." : "Sign In to Portal"}</button>
            </form>
            <footer className="mt-12 text-center">
              <p className="text-sm leading-5 text-[#44474e]">Secured by University IT Services.<br /><span className="opacity-60">Staff Administration Panel - Data Entry Only access restricted.</span></p>
            </footer>
          </div>
        </section>
      </main>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#71f8e4]/5 rounded-full -mr-64 -mt-64 blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#1b365d]/5 rounded-full -ml-48 -mb-48 blur-3xl -z-10" />
    </div>
  );
}