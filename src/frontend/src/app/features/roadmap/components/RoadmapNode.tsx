import { Check, Lock, CalendarDays, GraduationCap, Clock, BookOpen, Target, Book } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import React, { useState } from "react";
import { useCourseContext } from "@/app/data/CourseContext";
import type { CourseNode } from "@/app/types";

// Vibrant phase colors matching the image
const ZONE_STYLES: Record<number, { core: string, aura: string, text: string }> = {
  0: { core: "#4CAF50", aura: "rgba(76, 175, 80, 0.2)", text: "#1B5E20" },
  1: { core: "#3B82F6", aura: "rgba(59, 130, 246, 0.2)", text: "#0D47A1" },
  2: { core: "#8B5CF6", aura: "rgba(139, 92, 246, 0.2)", text: "#4A148C" },
};

export function RoadmapNode({ node, canvasWidth }: { node: CourseNode, canvasWidth?: number }) {
  const { updateNodeState } = useCourseContext();
  const [open, setOpen] = useState(false);
  const [gpa, setGpa] = useState(node.gpa ? node.gpa.toString() : "");
  const [gpaError, setGpaError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleValidateAndConfirm = () => {
    const num = parseFloat(gpa);
    if (isNaN(num) || num < 5 || num > 10) {
      setGpaError("GPA must be between 5 and 10.");
    } else {
      setGpaError("");
      setShowConfirm(true);
    }
  };

  const cWidth = canvasWidth || 1280;
  const pctX = (node.cx / cWidth) * 100;
  const pctY = (node.cy / 160) * 100;

  const style = ZONE_STYLES[node.zone % 3] || ZONE_STYLES[0];
  const isDone = node.state === "done" || node.state === "COMPLETED" as any;
  const isActive = node.state === "active" || node.state === "PENDING" as any;
  const isLocked = node.state === "locked";
  const isCurrent = isActive;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="absolute flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{
            left: `${pctX}%`,
            top: `${pctY}%`,
            transform: "translate(-50%,-50%)",
            zIndex: isCurrent ? 30 : 10,
          }}
        >
          {/* Current Floating Pill */}
          {isCurrent && (
            <div 
              className="absolute -top-9 px-3 py-1 rounded-full text-[11px] font-extrabold text-white shadow-md animate-bounce" 
              style={{ background: style.core, boxShadow: `0 4px 12px ${style.aura}` }}
            >
              Current
              <div 
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent" 
                style={{ borderTopColor: style.core }}
              />
            </div>
          )}

          {/* Node Multi-layer Glassmorphism Circle */}
          <div className="relative flex items-center justify-center">
            {/* Spreading pulse animation */}
            <div 
              className="absolute rounded-full animate-ping"
              style={{
                width: "36px",
                height: "36px",
                background: style.core,
                opacity: 0.25,
                animationDuration: "2.5s"
              }}
            />
            {/* Layer 1: Aura (soft large colored ring) */}
            <div 
              className="absolute rounded-full animate-ping"
              style={{
                width: "44px",
                height: "44px",
                background: style.core,
                opacity: 0.25,
                animationDuration: "2.5s"
              }}
            />
            
            {/* Layer 2: White Border with Drop Shadow */}
            <div
              className="absolute rounded-full bg-white flex items-center justify-center"
              style={{
                width: "44px",
                height: "44px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {/* Layer 3: Inner Core (Flat) */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "36px",
                  height: "36px",
                  background: isLocked ? "#E2E8F0" : style.core,
                  boxShadow: isLocked ? "inset 0 2px 4px rgba(255,255,255,0.5)" : "inset 0 2px 4px rgba(255,255,255,0.4)",
                }}
              >
                {isDone && <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />}
                {isCurrent && <Book className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />}
                {isLocked && <Lock className="w-4 h-4 text-[#94A3B8]" strokeWidth={2} />}
              </div>
            </div>
            
            {/* Dummy spacer to maintain layout size for flex-col */}
            <div style={{ width: "60px", height: "60px" }} />
          </div>

          {/* Compact Label without Card Background */}
          <div className="mt-1 flex flex-col items-center justify-center w-32 px-1">
            <span className="text-[12px] font-extrabold text-[#334155] uppercase tracking-wider drop-shadow-sm text-center leading-tight">
              {node.code || "N/A"}
            </span>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden shadow-2xl border border-gray-100 rounded-2xl" side="right" align="center" sideOffset={16}>
        <div className="px-5 py-4 text-white relative" style={{ background: isLocked ? "#94A3B8" : style.core }}>
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
            <h3 className="font-bold text-[16px] leading-snug drop-shadow-md">
              {node.name}
            </h3>
            {isDone && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md w-fit font-medium">
                <Check className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>

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
                  <span key={idx} className="px-2 py-1 bg-blue-50/50 border border-blue-100/50 text-blue-700 rounded-md text-[11px] font-semibold">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No skills listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
          {isActive ? (
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Enter GPA to Complete
                </label>
                <input 
                  type="number"
                  step="0.1"
                  placeholder="Enter GPA (5-10)..."
                  className={`border rounded-lg px-3 py-2 text-sm w-full outline-none transition-all focus:ring-2 focus:ring-opacity-50 ${
                    gpaError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  value={gpa}
                  onChange={(e) => {
                    setGpa(e.target.value);
                    setGpaError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValidateAndConfirm();
                    }
                  }}
                />
                {gpaError && (
                  <span className="text-red-500 text-[10px] font-semibold animate-pulse">{gpaError}</span>
                )}
                <Button 
                  className="w-full mt-2 font-bold shadow-md transition-all hover:scale-[1.02]"
                  style={{ background: style.core, color: "white" }}
                  onClick={handleValidateAndConfirm}
                >
                  Enter GPA & Finished
                </Button>
              </div>

              <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Completion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to save GPA: <strong className="text-blue-600">{gpa}</strong> and mark this course as finished? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowConfirm(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      style={{ background: style.core, color: "white" }}
                      onClick={() => {
                        updateNodeState(node.id.toString(), "done", parseFloat(gpa));
                        setShowConfirm(false);
                        setOpen(false);
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : isDone ? (
            <div className="w-full text-center py-2 text-xs font-medium text-green-600 border border-dashed border-green-200 rounded-md bg-green-50 flex flex-col gap-1">
              <span>Course completed</span>
              {node.gpa && <span className="font-bold text-[13px]">GPA: {node.gpa}</span>}
            </div>
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