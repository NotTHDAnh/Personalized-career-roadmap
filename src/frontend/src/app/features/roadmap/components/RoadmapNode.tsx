import { Check, Lock } from "lucide-react"

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

export function RoadmapNode({ node }: { node: CourseNode }) {
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