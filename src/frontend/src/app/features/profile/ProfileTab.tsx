import { useState, useRef } from "react";
import { UploadCloud, FileCheck, X } from "lucide-react";
import { SkillTag } from "./components/SkillTag";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { GpaInput } from "./components/GpaInput";
import { CourseNode } from "../data/sharedNodes";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

const skills = [
  "#Logic", "#Syntax", "#HTML", "#CSS", "#OOP",
  "#Backend", "#SQL", "#Schema", "#DataStructures",
  "#Algorithms", "#API", "#REST",
];

export default function ProfileTranscripts({ 
  courseNodes, 
  updateCourseNode 
}: { 
  courseNodes: CourseNode[]; 
  updateCourseNode: (id: number, updates: Partial<CourseNode>) => void 
}) {
  const inProgressCourses = courseNodes.filter(n => n.state === "active");
  const completedCourses = courseNodes.filter(n => n.state === "done");

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
            {inProgressCourses.length} Active
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
              {inProgressCourses.map((course) => (
                <tr key={course.id} className="border-t border-gray-100">
                  <td className="px-5 py-4 text-sm text-gray-800">
                    {course.name}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-600">{course.code}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{course.duration}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {course.skills.map((t) => (
                        <SkillTag key={t} label={t} variant="green" />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <GpaInput 
                      value={course.gpa} 
                      onChange={(val) => {
                        const isDone = val.trim().length > 0;
                        updateCourseNode(course.id, { 
                          gpa: val,
                          state: isDone ? "done" : "active"
                        });
                      }} 
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.gpa ? (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs"
                          style={{ background: "#F0FDF4", color: "#16A34A", fontWeight: 500 }}
                        >
                          Done
                        </span>
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                          style={{ background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500 }}
                        >
                          In Progress
                        </span>
                      )}
                      {!course.gpa && course.warning && (
                        <span className="text-xs whitespace-nowrap">
                          {course.warning}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
            {completedCourses.length} Completed
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
              {completedCourses.map((course) => (
                <tr key={course.id} className="border-t border-gray-100">
                  <td className="px-5 py-4 text-sm text-gray-800">
                    {course.name}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-600">{course.code}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{course.duration}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {course.skills.map((t) => (
                        <SkillTag key={t} label={t} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <GpaInput 
                      value={course.gpa}
                      onChange={(val) => {
                        const isDone = val.trim().length > 0;
                        updateCourseNode(course.id, { 
                          gpa: val,
                          state: isDone ? "done" : "active"
                        });
                      }}
                    />
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
