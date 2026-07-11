import { useState } from "react";
import { authApi } from "./authApi";
import AuthIntro from "./AuthIntro";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email);
      setSuccess(res.message || "A new password has been sent to your email.");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while sending the request.");
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
            <header className="mb-6 text-center md:text-left">
              <button
                type="button"
                onClick={onBackToLogin}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] mb-4 transition-colors group cursor-pointer"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to Login
              </button>
              <h3 className="text-[26px] font-bold tracking-tight text-[#0F172A] mb-2">
                Forgot Password?
              </h3>
              <p className="text-[14px] text-[#64748B]">
                Enter your email address and we'll send you a temporary password.
              </p>
            </header>

            {/* Error Placeholder */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700 shadow-sm animate-in fade-in flex items-center">
                {error}
              </div>
            )}

            {/* Success Placeholder */}
            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-700 shadow-sm animate-in fade-in flex items-center">
                {success}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-[12px] font-semibold text-[#334155] mb-1.5"
                  htmlFor="forgot-email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-xl border-[#E2E8F0] bg-[#FAFAFA] text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-1 focus-visible:ring-[#3B28CC] focus-visible:border-[#3B28CC] transition-all pl-10 text-[14px]"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 rounded-xl text-[14px] font-semibold text-white bg-[#3B28CC] hover:bg-[#28189E] shadow-[0_4px_14px_0_rgba(59,40,204,0.39)] transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Sending Request..." : "Reset Password"}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
