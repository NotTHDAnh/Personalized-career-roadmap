import { useState } from "react";
import { Check, Lock, ChevronDown, Pencil, Save, Trash2, Briefcase, X } from "lucide-react";
import { GoalNode } from "./components/GoalNode";
import { RoadmapNode } from "./components/RoadmapNode";
import { CourseCard } from "./components/CourseCard";
import { CourseNode } from "../data/sharedNodes";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

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
  { label: "ZONE: MONTH 2", sub: "Core Skills · Active",   textColor: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "ZONE: MONTH 3", sub: "Advanced · Upcoming",    textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
  { label: "ZONE: MONTH 4", sub: "Specialisation · Upcoming", textColor: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" },
];

export default function MyRoadmaps({ 
  courseNodes, 
  updateCourseNode 
}: { 
  courseNodes: CourseNode[]; 
  updateCourseNode: (id: number, updates: Partial<CourseNode>) => void 
}) {
  const [selected, setSelected] = useState("Backend Developer Path");
  // Find selected node in courseNodes to keep state synced
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const selectedNode = courseNodes.find(n => n.id === selectedNodeId) || null;

  const roadmaps = Object.keys(ROADMAP_GOALS);
  const goal = ROADMAP_GOALS[selected];

  const byZone = (z: number) => courseNodes.filter((n) => n.zone === z);

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
            <div className="relative" style={{ height: "320px", background: "#FAFBFC" }}>
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
              {courseNodes.map((node) => <RoadmapNode key={node.id} node={node} onClick={() => setSelectedNodeId(selectedNode?.id === node.id ? null : node.id)} />)}

              {/* Career target node — anchored to right edge */}
              <GoalNode goal={goal} />

              {/* Info Tooltip */}
              {selectedNode && (
                <div 
                  className="absolute z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-64 animate-in fade-in zoom-in-95 duration-200"
                  style={{ 
                    left: `${(selectedNode.cx / 1100) * 100}%`, 
                    ...(selectedNode.cy > 100 
                        ? { bottom: `calc(${100 - (selectedNode.cy / 200) * 100}% + 35px)` }
                        : { top: `calc(${(selectedNode.cy / 200) * 100}% + 35px)` }
                    ),
                    transform: selectedNode.cx < 200 ? "translateX(-15%)" : selectedNode.cx > 900 ? "translateX(-85%)" : "translateX(-50%)" 
                  }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(null); }}
                    className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {/* Arrow */}
                  <div 
                    className="absolute w-3 h-3 bg-white transform rotate-45"
                    style={{
                      left: selectedNode.cx < 200 ? "15%" : selectedNode.cx > 900 ? "85%" : "50%",
                      marginLeft: "-6px",
                      ...(selectedNode.cy > 100 
                          ? { bottom: "-6.5px", borderBottomWidth: "1px", borderRightWidth: "1px", borderColor: "#E5E7EB" } 
                          : { top: "-6.5px", borderTopWidth: "1px", borderLeftWidth: "1px", borderColor: "#E5E7EB" }
                      )
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: selectedNode.state === 'done' ? '#22C55E' : selectedNode.state === 'active' ? TEAL : '#94A3B8' }} />
                      <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">{selectedNode.code}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-[0.85rem] leading-tight mb-2 pr-2">{selectedNode.name}</h4>
                    
                    <div className="space-y-1.5 text-[0.7rem] text-gray-600 mb-2.5">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1"><span className="text-[0.65rem]">⏱️</span> {selectedNode.duration}</span>
                        <span className="flex items-center gap-1"><span className="text-[0.65rem]">🏫</span> {selectedNode.source === "university" ? "University" : "External"}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="font-medium text-gray-400">Prereq:</span>
                        <span className="truncate text-gray-700 font-medium">{selectedNode.prerequisite}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedNode.skills.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded-md text-[0.6rem] font-semibold" style={{ background: "#F1F5F9", color: "#475569" }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isDone = selectedNode.state === "done";
                        const newState = isDone ? "active" : "done";
                        
                        updateCourseNode(selectedNode.id, { 
                          state: newState, 
                          gpa: newState === "done" ? "4.0" : "" 
                        });
                      }}
                      className="w-full py-1.5 rounded-lg text-xs font-bold transition-colors border"
                      style={
                        selectedNode.state === "done" 
                          ? { background: "white", color: "#DC2626", borderColor: "#FECACA" } // Unfinished style (red)
                          : { background: "#22C55E", color: "white", borderColor: "#16A34A" }  // Finished style (green)
                      }
                    >
                      {selectedNode.state === "done" ? "Mark as Unfinished" : "Mark as Finished"}
                    </button>
                  </div>
                </div>
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
          {[1, 2, 3, 4].map((z) => (
            <div key={z} className="p-3">
              {byZone(z).map((n) => <CourseCard key={n.id} node={n} onClick={() => setSelectedNodeId(selectedNode?.id === n.id ? null : n.id)} />)}
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
