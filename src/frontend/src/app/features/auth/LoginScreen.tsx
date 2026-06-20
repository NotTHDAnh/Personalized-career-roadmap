import { useState, useEffect, useRef } from "react";
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
  const modeRef = useRef<LoginMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Dynamically load Google Identity Services SDK
    if (document.getElementById("google-gsi-client")) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    document.body.appendChild(script);

    function initializeGoogleSignIn() {
      const google = (window as any).google;
      if (!google) return;

      google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1098273645-dummyclientid.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
      });

      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer) {
        btnContainer.innerHTML = "";
        google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: 380,
          text: "signin_with",
          shape: "rectangular",
        });
      }
    }
  }, [mode]);

  async function handleGoogleCredentialResponse(response: any) {
    const idToken = response.credential;
    if (!idToken) return;
    await performGoogleLogin(idToken);
  }

  async function performGoogleLogin(idToken: string) {
    const currentMode = modeRef.current;
    setError("");
    setLoading(true);
    try {
      const result = await authApi.googleLogin(idToken);
      const userRole = result.user.role?.toUpperCase();

      if (currentMode === "student" && userRole !== "STUDENT") {
        setError("Tài khoản Google này không thuộc nhóm tài khoản Student.");
        return;
      }
      if (
        currentMode === "staff" &&
        !["STAFF", "ADMIN", "MENTOR"].includes(userRole ?? "")
      ) {
        setError("Tài khoản Google này không thuộc nhóm tài khoản Staff/Admin/Mentor.");
        return;
      }

      login(result.accessToken, result.refreshToken, result.user, currentMode);
      navigate(currentMode === "staff" ? "/staff" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevMockLogin() {
    const mockEmail = prompt(
      "Nhập Gmail mock để đăng nhập (Hệ thống sẽ chỉ cho phép email tồn tại trong DB):",
      "nguyen.van.an@student.uni.edu"
    );
    if (!mockEmail) return;
    await performGoogleLogin(`mock-google-token-${mockEmail}`);
  }

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

      login(result.accessToken, result.refreshToken, result.user, mode);
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

            {/* Google OAuth Container */}
            <div className="w-full mb-8 flex flex-col items-center">
              <div id="google-signin-btn" className="w-full min-h-[44px] flex justify-center" />
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={handleDevMockLogin}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
                >
                  [Dev Mode] Sign in with Mock Google Account
                </button>
              )}
            </div>

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
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
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