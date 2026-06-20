import { Check, Lock } from "lucide-react";

import { COLORS } from "@/shared/constants/colors";
import type { CourseNode } from "@/app/types";

export function RoadmapNode({ node }: { node: CourseNode }) {
  const pctX = (node.cx / 1100) * 100;
  const pctY = (node.cy / 200) * 100;

  const bg =
    node.state === "done"
      ? COLORS.GREEN_DONE
      : node.state === "active"
        ? COLORS.BLUE_PRIMARY
        : COLORS.LOCKED_BG;

  const border =
    node.state === "done"
      ? COLORS.GREEN_DONE_BORDER
      : node.state === "active"
        ? COLORS.TEAL_ACCENT
        : COLORS.LOCKED_BORDER;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${pctX}%`,
        top: `${pctY}%`,
        transform: "translate(-50%,-50%)",
        zIndex: 10,
      }}
    >
      {/* Keep the active pulse centered independently from the label below. */}
      <div className="relative flex h-11 w-11 items-center justify-center">
        {node.state === "active" && (
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0 m-auto
              h-10 w-10
              rounded-full
              animate-ping  
            "
            style={{
              backgroundColor: COLORS.TEAL_ACCENT,
              opacity: 0.3,
            }}
          />
        )}

        <div
          className="
            relative z-10
            flex h-11 w-11
            items-center justify-center
            rounded-full shadow-md
          "
          style={{
            background: bg,
            border: `3px solid ${border}`,
          }}
        >
          {node.state === "done" && (
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          )}

          {node.state === "active" && (
            <span
              style={{
                // Improve text contrast on the dark active node.
                color: "#E6FFFB",
                fontSize: "0.6rem",
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {node.shortLabel.split("\n")[0]}
            </span>
          )}

          {node.state === "locked" && (
            <Lock className="h-4 w-4 text-white opacity-70" />
          )}
        </div>
      </div>

      {/* Keep the label outside the pulse wrapper. */}
      <div
        className="mt-1 whitespace-nowrap text-center"
        style={{
          fontSize: "0.58rem",
          fontWeight: 600,
          color:
            node.state === "locked"
              ? COLORS.LOCKED_BORDER
              : "#1E293B",
        }}
      >
        {node.shortLabel.split("\n")[0]}
      </div>
    </div>
  );
}