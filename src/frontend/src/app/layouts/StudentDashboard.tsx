import React, { useState, useRef, useEffect } from "react";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import type { DashTab } from "../types";
import ProfileTab from "../features/profile/ProfileTab";
import RoadmapTab from "../features/roadmap/RoadmapTab";
import { MentorTab } from "../features/mentor/MentorTab";
import { INITIAL_NODES, CourseNode } from "../data/sharedNodes";

export function StudentDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<DashTab>("profile");
  const [courseNodes, setCourseNodes] = useState<CourseNode[]>(INITIAL_NODES);

  function updateCourseNode(id: number, updates: Partial<CourseNode>) {
    setCourseNodes(prevNodes => {
      let nextNodes = [...prevNodes];
      
      const targetIndex = nextNodes.findIndex(n => n.id === id);
      if (targetIndex === -1) return prevNodes;
      
      const oldState = nextNodes[targetIndex].state;
      nextNodes[targetIndex] = { ...nextNodes[targetIndex], ...updates };
      const newState = nextNodes[targetIndex].state;
      
      if (oldState !== newState) {
        if (newState === "done") {
          const node = nextNodes[targetIndex];
          const prereqKeys = [node.code, node.name, node.shortLabel.replace("\n", " ")];
          
          nextNodes = nextNodes.map(n => {
            if (n.state === "locked" && prereqKeys.some(key => n.prerequisite.includes(key))) {
              return { ...n, state: "active" };
            }
            return n;
          });
        } else if (newState === "active" || newState === "locked") {
          let changed = true;
          const lockedKeys = new Set([
            nextNodes[targetIndex].code, 
            nextNodes[targetIndex].name, 
            nextNodes[targetIndex].shortLabel.replace("\n", " ")
          ]);
          
          while (changed) {
            changed = false;
            nextNodes = nextNodes.map(n => {
              if (n.state !== "locked" && Array.from(lockedKeys).some(key => n.prerequisite.includes(key))) {
                lockedKeys.add(n.code);
                lockedKeys.add(n.name);
                lockedKeys.add(n.shortLabel.replace("\n", " "));
                changed = true;
                return { ...n, state: "locked", gpa: "" };
              }
              return n;
            });
          }
        }
      }
      return nextNodes;
    });
  }
  const currentUser = localStorage.getItem("currentUser");
  const student = currentUser?JSON.parse(currentUser):"Student";

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
      className="ml-[280px] w-[calc(100vw-280px)] min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#1b365d] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#71f8e4] text-3xl">
              school
            </span>
            <div>
              <h1 className="font-bold leading-tight">Smart Career Roadmap</h1>
              <p className="text-xs text-white/60">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id
                ? "bg-[#006b5f] text-white shadow"
                : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006b5f] text-white flex items-center justify-center font-bold">
             {student?.fullName.trim().split(/\s+/).at(-1)?.[0].toUpperCase()} 
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">
                {student?.fullName || "Student"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#6df5e1] font-bold">
                {student?.role || "None"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 w-full flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 w-full">
        <header className="h-20 bg-white border-b border-[#c4c6cf] px-6 md:px-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#74777f]">
              Student Dashboard
            </p>
            <h2 className="text-xl font-bold text-[#002046]">
              {navItems.find((item) => item.id === tab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden rounded-xl border border-[#c4c6cf] px-3 py-2 text-sm font-semibold"
              onClick={() => {
                const nextIndex =
                  (navItems.findIndex((item) => item.id === tab) + 1) %
                  navItems.length;
                setTab(navItems[nextIndex].id);
              }}
            >
              Next Tab
            </button>

            <button className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#002046]">
                notifications
              </span>
            </button>

            <div className="w-10 h-10 rounded-full bg-[#006b5f] text-white flex items-center justify-center font-bold">
             {student?.fullName.trim().split(/\s+/).at(-1)?.[0].toUpperCase()} 
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10">
          {tab === "profile" && <ProfileTab courseNodes={courseNodes} updateCourseNode={updateCourseNode} />}
          {tab === "roadmap" && <RoadmapTab courseNodes={courseNodes} updateCourseNode={updateCourseNode} />}
          {tab === "mentor" && <MentorTab />}
          {/* {activeTab === "market" && <StitchMarketTrendsTab />} */}
        </div>
      </main>
    </div>
  );
}

// ─── SCREEN 3: STAFF PANEL ───────────────────────────────────────────────────
