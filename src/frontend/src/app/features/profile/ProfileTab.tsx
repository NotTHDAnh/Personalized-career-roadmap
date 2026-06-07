import { useState, useRef } from "react";
import { UploadCloud, FileCheck, X } from "lucide-react";
import { SkillTag } from "./components/SkillTag";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { GpaInput } from "./components/GpaInput";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

const skills = [
  "#Logic", "#Syntax", "#HTML", "#CSS", "#OOP",
  "#Backend", "#SQL", "#Schema", "#DataStructures",
  "#Algorithms", "#API", "#REST",
];

export default function ProfileTranscripts() {
  return (
    <div className="p-8 space-y-6 min-h-full" style={{ background: "#F1F5F9" }}>
      <div>
        <h2 style={{ color: BLUE, fontWeight: 700, fontSize: "1.2rem" }}>
          Profile &amp; Transcript Management
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Workspace · Academic Year 2024–2025</p>
      </div>

      {/* ── TOP TIER: 3-column ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "35% 28% 1fr" }}>
        {/* Left: Student Profile */}
        <StudentProfileCard />

        {/* Center: 2 stacked metric cards */}
        <div className="flex flex-col gap-4">
          {/* Learning Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1">
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: "#94A3B8", fontWeight: 600 }}
            >
              Total Learning Time Completed
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span style={{ fontSize: "2.4rem", fontWeight: 700, color: BLUE, lineHeight: 1 }}>
                36
              </span>
              <span className="text-sm text-gray-500">Weeks Completed</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: "60%", background: TEAL }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">60 of 100 weeks total programme</p>
          </div>

          {/* GPA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1">
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: "#94A3B8", fontWeight: 600 }}
            >
              GPA
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span style={{ fontSize: "2.4rem", fontWeight: 700, color: BLUE, lineHeight: 1 }}>
                3.85
              </span>
              <span className="text-sm text-gray-500">out of 4.0</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: "96%", background: "#F59E0B" }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">96.25% of maximum attainable</p>
          </div>
        </div>

        {/* Right: Skill Hashtags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p
            className="text-xs uppercase tracking-wider mb-4"
            style={{ color: "#94A3B8", fontWeight: 600 }}
          >
            Acquired Skill Hashtags
          </p>
          <div
            className="flex flex-wrap gap-2"
            style={{ maxHeight: "200px", overflow: "hidden" }}
          >
            {skills.slice(0, 11).map((s) => (
              <SkillTag key={s} label={s} />
            ))}
            <span className="text-xs text-gray-400 self-center">...more</span>
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
            {skills.length} skills unlocked from completed courses
          </p>
        </div>
      </div>

      {/* ── MIDDLE TIER: In-Progress Courses ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
              In-Progress Courses
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Active Semester · Currently Enrolled</p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "#EFF6FF", color: "#1D4ED8" }}
          >
            2 Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[
                  "Course Name",
                  "Course Code",
                  "Standard Duration (Weeks)",
                  "Learning Outcomes (Skill Hashtags)",
                  "GPA",
                  "Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "#64748B", fontWeight: 600 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-5 py-4 text-sm text-gray-800">
                  Advanced Java Programming
                </td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">JA301</td>
                <td className="px-5 py-4 text-sm text-gray-600">8 Weeks</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {["#OOP", "#Backend"].map((t) => (
                      <SkillTag key={t} label={t} variant="green" />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <GpaInput />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                      style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500 }}
                    >
                      In Progress
                    </span>
                    <span className="text-xs whitespace-nowrap">
                      ⚠️ Prerequisite Missing
                    </span>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-5 py-4 text-sm text-gray-800">
                  Database Management Systems
                </td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">DB202</td>
                <td className="px-5 py-4 text-sm text-gray-600">6 Weeks</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {["#SQL", "#Schema"].map((t) => (
                      <SkillTag key={t} label={t} variant="green" />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <GpaInput />
                </td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500 }}
                  >
                    In Progress
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOTTOM TIER: Completed Courses ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
              Completed Courses
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Historical Academic Record</p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "#F0FDF4", color: "#16A34A" }}
          >
            2 Completed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[
                  "Course Name",
                  "Course Code",
                  "Standard Duration (Weeks)",
                  "Learning Outcomes (Skill Hashtags)",
                  "GPA",
                  "Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "#64748B", fontWeight: 600 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-5 py-4 text-sm text-gray-800">
                  Introduction to Programming
                </td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">PR101</td>
                <td className="px-5 py-4 text-sm text-gray-600">8 Weeks</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {["#Logic", "#Syntax"].map((t) => (
                      <SkillTag key={t} label={t} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <GpaInput defaultValue="3.8" />
                </td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "#F0FDF4", color: "#16A34A", fontWeight: 500 }}
                  >
                    Done
                  </span>
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-5 py-4 text-sm text-gray-800">
                  Web Foundations (External)
                </td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">Coursera</td>
                <td className="px-5 py-4 text-sm text-gray-600">4 Weeks</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {["#HTML", "#CSS"].map((t) => (
                      <SkillTag key={t} label={t} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <GpaInput defaultValue="4.0" />
                </td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "#F0FDF4", color: "#16A34A", fontWeight: 500 }}
                  >
                    Done
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
