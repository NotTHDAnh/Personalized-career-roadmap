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
      {/* Keep all target effects aligned in the same grid cell. */}
      <div className="relative grid h-16 w-16 place-items-center">
        {/* Filled gold pulse */}
        <div
          aria-hidden="true"
          className="
      pointer-events-none
      col-start-1 row-start-1
      h-14 w-14
      place-self-center
      rounded-full
      animate-ping
    "
          style={{
            backgroundColor: "#F59E0B",
            opacity: 0.42,
            boxShadow: "0 0 18px rgba(245, 158, 11, 0.65)",
            animationDuration: "1.8s",
          }}
        />

        {/* Bright outline pulse */}
        <div
          aria-hidden="true"
          className="
      pointer-events-none
      col-start-1 row-start-1
      h-12 w-12
      place-self-center
      rounded-full
      border-[3px]
      animate-ping
    "
          style={{
            borderColor: "rgba(255, 251, 220, 1)",
            boxShadow:
              "0 0 12px rgba(253, 230, 138, 1), 0 0 24px rgba(245, 158, 11, 0.7)",
            opacity: 0.95,
            animationDuration: "1.8s",
            animationDelay: "0.25s",
          }}
        />

        {/* Main goal icon */}
        <div
          className="
      relative z-10
      col-start-1 row-start-1
      flex h-16 w-16
      place-self-center
      items-center justify-center
      rounded-full
    "
          style={{
            background:
              "linear-gradient(145deg, #FCD34D 0%, #F59E0B 55%, #D97706 100%)",
            border: "3px solid #FDE68A",
            boxShadow:
              "0 0 28px rgba(245,158,11,0.5), 0 6px 18px rgba(0,0,0,0.18)",
          }}
        >
          <Briefcase className="h-7 w-7 text-white" strokeWidth={1.8} />
        </div>
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