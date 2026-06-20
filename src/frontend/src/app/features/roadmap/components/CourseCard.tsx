import { COLORS } from "@/shared/constants/colors";
import type { CourseNode } from "@/app/types";

export function CourseCard({ node }: { node: CourseNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 relative mb-3">
      <div className="absolute top-2.5 right-2.5">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: COLORS.AMBER_BG, color: COLORS.AMBER_TEXT, border: `1px solid ${COLORS.AMBER_BORDER}`, fontWeight: 500, fontSize: "0.65rem" }}
        >
          ⭐ Required
        </span>
      </div>
      <div className="text-xs mb-1.5" style={{ color: node.source === "university" ? COLORS.BLUE_BADGE_TEXT : "#0369A1", fontSize: "0.68rem" }}>
        {node.source === "university" ? "🏫 University Course" : "🌐 External Platform"}
      </div>
      <p className="text-gray-800 mb-2.5 pr-20 leading-snug" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
        {node.name}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-lg" style={{ background: COLORS.SURFACE_BG, color: COLORS.TEXT_SECONDARY, fontSize: "0.65rem" }}>
          ⏱️ {node.duration}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-lg" style={{ background: COLORS.SURFACE_BG, color: COLORS.TEXT_SECONDARY, fontSize: "0.65rem" }}>
          🔗 Prereq: {node.prerequisite}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.skills.map((s) => (
          <span key={s} className="px-1.5 py-0.5 rounded-full" style={{ background: COLORS.BLUE_BADGE_BG, color: COLORS.BLUE_BADGE_TEXT, border: `1px solid ${COLORS.BLUE_BADGE_BORDER}`, fontSize: "0.62rem" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}