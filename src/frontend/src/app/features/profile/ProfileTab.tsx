import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { COLORS } from "@/shared/constants/colors";
import { SkillTag } from "./components/SkillTag";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { GpaInput } from "./components/GpaInput";
import { ErrorAlert } from "@/app/components/common/ErrorAlert";

const skills = [
  "#Logic", "#Syntax", "#HTML", "#CSS", "#OOP",
  "#Backend", "#SQL", "#Schema", "#DataStructures",
  "#Algorithms", "#API", "#REST",
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
      <div className="p-8 min-h-full" style={{ background: "#F1F5F9" }}>
        <ErrorAlert title="Profile Loading Error" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-full" style={{ background: "#F1F5F9" }}>
      <div>
        <h2 style={{ color: COLORS.BLUE_PRIMARY, fontWeight: 700, fontSize: "1.2rem" }}>
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
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col gap-3">
            <CardHeader className="p-0">
              <p
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
                style={{ color: "#94A3B8" }}
              >
                Total Learning Time Completed
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span style={{ fontSize: "2.4rem", fontWeight: 700, color: COLORS.BLUE_PRIMARY, lineHeight: 1 }}>
                      36
                    </span>
                    <span className="text-sm text-gray-500">Weeks Completed</span>
                  </div>
                  <Progress value={60} className="h-2 bg-gray-100 [&>[data-slot=progress-indicator]]:bg-[#0D9488]" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">60 of 100 weeks total programme</p>
            </CardContent>
          </Card>

          {/* GPA */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col gap-3">
            <CardHeader className="p-0">
              <p
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
                style={{ color: "#94A3B8" }}
              >
                GPA
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span style={{ fontSize: "2.4rem", fontWeight: 700, color: COLORS.BLUE_PRIMARY, lineHeight: 1 }}>
                      3.85
                    </span>
                    <span className="text-sm text-gray-500">out of 4.0</span>
                  </div>
                  <Progress value={96} className="h-2 bg-gray-100 [&>[data-slot=progress-indicator]]:bg-[#F59E0B]" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">96.25% of maximum attainable</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Skill Hashtags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <p
            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            style={{ color: "#94A3B8" }}
          >
            Acquired Skill Hashtags
          </p>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-wrap gap-2"
              style={{ maxHeight: "200px", overflow: "hidden" }}
            >
              {skills.slice(0, 11).map((s) => (
                <SkillTag key={s} label={s} />
              ))}
              <span className="text-xs text-gray-400 self-center">...more</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-auto border-t border-gray-100 pt-3">
            {loading ? <Skeleton className="h-3 w-32" /> : `${skills.length} skills unlocked from completed courses`}
          </p>
        </div>
      </div>

      {/* ── MIDDLE TIER: In-Progress Courses ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-800 font-semibold">
              In-Progress Courses
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Active Semester · Currently Enrolled</p>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-16 rounded-full" />
          ) : (
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-3 py-1 text-xs">
              2 Active
            </Badge>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] border-b border-gray-100 hover:bg-transparent">
                {[
                  "Course Name",
                  "Course Code",
                  "Standard Duration (Weeks)",
                  "Learning Outcomes (Skill Hashtags)",
                  "GPA",
                  "Status",
                ].map((col) => (
                  <TableHead
                    key={col}
                    className="px-5 py-3 text-left text-xs uppercase tracking-wider font-semibold text-[#64748B] h-auto"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-t border-gray-100">
                    <TableCell><Skeleton className="h-5 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow className="border-t border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-5 py-4 text-sm text-gray-800 font-medium">
                      Advanced Java Programming
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-mono text-gray-600">JA301</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600">8 Weeks</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {["#OOP", "#Backend"].map((t) => (
                          <SkillTag key={t} label={t} variant="green" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <GpaInput />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
                          In Progress
                        </Badge>
                        <span className="text-xs whitespace-nowrap text-amber-600 font-medium">
                          ⚠️ Prerequisite Missing
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-5 py-4 text-sm text-gray-800 font-medium">
                      Database Management Systems
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-mono text-gray-600">DB202</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600">6 Weeks</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {["#SQL", "#Schema"].map((t) => (
                          <SkillTag key={t} label={t} variant="green" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <GpaInput />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
                        In Progress
                      </Badge>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── BOTTOM TIER: Completed Courses ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-800 font-semibold">
              Completed Courses
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Historical Academic Record</p>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-16 rounded-full" />
          ) : (
            <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-200 rounded-full px-3 py-1 text-xs">
              2 Completed
            </Badge>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC] border-b border-gray-100 hover:bg-transparent">
                {[
                  "Course Name",
                  "Course Code",
                  "Standard Duration (Weeks)",
                  "Learning Outcomes (Skill Hashtags)",
                  "GPA",
                  "Status",
                ].map((col) => (
                  <TableHead
                    key={col}
                    className="px-5 py-3 text-left text-xs uppercase tracking-wider font-semibold text-[#64748B] h-auto"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i} className="border-t border-gray-100">
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow className="border-t border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-5 py-4 text-sm text-gray-800 font-medium">
                      Introduction to Programming
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-mono text-gray-600">PR101</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600">8 Weeks</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {["#Logic", "#Syntax"].map((t) => (
                          <SkillTag key={t} label={t} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <GpaInput defaultValue="3.8" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 rounded-full px-2.5 py-1 text-xs font-medium">
                        Done
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-5 py-4 text-sm text-gray-800 font-medium">
                      Web Foundations (External)
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-mono text-gray-600">Coursera</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600">4 Weeks</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {["#HTML", "#CSS"].map((t) => (
                          <SkillTag key={t} label={t} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <GpaInput defaultValue="4.0" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 rounded-full px-2.5 py-1 text-xs font-medium">
                        Done
                      </Badge>
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
