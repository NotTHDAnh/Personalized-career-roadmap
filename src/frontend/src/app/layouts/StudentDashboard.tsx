import React, { useState, useRef, useEffect } from "react";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import type { DashTab } from "../types";
import { ProfileTab } from "../features/profile/ProfileTab";
import { RoadmapTab } from "../features/roadmap/RoadmapTab";
import { MentorTab } from "../features/mentor/MentorTab";

export function StudentDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<DashTab>("profile");

  const navItems: { id: DashTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "profile", label: "Profile & Transcripts", icon: <BookOpen size={17} />, desc: "GPA · Courses · Status" },
    { id: "roadmap", label: "My Career Roadmap", icon: <Map size={17} />, desc: "Skill trees · Paths" },
    { id: "mentor", label: "AI Virtual Mentor", icon: <MessageCircle size={17} />, desc: "Chat · Guidance" },
  ];

  const tabTitles: Record<DashTab, { title: string; sub: string }> = {
    profile: { title: "Profile & Transcripts", sub: "Manage your academic record and course GPA" },
    roadmap: { title: "My Career Roadmap", sub: "Visualize your learning path toward your target career" },
    mentor: { title: "AI Virtual Mentor", sub: "Get personalized guidance from your AI academic advisor" },
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Manrope', 'Inter', sans-serif", backgroundColor: "#F1F5F9" }}
    >
      {/* ── Sidebar ── */}
      <div
        className="w-64 flex flex-col h-full border-r border-slate-200 shrink-0"
        style={{ backgroundColor: "#1B365D" }}
      >
        {/* Branding */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#0D9488" }}
            >
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-xs leading-tight tracking-tight">
                Smart Career Roadmap
              </p>
              <p
                className="text-blue-300 text-[9px]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Student Portal
              </p>
            </div>
          </div>
        </div>

        {/* Student avatar */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0"
              style={{ backgroundColor: "#0D9488" }}
            >
              NA
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-xs truncate">Nguyen Van An</p>
              <p
                className="text-blue-300 text-[9px] truncate"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                20210001 · Year 2
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p
            className="px-2 mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-400"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Navigation
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
                tab === item.id
                  ? "text-white"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}
              style={tab === item.id ? { backgroundColor: "rgba(13,148,136,0.3)" } : {}}
            >
              <div
                className={`mt-0.5 shrink-0 ${
                  tab === item.id ? "text-teal-300" : "text-blue-400 group-hover:text-blue-200"
                }`}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{item.label}</p>
                <p
                  className={`text-[10px] mt-0.5 ${tab === item.id ? "text-teal-200" : "text-blue-400"}`}
                >
                  {item.desc}
                </p>
              </div>
              {tab === item.id && (
                <ChevronRight size={13} className="ml-auto mt-0.5 text-teal-300 shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-blue-300 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-7 py-4 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-extrabold text-base tracking-tight" style={{ color: "#1B365D" }}>
              {tabTitles[tab].title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{tabTitles[tab].sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all relative">
              <Bell size={15} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
            </button>
            <div
              className="flex items-center gap-2 pl-3 border-l border-slate-200"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white"
                style={{ backgroundColor: "#0D9488" }}
              >
                NA
              </div>
              <span className="text-xs font-bold text-slate-600 hidden sm:block">
                Nguyen Van An
              </span>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {tab === "profile" && <ProfileTab />}
          {tab === "roadmap" && <RoadmapTab />}
          {tab === "mentor" && <MentorTab />}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 3: STAFF PANEL ───────────────────────────────────────────────────
