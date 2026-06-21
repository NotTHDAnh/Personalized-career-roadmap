import { useState, useEffect } from "react";
import { Check, Lock, ChevronDown, Pencil, Save, Trash2, Briefcase } from "lucide-react";
import { GoalNode } from "./components/GoalNode";
import { RoadmapNode } from "./components/RoadmapNode";
import { CourseCard } from "./components/CourseCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ErrorAlert } from "@/app/components/common/ErrorAlert";

import { COLORS } from "@/shared/constants/colors";
import type { NodeState, CourseNode } from "@/app/types";

import { useMemo } from "react";
import { RoadmapCanvas } from "./components/RoadmapCanvas";
import { MOCK_ROADMAP_DTO } from "./core/mockData";
import { mapDtoToGraph } from "./core/roadmapAdapter";
import { PhaseBasedLayoutEngine } from "./core/phaseBasedEngine";

// const NODES: CourseNode[] = [
//   // ── Zone 1: Foundation (Done) ──
//   {
//     id: 1,
//     name: "Introduction to Computer Science (CS101)",
//     code: "CS101",
//     shortLabel: "CS101",
//     state: "done",
//     zone: 1,
//     source: "university",
//     duration: "8 Weeks",
//     prerequisite: "None",
//     skills: ["#Logic", "#Syntax", "#ComputerScience"],
//     cx: 75,
//     cy: 100,
//   },
//   {
//     id: 2,
//     name: "Web Foundations (Coursera)",
//     code: "Coursera",
//     shortLabel: "Web\nFound.",
//     state: "done",
//     zone: 1,
//     source: "external",
//     duration: "4 Weeks",
//     prerequisite: "CS101",
//     skills: ["#HTML", "#CSS", "#WebDesign"],
//     cx: 165,
//     cy: 55,
//   },
//   {
//     id: 3,
//     name: "Programming Fundamentals (PR101)",
//     code: "PR101",
//     shortLabel: "PR101",
//     state: "done",
//     zone: 1,
//     source: "university",
//     duration: "8 Weeks",
//     prerequisite: "CS101",
//     skills: ["#Variables", "#ControlFlow", "#Functions"],
//     cx: 248,
//     cy: 118,
//   },
//   // ── Zone 2: Core Skills (Active) ──
//   {
//     id: 4,
//     name: "Data Structures & Algorithms (DSA201)",
//     code: "DSA201",
//     shortLabel: "DSA201",
//     state: "active",
//     zone: 2,
//     source: "university",
//     duration: "10 Weeks",
//     prerequisite: "PR101",
//     skills: ["#DataStructures", "#Algorithms", "#Efficiency"],
//     cx: 365,
//     cy: 78,
//   },
//   {
//     id: 5,
//     name: "Database Management Systems (DB202)",
//     code: "DB202",
//     shortLabel: "DB202",
//     state: "active",
//     zone: 2,
//     source: "university",
//     duration: "6 Weeks",
//     prerequisite: "PR101",
//     skills: ["#SQL", "#Schema", "#Databases"],
//     cx: 488,
//     cy: 128,
//   },
//   // ── Zone 3: Advanced (Locked) ──
//   {
//     id: 6,
//     name: "Advanced Java Programming (JA301)",
//     code: "JA301",
//     shortLabel: "JA301",
//     state: "locked",
//     zone: 3,
//     source: "university",
//     duration: "8 Weeks",
//     prerequisite: "DSA201",
//     skills: ["#OOP", "#Backend", "#Java"],
//     cx: 622,
//     cy: 72,
//   },
//   {
//     id: 7,
//     name: "RESTful API Design (Coursera)",
//     code: "Coursera",
//     shortLabel: "API\nDesign",
//     state: "locked",
//     zone: 3,
//     source: "external",
//     duration: "4 Weeks",
//     prerequisite: "JA301",
//     skills: ["#RESTful_API", "#HTTP", "#JSON"],
//     cx: 742,
//     cy: 128,
//   },
//   // ── Zone 4: Specialisation (Locked) ──
//   {
//     id: 8,
//     name: "Microservices Architecture (MSA401)",
//     code: "MSA401",
//     shortLabel: "MSA401",
//     state: "locked",
//     zone: 4,
//     source: "university",
//     duration: "6 Weeks",
//     prerequisite: "RESTful API Design",
//     skills: ["#Microservices", "#Docker", "#Distributed"],
//     cx: 885,
//     cy: 80,
//   },
//   {
//     id: 9,
//     name: "Cloud Fundamentals — AWS (Coursera)",
//     code: "Coursera",
//     shortLabel: "AWS\nCloud",
//     state: "locked",
//     zone: 4,
//     source: "external",
//     duration: "6 Weeks",
//     prerequisite: "MSA401",
//     skills: ["#AWS_Cloud", "#CloudComputing", "#Serverless"],
//     cx: 1000,
//     cy: 90,   // raised for smoother path to goal
//   },
// ];

const ROADMAP_GOALS: Record<string, { title: string; subtitle: string }> = {
  "Backend Developer Path": {
    title: "Backend Developer",
    subtitle: "Java · APIs · Cloud",
  },
  "Full-Stack Engineer Path": {
    title: "Full-Stack Engineer",
    subtitle: "React · Node · DB",
  },
  "Data Engineering Path": {
    title: "Data Engineer",
    subtitle: "Python · SQL · Cloud",
  },
};

/* ─────────────────────────────────────── */

const ZONES = [
  { label: "ZONE: MONTH 1", sub: "Foundation · Completed", textColor: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  { label: "ZONE: MONTH 2", sub: "Core Skills · Active", textColor: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "ZONE: MONTH 3", sub: "Advanced · Upcoming", textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  { label: "ZONE: MONTH 4", sub: "Specialisation · Upcoming", textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
];

export default function MyRoadmaps() {
  const [selected, setSelected] = useState("Backend Developer Path");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null); // State chứa dữ liệu thật

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5087/api/Roadmap/rm-001") //mã định danh này chưa có chốt được
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy Roadmap trong Database");
        return res.json();
      })
      .then(data => {
        setRoadmapData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi gọi API, đang dùng tạm Mock Data:", err);
        setRoadmapData(MOCK_ROADMAP_DTO);
        setLoading(false);
      });
  }, [selected]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const roadmaps = Object.keys(ROADMAP_GOALS);
  const goal = ROADMAP_GOALS[selected];

  // 1. Chạy Layout Engine để chuyển DTO thành Graph có tọa độ
  const computedGraph = useMemo(() => {
    if (!roadmapData) return null; // Ngăn lỗi sập ứng dụng
    const graph = mapDtoToGraph(roadmapData);
    const engine = new PhaseBasedLayoutEngine();
    return engine.layout(graph);
  }, [roadmapData]);

  // const byZone = (z: number) => NODES.filter((n) => n.zone === z);

  if (error) {
    return (
      <div className="p-8 min-h-full" style={{ background: "#F1F5F9" }}>
        <ErrorAlert title="Roadmap Load Error" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-full" style={{ background: "#F1F5F9" }}>

      {/* ── Section 1: Management Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
            Select Active Roadmap
          </label>
          <div className="relative">
            {loading ? (
              <Skeleton className="h-9 w-44 rounded-lg" />
            ) : (
              <>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="appearance-none pr-8 pl-3 py-2 rounded-lg border text-sm text-gray-800 focus:outline-none cursor-pointer"
                  style={{ borderColor: "#E2E8F0", background: "#F8FAFC", fontWeight: 500 }}
                >
                  {roadmaps.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-gray-50 transition-colors" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity" style={{ background: COLORS.TEAL_ACCENT }}>
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-red-50 transition-colors" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <span className="text-xs text-blue-700" style={{ fontWeight: 600 }}>⏳ Remaining Study Time</span>
          {loading ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full text-white" style={{ background: COLORS.BLUE_PRIMARY, fontWeight: 600 }}>~24 Weeks</span>
          )}
        </div>
      </div>

      {/* ── Section 2: Duolingo Map (horizontally scrollable) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: "1280px" }}>

            {/* Zone label header — scrolls with the map */}
            <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9" }}>
              {ZONES.map(({ label, textColor, bg, border: bdr }, i) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    textAlign: "center",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    background: bg,
                    color: textColor,
                    borderLeft: i > 0 ? `1px solid ${bdr}` : undefined,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Map canvas — taller to give goal card room below its circle */}
            {/* Map canvas — taller to give goal card room below its circle */}
            <div className="relative" style={{ height: "280px", background: "#FAFBFC" }}>
              {(loading || !computedGraph) ? (
                <div className="absolute inset-0 flex items-center justify-around px-12">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <Skeleton className="w-16 h-3 rounded" />
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-3 ml-auto pr-10">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className="w-24 h-12 rounded-xl" />
                  </div>
                </div>
              ) : (
                <RoadmapCanvas graph={computedGraph} goal={goal} zones={ZONES} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Chronological Timeline ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Timeline column headers */}
        <div className="grid grid-cols-4 border-b border-gray-100">
          {ZONES.map(({ sub, textColor, bg, border: bdr }, i) => (
            <div
              key={i}
              className="px-4 py-3"
              style={{ background: bg, borderLeft: i > 0 ? `1px solid ${bdr}` : undefined }}
            >
              <p className="text-xs uppercase tracking-wider" style={{ color: textColor, fontWeight: 700 }}>
                Month {i + 1}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{sub.split(" · ")[1]}</p>
            </div>
          ))}
        </div>

        {/* Course card stacks */}
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {[0, 1, 2, 3].map((z) => (
            <div key={z} className="p-3">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  {computedGraph && computedGraph.nodes.filter((n) => n.zone === z).map((n) => <CourseCard key={n.id} node={n.data as any} />)}
                  {/* Career Target card in Month 4 column */}
                  {z === 3 && (
                    <div
                      className="rounded-xl border p-3.5 mt-1"
                      style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", border: "1.5px solid #FDE68A" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#F59E0B" }}>
                          <Briefcase className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs uppercase tracking-wider" style={{ color: "#92400E", fontWeight: 700, fontSize: "0.6rem" }}>
                          Career Target
                        </span>
                      </div>
                      <p className="text-sm" style={{ fontWeight: 700, color: "#78350F" }}>{goal.title}</p>
                      <p className="text-xs text-amber-600 mt-0.5">{goal.subtitle}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
