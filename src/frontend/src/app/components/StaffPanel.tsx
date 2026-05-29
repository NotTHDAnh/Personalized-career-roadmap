import { useState } from "react";
import { CloudUpload, FileSpreadsheet, LogOut } from "lucide-react";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

function DragDropZone({ text, icon: Icon }: { text: string; icon: React.ComponentType<{ className?: string }> }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className="rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors"
      style={{
        border: `2px dashed ${isDragging ? TEAL : "#CBD5E1"}`,
        background: isDragging ? "#F0FDFA" : "#F8FAFC",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: isDragging ? "#CCFBF1" : "#EFF6FF" }}
      >
        <Icon className="w-7 h-7" style={{ color: isDragging ? TEAL : BLUE }} />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
          {text}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Drag &amp; drop file here or{" "}
          <span style={{ color: TEAL, cursor: "pointer" }}>browse</span>
        </p>
      </div>
    </div>
  );
}

function SkillTag({ label }: { label: string }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs"
      style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
    >
      {label}
    </span>
  );
}

export default function StaffPanel({ onLogout }: { onLogout: () => void }) {
  const [form, setForm] = useState({
    courseName: "",
    courseCode: "",
    duration: "",
    hashtags: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ courseName: "", courseCode: "", duration: "", hashtags: "" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F5F9" }}>
      {/* ── Block 0: Top Bar ── */}
      <header
        className="w-full px-8 py-4 flex items-center justify-between"
        style={{ background: BLUE }}
      >
        <h1
          className="text-white"
          style={{ fontWeight: 700, fontSize: "1.05rem" }}
        >
          Staff Administration Panel — Data Entry Only
        </h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)" }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="flex-1 p-8 space-y-6">
        {/* ── Blocks 1 & 2: Upload Cards ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Block 1: Student Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2
              className="text-sm text-gray-800 mb-5"
              style={{ fontWeight: 600 }}
            >
              Student Account Upload
            </h2>
            <DragDropZone
              text="Upload Student List (.CSV / .XLSX)"
              icon={CloudUpload}
            />
          </div>

          {/* Block 2: Course Import */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2
              className="text-sm text-gray-800 mb-5"
              style={{ fontWeight: 600 }}
            >
              Course Batch Import
            </h2>
            <DragDropZone
              text="Import Master Curriculum & Courses via File (.CSV / .XLSX)"
              icon={FileSpreadsheet}
            />
          </div>
        </div>

        {/* ── Block 3: Manual Course Setup Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2
            className="text-sm text-gray-800 mb-5"
            style={{ fontWeight: 600 }}
          >
            Manual Course Setup
          </h2>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-4 gap-4 mb-5">
              {[
                { key: "courseName", label: "Course Name", placeholder: "e.g. Introduction to AI" },
                { key: "courseCode", label: "Course Code", placeholder: "e.g. AI401" },
                { key: "duration", label: "Standard Duration (Weeks)", placeholder: "e.g. 8" },
                { key: "hashtags", label: "Associated Skill Hashtags", placeholder: "#ML, #Python" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label
                    className="block text-xs text-gray-500 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm text-gray-800 focus:outline-none focus:ring-1"
                    style={{
                      borderColor: "#E2E8F0",
                      background: "#F8FAFC",
                      // @ts-ignore
                      "--tw-ring-color": BLUE,
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: BLUE, fontWeight: 500 }}
            >
              Add Course
            </button>
          </form>
        </div>

        {/* ── Block 4: Master Verification Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
            style={{ background: "#F8FAFC" }}
          >
            <div>
              <h2 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                Master Verification Table
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Active school master data for alignment checking
              </p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
            >
              2 Records
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[
                  "Course Name",
                  "Course Code",
                  "Standard Duration (Weeks)",
                  "Associated Skill Hashtags",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ color: "#64748B", fontWeight: 600 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-6 py-4 text-sm text-gray-800">
                  Advanced Java Programming
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">JA301</td>
                <td className="px-6 py-4 text-sm text-gray-600">8 Weeks</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {["#OOP", "#Backend"].map((t) => <SkillTag key={t} label={t} />)}
                  </div>
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-6 py-4 text-sm text-gray-800">
                  Database Management Systems
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">DB202</td>
                <td className="px-6 py-4 text-sm text-gray-600">6 Weeks</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {["#SQL", "#Schema"].map((t) => <SkillTag key={t} label={t} />)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
