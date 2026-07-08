import { useState } from "react";
import { COLORS } from "@/shared/constants/colors";
import type { CourseNode } from "@/app/types";
import { CheckCircle2 } from "lucide-react";

export function CourseCard({ node }: { node: CourseNode }) {
  const isCompleted = node.state === "done";
  const [showAllSkills, setShowAllSkills] = useState(false);

  const displayedSkills = showAllSkills ? node.skills : node.skills?.slice(0, 2);
  const hiddenSkillsCount = node.skills ? node.skills.length - 2 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-3.5 relative transition-shadow hover:shadow-md flex flex-col gap-2.5 mb-3 border border-gray-100">
      {/* Required Badge */}
      {node.prerequisite && node.prerequisite !== "Không có" && node.prerequisite !== "None" && (
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
            style={{ background: COLORS.AMBER_BG, color: COLORS.AMBER_TEXT, border: `1px solid ${COLORS.AMBER_BORDER}` }}
          >
            ⭐ Required
          </span>
        </div>
      )}

      {/* Header: Course Code and Status */}
      <div className="flex justify-between items-start gap-2 pr-14">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {node.code !== "N/A" ? node.code : "Course"}
            </span>
          </div>
          <h4 className="text-[13px] font-semibold text-gray-800 leading-tight">
            {node.name}
          </h4>
        </div>
      </div>

      {/* Details: Credits, Hours (Removed Level) */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {node.credits && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
            📚 {node.credits} Credits
          </span>
        )}
        {node.totalStudyHours && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
            ⏱️ {node.totalStudyHours} Hrs
          </span>
        )}
      </div>

      {/* Skills / Learning Outcomes */}
      {node.skills && node.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-50 mt-0.5">
          {displayedSkills.map((s, idx) => (
            <span 
              key={`${s}-${idx}`} 
              className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200"
            >
              {s}
            </span>
          ))}
          {!showAllSkills && hiddenSkillsCount > 0 && (
            <button 
              onClick={() => setShowAllSkills(true)}
              className="px-1.5 py-0.5 rounded-full bg-gray-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-[10px] font-medium border border-blue-200 cursor-pointer transition-colors"
            >
              Show more skills
            </button>
          )}
          {showAllSkills && hiddenSkillsCount > 0 && (
            <button 
              onClick={() => setShowAllSkills(false)}
              className="px-1.5 py-0.5 rounded-full bg-gray-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-[10px] font-medium border border-blue-200 cursor-pointer transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
