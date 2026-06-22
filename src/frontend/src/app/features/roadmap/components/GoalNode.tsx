import { Briefcase, Target } from "lucide-react";
import type { RoadmapGoal } from "@/app/types";

export function GoalNode({ goal }: { goal: RoadmapGoal }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full"
    >
      {/* Container matching the separate card look, but positioned absolutely */}
      <div className="bg-white/95 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center px-4 py-8 w-full"
           style={{
             boxShadow: "0 10px 30px rgba(245,158,11,0.08), 0 0 0 1px rgba(253,230,138,0.5)",
             background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)"
           }}
      >
        {/* Target Icon with glowing rings */}
        <div className="relative flex items-center justify-center mb-8 mt-4">
          <style>
            {`
              @keyframes smoothOscillate {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.4); opacity: 0.1; }
                100% { transform: scale(1); opacity: 0.6; }
              }
            `}
          </style>
          {/* Outer Glow with smooth continuous breathing */}
          <div 
            className="absolute rounded-full"
            style={{
              width: "60px",
              height: "60px",
              background: "rgba(245, 158, 11, 0.4)",
              boxShadow: "0 0 50px rgba(245, 158, 11, 0.8)",
              animation: "smoothOscillate 3s ease-in-out infinite"
            }}
          />
          {/* Inner Rings */}
          <div 
            className="absolute rounded-full"
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
              border: "1px solid #FFEDD5"
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
              border: "2px solid white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
            }}
          />
          {/* Core Icon */}
          <div 
            className="relative rounded-full flex items-center justify-center z-10"
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4)"
            }}
          >
            <Target className="w-6 h-6 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Destination Tag */}
        <div className="px-3 py-1 bg-orange-500 text-white text-[9px] uppercase font-black tracking-widest rounded-full mb-3">
          Destination
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-[16px] font-black text-gray-900 text-center leading-tight">
          {goal.title}
        </h3>
        <p className="text-[10px] text-gray-500 text-center mt-1.5 px-1 leading-relaxed">
          {goal.subtitle || "Design intuitive and impactful digital experiences."}
        </p>

        {/* Bottom Button */}
        <div className="mt-5 w-full">
          <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-orange-200 bg-white/60 text-orange-600 font-bold text-[12px] shadow-sm">
            <Briefcase className="w-3.5 h-3.5" />
            Career Goal
          </div>
        </div>
      </div>
    </div>
  );
}