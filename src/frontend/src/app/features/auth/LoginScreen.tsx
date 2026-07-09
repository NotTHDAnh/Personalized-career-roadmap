import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { authApi } from "./authApi";
import AuthIntro from "./AuthIntro";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import type { LoginMode } from "../../types/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showForgot, setShowForgot] = useState(false);

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
        setError("This account is not a student account.");
        return;
      }
      if (
        currentMode === "staff" &&
        !["STAFF", "ADMIN", "MENTOR"].includes(userRole ?? "")
      ) {
        setError("This account is not a staff account.");
        return;
      }

      login(result.accessToken, result.refreshToken, result.user, currentMode);
      navigate(currentMode === "staff" ? "/staff" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login with google failed!");
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

  if (showForgot) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgot(false)} />;
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
            <header className="mb-6 text-center md:text-left">
              <h3 className="text-[28px] font-bold tracking-tight text-[#0F172A] mb-1">
                Welcome Back
              </h3>
              <p className="text-[15px] text-[#64748B]">
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
              className="mb-5"
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

            {/* Google OAuth Container */}
            <div className="w-full mb-8 flex flex-col items-center">
              <div id="google-signin-btn" className="w-full min-h-[44px] flex justify-center" />
              {/* {import.meta.env.DEV && (
                <button
                  id="dev-mock-login-btn"
                  type="button"
                  onClick={handleDevMockLogin}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
                >
                  [Dev Mode] Sign in with Mock Google Account
                </button>
              )} */}
            </div>

            <div className="relative flex items-center gap-4 mb-4 mt-1">
              <div className="flex-grow h-px bg-[#E2E8F0]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                or use email
              </span>
              <div className="flex-grow h-px bg-[#E2E8F0]" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700 shadow-sm animate-in fade-in flex items-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label
                  className="block text-[13px] font-semibold text-[#334155] mb-2"
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
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block text-[13px] font-semibold text-[#334155]"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setError("");
                    }}
                    className="text-[13px] font-semibold text-[#3B28CC] hover:text-[#28189E] transition-colors cursor-pointer"
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



              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 rounded-xl text-[14px] font-semibold text-white bg-[#3B28CC] hover:bg-[#28189E] shadow-[0_4px_14px_0_rgba(59,40,204,0.39)] transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Signing In..." : "Sign In to Portal"}
              </Button>
            </form>
{/* 
            <div className="mt-4 text-center">
              <p className="text-[14px] text-[#64748B]">
                Don't have an account?{" "}
                <button type="button" className="font-semibold text-[#3B28CC] hover:text-[#28189E]:text-[#a5b4fc] transition-colors">
                  Sign up for free
                </button>
              </p>
            </div> */}
          </div>
        </section>
      </main>
    </div>
  );
}