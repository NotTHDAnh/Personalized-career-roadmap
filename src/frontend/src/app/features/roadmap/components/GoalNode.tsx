import { Briefcase } from "lucide-react";
import { COLORS } from "@/shared/constants/colors";
import type { RoadmapGoal } from "@/app/types";

export function GoalNode({ goal }: { goal: RoadmapGoal }) {
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