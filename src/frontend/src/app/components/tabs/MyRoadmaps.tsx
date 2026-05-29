import { useState } from "react";
import { Check, Lock, ChevronDown, Pencil, Save, Trash2, Briefcase } from "lucide-react";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

type NodeState = "done" | "active" | "locked";

interface CourseNode {
  id: number;
  name: string;
  code: string;
  shortLabel: string;
  state: NodeState;
  zone: 1 | 2 | 3 | 4;
  source: "university" | "external";
  duration: string;
  prerequisite: string;
  skills: string[];
  // SVG coords (viewBox 0 0 1100 200)
  cx: number;
  cy: number;
}

const NODES: CourseNode[] = [
  // ── Zone 1: Foundation (Done) ──
  {
    id: 1,
    name: "Introduction to Computer Science (CS101)",
    code: "CS101",
    shortLabel: "CS101",
    state: "done",
    zone: 1,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "None",
    skills: ["#Logic", "#Syntax", "#ComputerScience"],
    cx: 75,
    cy: 100,
  },
  {
    id: 2,
    name: "Web Foundations (Coursera)",
    code: "Coursera",
    shortLabel: "Web\nFound.",
    state: "done",
    zone: 1,
    source: "external",
    duration: "4 Weeks",
    prerequisite: "CS101",
    skills: ["#HTML", "#CSS", "#WebDesign"],
    cx: 165,
    cy: 55,
  },
  {
    id: 3,
    name: "Programming Fundamentals (PR101)",
    code: "PR101",
    shortLabel: "PR101",
    state: "done",
    zone: 1,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "CS101",
    skills: ["#Variables", "#ControlFlow", "#Functions"],
    cx: 248,
    cy: 118,
  },
  // ── Zone 2: Core Skills (Active) ──
  {
    id: 4,
    name: "Data Structures & Algorithms (DSA201)",
    code: "DSA201",
    shortLabel: "DSA201",
    state: "active",
    zone: 2,
    source: "university",
    duration: "10 Weeks",
    prerequisite: "PR101",
    skills: ["#DataStructures", "#Algorithms", "#Efficiency"],
    cx: 365,
    cy: 78,
  },
  {
    id: 5,
    name: "Database Management Systems (DB202)",
    code: "DB202",
    shortLabel: "DB202",
    state: "active",
    zone: 2,
    source: "university",
    duration: "6 Weeks",
    prerequisite: "PR101",
    skills: ["#SQL", "#Schema", "#Databases"],
    cx: 488,
    cy: 128,
  },
  // ── Zone 3: Advanced (Locked) ──
  {
    id: 6,
    name: "Advanced Java Programming (JA301)",
    code: "JA301",
    shortLabel: "JA301",
    state: "locked",
    zone: 3,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "DSA201",
    skills: ["#OOP", "#Backend", "#Java"],
    cx: 622,
    cy: 72,
  },
  {
    id: 7,
    name: "RESTful API Design (Coursera)",
    code: "Coursera",
    shortLabel: "API\nDesign",
    state: "locked",
    zone: 3,
    source: "external",
    duration: "4 Weeks",
    prerequisite: "JA301",
    skills: ["#RESTful_API", "#HTTP", "#JSON"],
    cx: 742,
    cy: 128,
  },
  // ── Zone 4: Specialisation (Locked) ──
  {
    id: 8,
    name: "Microservices Architecture (MSA401)",
    code: "MSA401",
    shortLabel: "MSA401",
    state: "locked",
    zone: 4,
    source: "university",
    duration: "6 Weeks",
    prerequisite: "RESTful API Design",
    skills: ["#Microservices", "#Docker", "#Distributed"],
    cx: 885,
    cy: 80,
  },
  {
    id: 9,
    name: "Cloud Fundamentals — AWS (Coursera)",
    code: "Coursera",
    shortLabel: "AWS\nCloud",
    state: "locked",
    zone: 4,
    source: "external",
    duration: "6 Weeks",
    prerequisite: "MSA401",
    skills: ["#AWS_Cloud", "#CloudComputing", "#Serverless"],
    cx: 1000,
    cy: 90,   // raised for smoother path to goal
  },
];

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

function RoadmapNode({ node }: { node: CourseNode }) {
  const pctX = (node.cx / 1100) * 100;
  const pctY = (node.cy / 200) * 100;

  const bg =
    node.state === "done" ? "#22C55E" : node.state === "active" ? BLUE : "#CBD5E1";
  const border =
    node.state === "done" ? "#16A34A" : node.state === "active" ? TEAL : "#94A3B8";

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${pctX}%`, top: `${pctY}%`, transform: "translate(-50%,-50%)", zIndex: 10 }}
    >
      {node.state === "active" && (
        <div
          className="absolute rounded-full animate-ping"
          style={{ width: 56, height: 56, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: TEAL, opacity: 0.22 }}
        />
      )}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
        style={{ background: bg, border: `3px solid ${border}` }}
      >
        {node.state === "done" && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
        {node.state === "active" && (
          <span style={{ color: TEAL, fontSize: "0.6rem", fontWeight: 700, textAlign: "center", lineHeight: 1.1 }}>
            {node.shortLabel.split("\n")[0]}
          </span>
        )}
        {node.state === "locked" && <Lock className="w-4 h-4 text-white opacity-70" />}
      </div>
      <div
        className="mt-1 whitespace-nowrap text-center"
        style={{ fontSize: "0.58rem", fontWeight: 600, color: node.state === "locked" ? "#94A3B8" : "#1E293B" }}
      >
        {node.shortLabel.split("\n")[0]}
      </div>
    </div>
  );
}

function GoalNode({ goal }: { goal: { title: string; subtitle: string } }) {
  /* Anchored to right edge of canvas so the card always has breathing room */
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ right: "72px", top: "38%", transform: "translateY(-50%)", zIndex: 10 }}
    >
      {/* — ambient glow layer — */}
      <div
        className="absolute rounded-full"
        style={{
          width: 96, height: 96,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: 76, height: 76,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          border: "2px solid rgba(253,230,138,0.75)",
          pointerEvents: "none",
        }}
      />

      {/* — main gold circle — */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(145deg, #FCD34D 0%, #F59E0B 55%, #D97706 100%)",
          border: "3px solid #FDE68A",
          boxShadow: "0 0 28px rgba(245,158,11,0.5), 0 6px 18px rgba(0,0,0,0.18)",
        }}
      >
        <Briefcase className="w-7 h-7 text-white" strokeWidth={1.8} />
      </div>

      {/* — connector — */}
      <div style={{ width: 2, height: 10, background: "linear-gradient(to bottom, #FDE68A, #F59E0B)", marginTop: 3, marginBottom: 3, borderRadius: 2 }} />

      {/* — career target card — */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{
          minWidth: 148,
          border: "2px solid #FDE68A",
          boxShadow: "0 6px 24px rgba(245,158,11,0.28), 0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {/* amber header bar */}
        <div
          className="px-4 py-2 flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}
        >
          <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff", letterSpacing: "0.09em" }}>
            🎯 CAREER TARGET
          </span>
        </div>

        {/* body */}
        <div
          className="px-4 pt-3 pb-3.5 text-center"
          style={{ background: "linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 100%)" }}
        >
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#78350F", lineHeight: 1.2 }}>
            {goal.title}
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {goal.subtitle.split(" · ").map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #F59E0B, #D97706)",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ node }: { node: CourseNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 relative mb-3">
      <div className="absolute top-2.5 right-2.5">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", fontWeight: 500, fontSize: "0.65rem" }}
        >
          ⭐ Required
        </span>
      </div>
      <div className="text-xs mb-1.5" style={{ color: node.source === "university" ? "#1D4ED8" : "#0369A1", fontSize: "0.68rem" }}>
        {node.source === "university" ? "🏫 University Course" : "🌐 External Platform"}
      </div>
      <p className="text-gray-800 mb-2.5 pr-20 leading-snug" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
        {node.name}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-lg" style={{ background: "#F1F5F9", color: "#475569", fontSize: "0.65rem" }}>
          ⏱️ {node.duration}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-lg" style={{ background: "#F1F5F9", color: "#475569", fontSize: "0.65rem" }}>
          🔗 Prereq: {node.prerequisite}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.skills.map((s) => (
          <span key={s} className="px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", fontSize: "0.62rem" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── */

const ZONES = [
  { label: "ZONE: MONTH 1", sub: "Foundation · Completed", textColor: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  { label: "ZONE: MONTH 2", sub: "Core Skills · Active",   textColor: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "ZONE: MONTH 3", sub: "Advanced · Upcoming",    textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  { label: "ZONE: MONTH 4", sub: "Specialisation · Upcoming", textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
];

export default function MyRoadmaps() {
  const [selected, setSelected] = useState("Backend Developer Path");

  const roadmaps = Object.keys(ROADMAP_GOALS);
  const goal = ROADMAP_GOALS[selected];

  const byZone = (z: number) => NODES.filter((n) => n.zone === z);

  return (
    <div className="p-8 space-y-6 min-h-full" style={{ background: "#F1F5F9" }}>

      {/* ── Section 1: Management Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
            Select Active Roadmap
          </label>
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="appearance-none pr-8 pl-3 py-2 rounded-lg border text-sm text-gray-800 focus:outline-none cursor-pointer"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC", fontWeight: 500 }}
            >
              {roadmaps.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-gray-50 transition-colors" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity" style={{ background: TEAL }}>
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-red-50 transition-colors" style={{ borderColor: "#FCA5A5", color: "#DC2626" }}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <span className="text-xs text-blue-700" style={{ fontWeight: 600 }}>⏳ Remaining Study Time</span>
          <span className="text-xs px-2.5 py-1 rounded-full text-white" style={{ background: BLUE, fontWeight: 600 }}>~24 Weeks</span>
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
            <div className="relative" style={{ height: "280px", background: "#FAFBFC" }}>
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1100 200"
                preserveAspectRatio="none"
              >
                {/* Zone shading */}
                <rect x="0"   y="0" width="275" height="200" fill="#F0FDF4" opacity="0.55" />
                <rect x="275" y="0" width="275" height="200" fill="#EFF6FF" opacity="0.45" />
                <rect x="550" y="0" width="275" height="200" fill="#F8FAFC" opacity="0.7"  />
                <rect x="825" y="0" width="275" height="200" fill="#F8FAFC" opacity="0.7"  />

                {/* Zone separators */}
                {[275, 550, 825].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="5,4" />
                ))}

                {/* Solid teal path — Zones 1–2 (done + active) */}
                <path
                  d="M 20 100
                     C 48 100 62 100 75 100
                     C 112 100 142 55 165 55
                     C 196 55 228 118 248 118
                     C 283 118 330 78 365 78
                     C 412 78 457 128 488 128
                     C 522 128 548 108 550 108"
                  fill="none"
                  stroke={TEAL}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dashed gray path — Zones 3–4 → goal (node 9 cy adjusted to 90) */}
                <path
                  d="M 550 108
                     C 578 108 600 72 622 72
                     C 665 72 710 128 742 128
                     C 790 128 848 80 885 80
                     C 932 80 968 90 1000 90
                     C 1025 90 1042 76 1055 76"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="10,6"
                />
              </svg>

              {/* Course nodes */}
              {NODES.map((node) => <RoadmapNode key={node.id} node={node} />)}

              {/* Career target node — anchored to right edge */}
              <GoalNode goal={goal} />
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
          {[1, 2, 3, 4].map((z) => (
            <div key={z} className="p-3">
              {byZone(z).map((n) => <CourseCard key={n.id} node={n} />)}
              {/* Career Target card in Month 4 column */}
              {z === 4 && (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
