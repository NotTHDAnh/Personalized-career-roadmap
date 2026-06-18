import { Check, Lock } from "lucide-react";

import { COLORS } from "@/shared/constants/colors";
import type { CourseNode } from "@/app/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { useCourseContext } from "@/app/data/CourseContext";

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
          className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110 duration-200"
          style={{ left: `${pctX}%`, top: `${pctY}%`, transform: "translate(-50%,-50%)", zIndex: 10 }}
        >
          {node.state === "active" && (
            <div
              className="absolute rounded-full animate-ping"
              style={{ width: 56, height: 56, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.TEAL_ACCENT, opacity: 0.22 }}
            />
          )}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
            style={{ background: bg, border: `3px solid ${border}` }}
          >
            {node.state === "done" && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            {node.state === "active" && (
              <span style={{ color: COLORS.TEAL_ACCENT, fontSize: "0.6rem", fontWeight: 700, textAlign: "center", lineHeight: 1.1 }}>
                {node.shortLabel.split("\n")[0]}
              </span>
            )}
            {node.state === "locked" && <Lock className="w-4 h-4 text-white opacity-70" />}
          </div>
          <div
            className="mt-1 whitespace-nowrap text-center"
            style={{ fontSize: "0.58rem", fontWeight: 600, color: node.state === "locked" ? COLORS.LOCKED_BORDER : "#1E293B" }}
          >
            {node.shortLabel.split("\n")[0]}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-72 p-4 text-sm" align="center" sideOffset={8}>
        <div className="font-semibold text-base mb-1">{node.name}</div>
        <div className="text-gray-500 text-xs mb-4">{node.code} • {node.duration}</div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-500 font-medium">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
              node.state === 'done' ? 'bg-green-100 text-green-700' : 
              node.state === 'active' ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {node.state}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-500 font-medium">Source</span>
            <span className="capitalize text-gray-700 font-medium text-xs">{node.source}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-500 font-medium">Prerequisite</span>
            <span className="text-gray-700 font-medium text-xs">{node.prerequisite}</span>
          </div>
          <div className="pt-1">
            <span className="text-gray-500 font-medium block mb-2">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {node.skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t pt-3">
          {node.state === "done" ? (
            <Button 
              variant="outline" 
              className="w-full text-xs h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => updateNodeState(node.id, "active")}
            >
              Mark as Unfinished
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => updateNodeState(node.id, "done")}
            >
              Mark as Finished
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}