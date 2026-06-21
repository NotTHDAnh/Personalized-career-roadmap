import { Check, Lock, CalendarDays, GraduationCap, Clock, BookOpen, Target } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { useCourseContext } from "@/app/data/CourseContext";

import { COLORS } from "@/shared/constants/colors";
import type { CourseNode } from "@/app/types";

export function RoadmapNode({ node }: { node: CourseNode }) {
  const { updateNodeState } = useCourseContext();

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
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="absolute flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
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
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden shadow-xl border border-gray-100 rounded-xl" side="right" align="center" sideOffset={8}>
        {/* Header */}
        <div className="px-5 py-4 text-white relative" style={{ background: bg }}>
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-90 px-2 py-0.5 rounded-full bg-white/20">
                {node.code}
              </span>
              {node.academicLevel && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/30 text-white flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {node.academicLevel}
                </span>
              )}
            </div>
            <h3 className="font-bold text-[16px] leading-snug">
              {node.name}
            </h3>
            {node.state === "done" && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-md w-fit font-medium">
                <Check className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" /> Duration
              </span>
              <span className="font-medium text-gray-800">{node.duration}</span>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <CalendarDays className="w-3.5 h-3.5" /> Deadline
              </span>
              <span className="font-medium text-gray-800">
                {node.deadline ? new Date(node.deadline).toLocaleDateString("vi-VN") : "Flexible"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" /> Prerequisite
              </span>
              <span className="font-medium text-gray-800">{node.prerequisite}</span>
            </div>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5" /> Core Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {node.skills && node.skills.length > 0 ? (
                node.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-[11px] font-semibold">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No skills listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
          {node.state === "active" ? (
            <Button
              className="w-full font-bold shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: COLORS.TEAL_ACCENT, color: "white" }}
              onClick={() => updateNodeState(node.id.toString(), "done")}
            >
              Mark as Finished
            </Button>
          ) : node.state === "done" ? (
            <Button
              variant="outline"
              className="w-full font-semibold border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => updateNodeState(node.id.toString(), "active")}
            >
              Mark as Unfinished
            </Button>
          ) : (
            <div className="w-full text-center py-2 text-xs font-medium text-gray-400 border border-dashed border-gray-200 rounded-md bg-white">
              Complete prerequisites to unlock
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}