import React, { useState, useRef, useEffect } from "react";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import type { CourseRecord } from "../../types";
import { ALL_COURSES, INITIAL_TRANSCRIPT, SEMESTERS } from "../../data/mockData";
import { calcWeightedGPA, getMissingPrereqs } from "../../utils/academic";

export function ProfileTab() {
  const [transcript, setTranscript] = useState<CourseRecord[]>(INITIAL_TRANSCRIPT);
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  const enrolledCodes = transcript.map((c) => c.code);
  const available = ALL_COURSES.filter((c) => !enrolledCodes.includes(c.code));
  const weightedGPA = calcWeightedGPA(transcript);
  const totalCredits = transcript.reduce((s, c) => s + c.credits, 0);

  function addCourse(code: string) {
    const found = ALL_COURSES.find((c) => c.code === code);
    if (!found) return;
    setTranscript((prev) => [
      ...prev,
      { ...found, gpa: "", semester: SEMESTERS[0] },
    ]);
    setAddOpen(false);
  }

  function removeCourse(code: string) {
    setTranscript((prev) => prev.filter((c) => c.code !== code));
  }

  function updateGPA(code: string, val: string) {
    setTranscript((prev) =>
      prev.map((c) => (c.code === code ? { ...c, gpa: val } : c))
    );
  }

  function updateSemester(code: string, val: string) {
    setTranscript((prev) =>
      prev.map((c) => (c.code === code ? { ...c, semester: val } : c))
    );
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* Student info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-20 relative" style={{ backgroundColor: "#1B365D" }}>
          <div
            className="absolute top-3 right-6 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(13,148,136,0.25)",
              color: "#5EEAD4",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Active Enrollment
          </div>
        </div>
        <div className="px-7 pb-6">
          <div className="flex items-end gap-5 mb-5">
            <div
              className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center font-extrabold text-xl text-white shadow-lg"
              style={{ backgroundColor: "#0D9488" }}
            >
              NA
            </div>
            <br/>
            <div className="pb-1">
              <h3
                className="font-extrabold text-lg tracking-tight"
                style={{ color: "#1B365D" }}
              >
                Nguyen Van An
              </h3>
              <p
                className="text-xs text-slate-500"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                20210001 · Computer Science · Year 2
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Weighted GPA", value: weightedGPA, accent: true },
              { label: "Total Credits", value: `${totalCredits} / 130`, accent: false },
              { label: "Academic Standing", value: "Good Standing", accent: false },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3.5 border"
                style={{
                  backgroundColor: stat.accent ? "rgba(13,148,136,0.06)" : "#F8FAFC",
                  borderColor: stat.accent ? "rgba(13,148,136,0.2)" : "#E2E8F0",
                }}
              >
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p
                  className="font-extrabold text-lg tracking-tight"
                  style={{
                    color: stat.accent ? "#0D9488" : "#1B365D",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3
              className="font-extrabold text-sm tracking-tight"
              style={{ color: "#1B365D" }}
            >
              Course Transcript
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add courses and enter your GPA scores below
            </p>
          </div>
          <div className="relative" ref={addRef}>
            <button
              onClick={() => setAddOpen(!addOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#0D9488" }}
            >
              <Plus size={14} />
              Add Course
              <ChevronDown size={12} className={`transition-transform ${addOpen ? "rotate-180" : ""}`} />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                <div className="p-2 max-h-72 overflow-y-auto">
                  {available.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      All courses added
                    </p>
                  ) : (
                    available.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => addCourse(c.code)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-3"
                      >
                        <span
                          className="text-[10px] font-bold pt-0.5 shrink-0"
                          style={{
                            color: "#0D9488",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {c.code}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                            {c.name}
                          </p>
                          {c.prereqs.length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Requires: {c.prereqs.join(", ")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100" style={{ backgroundColor: "#F8FAFC" }}>
                {["Code", "Course Name", "Credits", "Semester", "GPA (4.0)", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transcript.map((course, i) => {
                const missing = getMissingPrereqs(course, enrolledCodes);
                const hasMissing = missing.length > 0;
                const gpaNum = parseFloat(course.gpa);
                const gpaOk = !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4;
                return (
                  <tr
                    key={course.code}
                    className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                      hasMissing ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color: "#1B365D",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {course.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 min-w-[200px]">
                      <p className="text-xs font-semibold text-slate-700">{course.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: "#64748B",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {course.credits}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 min-w-[170px]">
                      <select
                        value={course.semester}
                        onChange={(e) => updateSemester(course.code, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400 text-slate-600 w-full"
                      >
                        {SEMESTERS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        step="0.1"
                        value={course.gpa}
                        onChange={(e) => updateGPA(course.code, e.target.value)}
                        placeholder="0.0"
                        className="w-16 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 text-center font-bold"
                        style={{
                          color: gpaOk && gpaNum >= 3.5 ? "#0D9488" : gpaOk && gpaNum >= 2.5 ? "#1B365D" : "#64748B",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {hasMissing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700">
                          <AlertTriangle size={11} />
                          Prereq: {missing.join(", ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600">
                          <CheckCircle2 size={11} />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => removeCourse(course.code)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {transcript.some((c) => getMissingPrereqs(c, enrolledCodes).length > 0) && (
          <div className="mx-5 my-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Some courses have missing prerequisites. Please consult your academic advisor before enrolling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 2: CAREER ROADMAP ───────────────────────────────────────────────────
