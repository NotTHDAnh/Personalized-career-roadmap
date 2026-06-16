import { useState } from "react";
import { COLORS } from "@/shared/constants/colors";

export function DragDropZone({ text, icon: Icon }: { text: string; icon: any }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className="rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors"
      style={{
        border: `2px dashed ${isDragging ? COLORS.TEAL_ACCENT : "#CBD5E1"}`,
        background: isDragging ? "#F0FDFA" : "#F8FAFC",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: isDragging ? "#CCFBF1" : "#EFF6FF" }}>
        <Icon className="w-7 h-7" style={{ color: isDragging ? COLORS.TEAL_ACCENT : COLORS.BLUE_PRIMARY }} />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{text}</p>
        <p className="text-xs text-gray-400 mt-1">
          Drag & drop file here or <span style={{ color: COLORS.TEAL_ACCENT, cursor: "pointer" }}>browse</span>
        </p>
      </div>
    </div>
  );
}