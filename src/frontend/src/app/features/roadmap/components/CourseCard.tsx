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

export function CourseCard({ node, onClick }: { node: CourseNode; onClick?: () => void }) {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 relative mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
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