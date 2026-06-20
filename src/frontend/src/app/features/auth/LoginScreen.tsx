import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { authApi } from "./authApi";
import AuthIntro from "./AuthIntro";
import type { LoginMode } from "../../types/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { COLORS } from "../../../shared/constants/colors";
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
      className="min-h-screen flex items-center justify-center p-4 md:p-0"
      style={{
        background: COLORS.SURFACE_BG,
        color: COLORS.TEXT_PRIMARY,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <main className="w-full max-w-[1200px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px] shadow-[0_25px_60px_-15px_rgba(27,54,93,0.22),0_15px_30px_-15px_rgba(0,0,0,0.12)] border border-border">
        <AuthIntro />

        <section className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center" style={{ background: COLORS.SURFACE_BG }}>
          <div className="max-w-md mx-auto w-full">
            <header className="mb-10 text-center md:text-left">
              <h3
                className="text-3xl font-semibold tracking-tight mb-2"
                style={{ color: COLORS.NAVY_HEADING }}
              >
                Welcome Back
              </h3>
              <p className="text-base leading-6" style={{ color: COLORS.TEXT_SECONDARY }}>
                Please select your role and sign in to access your dashboard.
              </p>
            </header>

            {/* Role Tabs */}
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as LoginMode);
                setError("");
              }}
              className="mb-8"
            >
              <TabsList className="w-full bg-slate-300/80 border border-slate-300">
                <TabsTrigger
                  value="student"
                  className="flex-1 text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Student Login
                </TabsTrigger>
                <TabsTrigger
                  value="staff"
                  className="flex-1 text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Staff Login
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Google OAuth (disabled for now) */}
            <Button
              variant="outline"
              className="w-full py-6 mb-8 text-sm font-semibold"
              disabled
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              Sign in with University Google Account
            </Button>

            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow h-px bg-border" />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.TEXT_MUTED }}>
                or use credentials
              </span>
              <div className="flex-grow h-px bg-border" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: COLORS.TEXT_PRIMARY }}
                  htmlFor="login-email"
                >
                  {mode === "student" ? "University Email" : "Staff Identification ID"}
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
                  className="h-12 rounded-md"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: COLORS.TEXT_PRIMARY }}
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-bold hover:underline"
                    style={{ color: COLORS.TEAL_DARK }}
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
                    className="h-12 rounded-md pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: COLORS.TEXT_SECONDARY }}
                  >
                    {showPw ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" defaultChecked />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none cursor-pointer select-none"
                  style={{ color: COLORS.TEXT_PRIMARY }}
                >
                  Remember me on this device
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md text-sm font-semibold shadow-md"
                style={{ background: COLORS.TEAL_DARK }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Signing In..." : "Sign In to Portal"}
              </Button>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-sm leading-5" style={{ color: COLORS.TEXT_SECONDARY }}>
                Secured by University IT Services.
                <br />
                <span className="opacity-60">
                  Staff Administration Panel - Data Entry Only access restricted.
                </span>
              </p>
            </footer>
          </div>
        </section>
      </main>

      {/* Background decorations */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full -mr-64 -mt-64 blur-3xl -z-10 opacity-5" style={{ background: COLORS.MINT_ACCENT }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full -ml-48 -mb-48 blur-3xl -z-10 opacity-5" style={{ background: COLORS.BLUE_PRIMARY }} />
    </div>
  );
}