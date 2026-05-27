import React, { useState, useRef, useEffect } from "react";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import { STAFF_EXISTING_COURSES, MOCK_IMPORT } from "../../data/mockData";

export function StaffPanel({ onLogout }: { onLogout: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [prereqOpen, setPrereqOpen] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [addedCourses, setAddedCourses] = useState<typeof STAFF_EXISTING_COURSES>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const prereqRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (prereqRef.current && !prereqRef.current.contains(e.target as Node)) {
        setPrereqOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setUploaded(true); setUploadedFile(f.name); }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setUploaded(true); setUploadedFile(f.name); }
  }

  function togglePrereq(code: string) {
    setSelectedPrereqs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseName.trim() || !courseCode.trim()) return;
    setAddedCourses((prev) => [...prev, { code: courseCode.toUpperCase(), name: courseName }]);
    setCourseName("");
    setCourseCode("");
    setSelectedPrereqs([]);
    setSuccessMsg(`Course "${courseCode.toUpperCase()}" added successfully.`);
    setTimeout(() => setSuccessMsg(""), 3500);
  }

  const allCourses = [...STAFF_EXISTING_COURSES, ...addedCourses];

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Manrope', 'Inter', sans-serif", backgroundColor: "#F1F5F9" }}
    >
      {/* Top nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#1B365D" }}
            >
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm tracking-tight" style={{ color: "#1B365D" }}>
                Staff Administration Portal
              </p>
              <p
                className="text-[10px] text-slate-400"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Smart Career Roadmap · Internal Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white"
                style={{ backgroundColor: "#F59E0B" }}
              >
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Admin Staff</p>
                <p
                  className="text-[9px] text-slate-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  admin@university.edu
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:text-red-500 hover:border-red-200 transition-all"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Section 1: Student Import ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users size={17} style={{ color: "#1B365D" }} />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight" style={{ color: "#1B365D" }}>
                Student Account Import
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload a CSV or Excel file to bulk-create student accounts
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-9 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragging
                  ? "border-teal-400 bg-teal-50"
                  : uploaded
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
              {uploaded ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700">{uploadedFile}</p>
                  <p className="text-xs text-emerald-500 mt-1">File uploaded · 5 records detected</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploaded(false); setUploadedFile(""); }}
                    className="mt-3 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: dragging ? "rgba(13,148,136,0.1)" : "#F1F5F9" }}>
                    <UploadCloud size={24} style={{ color: dragging ? "#0D9488" : "#94A3B8" }} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {dragging ? "Drop file here" : "Drop Student CSV / Excel here"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or <span className="underline text-teal-500">click to browse</span>
                  </p>
                  <p className="text-[10px] text-slate-300 mt-3">
                    Accepted: .csv · .xlsx · .xls · Max 5MB
                  </p>
                </>
              )}
            </div>

            {/* Required columns hint */}
            <div className="flex flex-wrap gap-2">
              {["Full Name", "Student ID", "University Gmail", "Major"].map((col) => (
                <span
                  key={col}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Preview table */}
          {uploaded && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: "#F8FAFC" }}>
                <p className="text-xs font-extrabold" style={{ color: "#1B365D" }}>
                  Import Preview
                </p>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  5 accounts ready
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Name", "ID", "Gmail", "Major", "Temp Password"].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_IMPORT.map((s, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{s.name}</td>
                        <td className="px-4 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1B365D" }}>
                          {s.studentId}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-[160px] truncate">{s.gmail}</td>
                        <td className="px-4 py-2.5 text-slate-500">{s.major}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 font-bold text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {s.tempPw}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
                <button
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#0D9488" }}
                >
                  Confirm Import &amp; Send Credentials
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Course Management ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={17} style={{ color: "#1B365D" }} />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight" style={{ color: "#1B365D" }}>
                Curriculum &amp; Course Management
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add and configure subjects in the system
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              {successMsg}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Advanced Algorithms"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-white placeholder:text-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS401"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-white placeholder:text-slate-300 uppercase"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    required
                  />
                </div>
              </div>

              {/* Prerequisite multi-select */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Prerequisite Courses (Môn học tiên quyết)
                </label>
                <div className="relative" ref={prereqRef}>
                  <button
                    type="button"
                    onClick={() => setPrereqOpen(!prereqOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all bg-white text-left"
                  >
                    <span className={selectedPrereqs.length ? "text-slate-700 font-semibold" : "text-slate-300"}>
                      {selectedPrereqs.length
                        ? `${selectedPrereqs.length} prerequisite(s) selected`
                        : "Select prerequisite courses…"}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-slate-400 transition-transform ${prereqOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {prereqOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden">
                      <div className="p-2 max-h-48 overflow-y-auto">
                        {allCourses.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => togglePrereq(c.code)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                selectedPrereqs.includes(c.code)
                                  ? "border-teal-500"
                                  : "border-slate-300"
                              }`}
                              style={selectedPrereqs.includes(c.code) ? { backgroundColor: "#0D9488" } : {}}
                            >
                              {selectedPrereqs.includes(c.code) && (
                                <Check size={10} className="text-white" />
                              )}
                            </div>
                            <span
                              className="text-[10px] font-bold shrink-0"
                              style={{ color: "#1B365D", fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {c.code}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {selectedPrereqs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedPrereqs.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                        style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0D9488" }}
                      >
                        {code}
                        <button
                          type="button"
                          onClick={() => togglePrereq(code)}
                          className="hover:opacity-60 transition-opacity"
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B365D" }}
              >
                <Plus size={14} />
                Add Course to System
              </button>
            </form>
          </div>

          {/* Course list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: "#F8FAFC" }}>
              <p className="text-xs font-extrabold" style={{ color: "#1B365D" }}>
                Current Course Catalog
              </p>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(27,54,93,0.08)", color: "#1B365D", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {allCourses.length} courses
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {allCourses.map((c, i) => (
                <div
                  key={c.code + i}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <span
                    className="text-[10px] font-bold w-16 shrink-0"
                    style={{ color: "#0D9488", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {c.code}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{c.name}</span>
                  {addedCourses.some((a) => a.code === c.code) && (
                    <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                      New
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
