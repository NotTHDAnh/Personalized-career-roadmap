import { useState } from "react";
import { CloudUpload, FileSpreadsheet, LogOut } from "lucide-react";
import { DragDropZone } from "./components/DragDropZone";
import { CourseForm } from "./components/CourseForm";

const BLUE = "#1B365D";

function SkillTag({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
      {label}
    </span>
  );
}

export default function StaffPanel({ onLogout }: { onLogout: () => void }) {
  const [form, setForm] = useState({ courseName: "", courseCode: "", duration: "", hashtags: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ courseName: "", courseCode: "", duration: "", hashtags: "" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F5F9" }}>
      <header className="w-full px-8 py-4 flex items-center justify-between" style={{ background: BLUE }}>
        <h1 className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Staff Administration Panel — Data Entry Only</h1>
        <button onClick={onLogout} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)" }}>
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm text-gray-800 mb-5" style={{ fontWeight: 600 }}>Student Account Upload</h2>
            <DragDropZone text="Upload Student List (.CSV / .XLSX)" icon={CloudUpload} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm text-gray-800 mb-5" style={{ fontWeight: 600 }}>Course Batch Import</h2>
            <DragDropZone text="Import Master Curriculum & Courses via File (.CSV / .XLSX)" icon={FileSpreadsheet} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm text-gray-800 mb-5" style={{ fontWeight: 600 }}>Manual Course Setup</h2>
          <CourseForm form={form} setForm={setForm} onSubmit={handleAdd} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "#F8FAFC" }}>
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Master Verification Table</h2>
              <p className="text-xs text-gray-400 mt-0.5">Active school master data for alignment checking</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>2 Records</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Course Name", "Course Code", "Standard Duration (Weeks)", "Associated Skill Hashtags"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: "#64748B", fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-6 py-4 text-sm text-gray-800">Advanced Java Programming</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">JA301</td>
                <td className="px-6 py-4 text-sm text-gray-600">8 Weeks</td>
                <td className="px-6 py-4"><div className="flex gap-2 flex-wrap">{["#OOP", "#Backend"].map((t) => <SkillTag key={t} label={t} />)}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}