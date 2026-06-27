import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { TrendingUp, Code2, Plus, Key } from "lucide-react";
import { SkillTag } from "./components/SkillTag";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { GpaInput } from "./components/GpaInput";
import { ErrorAlert } from "@/app/components/common/ErrorAlert";

const skills = [
  "JavaScript", "React", "TypeScript", "Next.js", "Tailwind CSS",
  "Node.js", "GraphQL", "Redux",
];

export default function ProfileTranscripts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  if (error) {
    return (
      <div className="p-6 md:p-8 min-h-full bg-transparent">
        <ErrorAlert title="Profile Loading Error" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-full bg-transparent transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
          Profile & Transcript Management
        </h2>
        <p className="text-[13px] text-[#64748B]">
          Workspace - Academic Year: 2024 - 2025
        </p>
      </div>

      {/* ── TOP TIER: 2-column layout (Student Card | Stats) ── */}
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "320px 1fr" }}>
        {/* Left: Student Profile */}
        <StudentProfileCard />

        {/* Right: Learning Progress & Acquired Skills */}
        <div className="flex flex-col gap-6">
          {/* Learning Progress Card */}
          <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-6 flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-[#3B28CC]" strokeWidth={2.5} />
              <h4 className="text-[16px] font-bold text-[#0F172A]">Learning Progress</h4>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* 2 Progress Bars Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Active Course */}
                  <div className="border border-[#E2E8F0] bg-white rounded-xl p-4 relative overflow-hidden transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B28CC]" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[13px] font-bold text-[#0F172A] truncate pr-2">Advanced React Patterns</span>
                      <span className="bg-[#E0E7FF] text-[#3B28CC] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">In Progress</span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-semibold text-[#64748B]">Step 4 of 10</span>
                      <span className="text-[11px] font-bold text-[#3B28CC]">40%</span>
                    </div>
                    <Progress value={40} className="h-1.5 bg-[#E2E8F0] [&>[data-slot=progress-indicator]]:bg-[#3B28CC]" />
                  </div>

                  {/* Completed Course */}
                  <div className="border border-[#E2E8F0] bg-white rounded-xl p-4 relative overflow-hidden transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[13px] font-bold text-[#0F172A] truncate pr-2">TypeScript Fundamentals</span>
                      <span className="bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Done
                      </span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-semibold text-[#64748B]">Completed</span>
                      <span className="text-[11px] font-bold text-[#0F172A]">100%</span>
                    </div>
                    <Progress value={100} className="h-1.5 bg-[#E2E8F0] [&>[data-slot=progress-indicator]]:bg-[#10B981]" />
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-5 border-t border-[#E2E8F0]">
                  <div className="flex justify-between text-center divide-x divide-[#E2E8F0]">
                    <div className="flex-1">
                      <p className="text-[24px] font-bold text-[#3B28CC]">12</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">SKILLS</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[24px] font-bold text-[#10B981]">3</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">COMPLETED</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[24px] font-bold text-[#0F172A]">45h</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">STUDY HOUR</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Acquired Skills Card */}
          <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-6 flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-[#3B28CC]" strokeWidth={2.5} />
              <h4 className="text-[16px] font-bold text-[#0F172A]">Acquired Skills</h4>
            </div>
            <div className="border-t border-[#E2E8F0] mb-5 w-full" />
            
            {loading ? (
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 items-center">
                {skills.slice(0, 5).map((s) => (
                  <SkillTag key={s} label={s} />
                ))}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9]:bg-slate-700 transition-colors text-[12px] font-semibold text-[#3B28CC]">
                  <Plus size={14} strokeWidth={3} />
                  Add Skill
                </button>
              </div>
            )}
          </Card>

          {/* AI Key Guide Card */}
          <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-6 flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-[#3B28CC]" strokeWidth={2.5} />
              <h4 className="text-[16px] font-bold text-[#0F172A]">Gemini API Key Guide</h4>
            </div>
            <div className="border-t border-[#E2E8F0] mb-5 w-full" />
            
            <ol className="list-decimal pl-4 space-y-2.5 text-[13px] text-[#334155] font-medium marker:text-[#64748B] marker:font-bold mb-6">
              <li>Go to Google AI Studio</li>
              <li>Sign in with your Google account</li>
              <li>Open API Keys</li>
              <li>Create a new API key</li>
              <li>Copy the key and paste it into the AI Configuration in Staff Console (or settings)</li>
            </ol>
            
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E0E7FF] hover:border-[#C7D2FE] text-[#3B28CC] text-[13px] font-bold h-10 rounded-xl transition-colors w-full"
            >
              Open Google AI Studio
            </a>
          </Card>
        </div>
      </div>

      {/* ── MIDDLE TIER: In-Progress Courses ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] text-[#0F172A] font-bold">
              In-Progress Courses
            </h3>
            <p className="text-[12px] text-[#64748B] mt-0.5 font-medium">Active Semester · Currently Enrolled</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-14 rounded-full" />
          ) : (
            <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
              2 Active
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] border-b border-[#E2E8F0] hover:bg-transparent:bg-transparent">
                <TableHead className="w-[25%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Name</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Code</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Duration</TableHead>
                <TableHead className="w-[20%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Learning Outcomes</TableHead>
                <TableHead className="w-[10%] px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">GPA</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-t border-[#E2E8F0]">
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50:bg-slate-800/50 transition-colors">
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[13px] text-[#0F172A] font-bold">Advanced Java Programming</span>
                        <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] font-bold px-1.5 py-0.5 rounded-md">
                          * Prerequisite
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-top">JA301</TableCell>
                    <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-top">8 Weeks</TableCell>
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex gap-1.5 flex-wrap">
                        {["OOP", "Backend"].map((t) => (
                          <SkillTag key={t} label={t} variant="green" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-center">
                      <div className="flex justify-center"><GpaInput /></div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-right">
                      <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        In Progress
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50:bg-slate-800/50 transition-colors">
                    <TableCell className="px-5 py-3 align-top text-[13px] text-[#0F172A] font-bold">
                      Database Management Systems
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-top">DB202</TableCell>
                    <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-top">6 Weeks</TableCell>
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex gap-1.5 flex-wrap">
                        {["SQL", "Schema"].map((t) => (
                          <SkillTag key={t} label={t} variant="green" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-center">
                      <div className="flex justify-center"><GpaInput /></div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-right">
                      <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        In Progress
                      </span>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── BOTTOM TIER: Completed Courses ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] overflow-hidden transition-colors duration-300">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] text-[#0F172A] font-bold">
              Completed Courses
            </h3>
            <p className="text-[12px] text-[#64748B] mt-0.5 font-medium">Historical Academic Record</p>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-14 rounded-full" />
          ) : (
            <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[11px] font-bold">
              2 Completed
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] border-b border-[#E2E8F0] hover:bg-transparent:bg-transparent">
                <TableHead className="w-[25%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Name</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Code</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Duration</TableHead>
                <TableHead className="w-[20%] px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Learning Outcomes</TableHead>
                <TableHead className="w-[10%] px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">GPA</TableHead>
                <TableHead className="w-[15%] px-5 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-t border-[#E2E8F0]">
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50:bg-slate-800/50 transition-colors">
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[13px] text-[#0F172A] font-bold">Introduction to Programming</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-top">PR101</TableCell>
                    <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-top">8 Weeks</TableCell>
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex gap-1.5 flex-wrap">
                        {["Logic", "Syntax"].map((t) => (
                          <SkillTag key={t} label={t} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-center">
                      <div className="flex justify-center"><GpaInput defaultValue="3.8" /></div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-right">
                      <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        Done
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50:bg-slate-800/50 transition-colors">
                    <TableCell className="px-5 py-3 align-top text-[13px] text-[#0F172A] font-bold">
                      Web Foundations (External)
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-top">Coursera</TableCell>
                    <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-top">4 Weeks</TableCell>
                    <TableCell className="px-5 py-3 align-top">
                      <div className="flex gap-1.5 flex-wrap">
                        {["HTML", "CSS"].map((t) => (
                          <SkillTag key={t} label={t} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-center">
                      <div className="flex justify-center"><GpaInput defaultValue="4.0" /></div>
                    </TableCell>
                    <TableCell className="px-5 py-3 align-top text-right">
                      <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        Done
                      </span>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
