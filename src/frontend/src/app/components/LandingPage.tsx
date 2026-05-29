import { useState } from "react";
import { BookOpen, Target, BarChart2, Users, Check, Mail, Lock } from "lucide-react";

type Role = "student" | "staff";

interface Props {
  onStudentLogin: () => void;
  onStaffLogin: () => void;
}

const BLUE = "#1B365D";
const TEAL = "#0D9488";

export default function LandingPage({ onStudentLogin, onStaffLogin }: Props) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student") onStudentLogin();
    else onStaffLogin();
  };

  const handleGoogle = () => {
    if (role === "student") onStudentLogin();
    else onStaffLogin();
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4f8" }}>
      {/* ─── Hero Left ─── */}
      <div
        className="flex-1 flex flex-col justify-center px-16 py-16"
        style={{ background: BLUE }}
      >
        <div className="max-w-lg">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: TEAL }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              University Internal Portal
            </span>
          </div>

          <h1
            className="text-white mb-6 leading-tight"
            style={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            Smart Career &amp; Learning Roadmap
          </h1>

          <p className="text-lg mb-12" style={{ color: "#93C5FD" }}>
            An intelligent internal platform to track academic progress, explore
            AI-guided career paths, and stay aligned with the job market.
          </p>

          <ul className="space-y-5">
            {[
              { icon: Target, text: "Personalised AI-powered career roadmaps" },
              { icon: BookOpen, text: "Complete academic transcript management" },
              { icon: BarChart2, text: "Real-time job market trend insights" },
              { icon: Users, text: "Seamless staff data management tools" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(13,148,136,0.15)",
                    border: "1px solid rgba(13,148,136,0.4)",
                  }}
                >
                  <Check className="w-4 h-4" style={{ color: TEAL }} />
                </div>
                <span style={{ color: "#BFDBFE" }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* Bottom tagline */}
          <div
            className="mt-14 pt-8 border-t"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              For authorised university personnel only · Managed by IT
              Administration
            </p>
          </div>
        </div>
      </div>

      {/* ─── Login Right ─── */}
      <div className="w-[480px] flex items-center justify-center bg-white p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2
              className="text-gray-900 mb-2"
              style={{ fontSize: "1.6rem", fontWeight: 700 }}
            >
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500">
              Access your university portal account
            </p>
          </div>

          {/* Role Tabs */}
          <div
            className="flex rounded-xl overflow-hidden border mb-8"
            style={{ borderColor: "#E2E8F0" }}
          >
            {(["student", "staff"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-3 text-sm transition-colors"
                style={
                  role === r
                    ? { background: BLUE, color: "#fff" }
                    : { background: "#fff", color: "#64748B" }
                }
              >
                {r === "student" ? "Student Login" : "Staff Login"}
              </button>
            ))}
          </div>

          {/* Google SSO */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-6"
            style={{ borderColor: "#E2E8F0" }}
          >
            {/* Google-coloured G icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with University Google Account
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{
                    borderColor: "#E2E8F0",
                    background: "#F8FAFC",
                    // @ts-ignore
                    "--tw-ring-color": BLUE,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm mt-2 transition-opacity hover:opacity-90"
              style={{ background: BLUE }}
            >
              {role === "student" ? "Sign in as Student" : "Sign in as Staff"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Internal access only · Contact IT support for login issues
          </p>
        </div>
      </div>
    </div>
  );
}
