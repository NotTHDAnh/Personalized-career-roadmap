import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { authApi } from "./authApi";
import AuthIntro from "./AuthIntro";
import type { LoginMode } from "../../types/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<LoginMode>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

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
      if (
        mode === "staff" &&
        !["STAFF", "ADMIN", "MENTOR"].includes(userRole ?? "")
      ) {
        setError("This account is not a staff/admin account.");
        return;
      }

      login(result.accessToken, result.user, mode);
      navigate(mode === "staff" ? "/staff" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#F4F7F9] transition-colors duration-300"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <main className="w-full max-w-[1200px] bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl transition-colors duration-300">
        <AuthIntro />

        <section className="flex-1 p-6 md:px-16 lg:px-20 md:py-8 flex flex-col justify-center bg-white transition-colors duration-300">
          <div className="max-w-[440px] mx-auto w-full">
            <header className="mb-4 text-center md:text-left">
              <h3 className="text-[26px] font-bold tracking-tight text-[#0F172A] mb-1">
                Welcome Back
              </h3>
              <p className="text-[14px] text-[#64748B]">
                Please sign in to access your dashboard.
              </p>
            </header>

            {/* Role Tabs */}
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as LoginMode);
                setError("");
              }}
              className="mb-4"
            >
              <TabsList className="relative flex w-full bg-[#F1F5F9] border border-[#E2E8F0] p-1.5 rounded-xl h-auto transition-colors">
                <div
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out z-0"
                  style={{
                    transform: mode === "student" ? "translateX(0)" : "translateX(100%)",
                    left: "0.375rem",
                  }}
                />
                <TabsTrigger
                  value="student"
                  className="relative z-10 flex-1 text-[13px] font-semibold text-[#64748B] data-[state=active]:text-[#0F172A]=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-lg py-2 transition-all"
                >
                  Student Login
                </TabsTrigger>
                <TabsTrigger
                  value="staff"
                  className="relative z-10 flex-1 text-[13px] font-semibold text-[#64748B] data-[state=active]:text-[#0F172A]=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-lg py-2 transition-all"
                >
                  Staff Login
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Google OAuth (disabled for now) */}
            <Button
              variant="outline"
              className="w-full h-10 mb-3 text-[13px] font-semibold text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]:bg-slate-900 shadow-sm rounded-xl transition-colors"
              disabled
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative flex items-center gap-4 mb-3">
              <div className="flex-grow h-px bg-[#E2E8F0]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                or use email
              </span>
              <div className="flex-grow h-px bg-[#E2E8F0]" />
            </div>

            {/* Error Placeholder to prevent layout shift */}
            <div className="h-[42px] mb-3 w-full">
              {error && (
                <div className="h-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700 shadow-sm animate-in fade-in flex items-center">
                  {error}
                </div>
              )}
            </div>

            {/* Form */}
            <form className="space-y-2.5" onSubmit={handleLogin}>
              <div>
                <label
                  className="block text-[12px] font-semibold text-[#334155] mb-1.5"
                  htmlFor="login-email"
                >
                  {mode === "student" ? "Email Address" : "Staff Identification ID"}
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={
                    mode === "student"
                      ? "name@university.edu"
                      : "staff.name@university.edu"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl border-[#E2E8F0] bg-[#FAFAFA] text-[#0F172A] placeholder:text-[#94A3B8]:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#3B28CC]:ring-[#6366f1] focus-visible:border-[#3B28CC] transition-all text-[14px]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="block text-[12px] font-semibold text-[#334155]"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[13px] font-semibold text-[#3B28CC] hover:text-[#28189E]:text-[#a5b4fc] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-xl border-[#E2E8F0] bg-[#FAFAFA] text-[#0F172A] placeholder:text-[#94A3B8]:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#3B28CC]:ring-[#6366f1] focus-visible:border-[#3B28CC] transition-all pr-10 text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]:text-slate-300 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-1 pb-1">
                <Checkbox id="remember-me" defaultChecked className="rounded border-[#CBD5E1] text-[#3B28CC] focus:ring-[#3B28CC]" />
                <label
                  htmlFor="remember-me"
                  className="text-[14px] font-medium leading-none cursor-pointer select-none text-[#475569]"
                >
                  Remember me on this device
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 rounded-xl text-[14px] font-semibold text-white bg-[#3B28CC] hover:bg-[#28189E]:bg-[#4f46e5] shadow-[0_4px_14px_0_rgba(59,40,204,0.39)] transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Signing In..." : "Sign In to Portal"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-[14px] text-[#64748B]">
                Don't have an account?{" "}
                <button type="button" className="font-semibold text-[#3B28CC] hover:text-[#28189E]:text-[#a5b4fc] transition-colors">
                  Sign up for free
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}