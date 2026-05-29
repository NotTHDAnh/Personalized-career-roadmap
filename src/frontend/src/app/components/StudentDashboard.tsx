import { useState } from "react";
import { GraduationCap, Bot, Map, TrendingUp, LogOut } from "lucide-react";
import ProfileTranscripts from "./tabs/ProfileTranscripts";
import AIMentor from "./tabs/AIMentor";
import MyRoadmaps from "./tabs/MyRoadmaps";
import JobMarketTrends from "./tabs/JobMarketTrends";

type Tab = "profile" | "mentor" | "roadmaps" | "trends";

interface Props {
  onLogout: () => void;
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile & Transcripts", icon: GraduationCap },
  { id: "mentor", label: "AI Virtual Mentor", icon: Bot },
  { id: "roadmaps", label: "My Roadmaps", icon: Map },
  { id: "trends", label: "Job Market Trends", icon: TrendingUp },
];

const BLUE = "#1B365D";

export default function StudentDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F1F5F9" }}>
      {/* ─── Sidebar ─── */}
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{ background: BLUE }}
      >
        {/* Brand Header — strictly static, text only */}
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span
            className="text-white"
            style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3 }}
          >
            Smart Career Roadmap
          </span>
        </div>

        {/* Navigation — exactly 4 items */}
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="w-full flex items-center gap-3 px-6 py-3.5 text-left text-sm transition-colors"
              style={
                activeTab === id
                  ? {
                      background: "rgba(255,255,255,0.14)",
                      color: "#fff",
                      borderRight: "3px solid #0D9488",
                    }
                  : {
                      color: "rgba(255,255,255,0.65)",
                      borderRight: "3px solid transparent",
                    }
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === "profile" && <ProfileTranscripts />}
        {activeTab === "mentor" && <AIMentor />}
        {activeTab === "roadmaps" && <MyRoadmaps />}
        {activeTab === "trends" && <JobMarketTrends />}
      </main>
    </div>
  );
}
