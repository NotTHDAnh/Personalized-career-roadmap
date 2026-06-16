import { useState, useEffect } from "react";
import { CloudUpload, FileSpreadsheet, LogOut } from "lucide-react";
import { DragDropZone } from "./components/DragDropZone";
import { CourseForm } from "./components/CourseForm";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { COLORS } from "@/shared/constants/colors";
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from "sonner";

export default function StaffPanel() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ courseName: "", courseCode: "", duration: "", hashtags: "" });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseName.trim() || !form.courseCode.trim()) {
      toast.error("Course Name and Course Code are required!");
      return;
    }
    toast.success(`Successfully added course: ${form.courseName} (${form.courseCode})`);
    setForm({ courseName: "", courseCode: "", duration: "", hashtags: "" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F5F9" }}>
      <header className="w-full px-8 py-4 flex items-center justify-between" style={{ background: COLORS.BLUE_PRIMARY }}>
        <h1 className="text-white font-bold text-base">Staff Administration Panel — Data Entry Only</h1>
        <Button onClick={logout} variant="ghost" className="flex items-center gap-2 text-sm text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </header>

      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-800">Student Account Upload</h2>
            <DragDropZone text="Upload Student List (.CSV / .XLSX)" icon={CloudUpload} />
          </Card>
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-800">Course Batch Import</h2>
            <DragDropZone text="Import Master Curriculum & Courses via File (.CSV / .XLSX)" icon={FileSpreadsheet} />
          </Card>
        </div>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-gray-800">Manual Course Setup</h2>
          <CourseForm form={form} setForm={setForm} onSubmit={handleAdd} />
        </Card>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "#F8FAFC" }}>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Master Verification Table</h2>
              <p className="text-xs text-gray-400 mt-0.5">Active school master data for alignment checking</p>
            </div>
            {loading ? (
              <Skeleton className="h-6 w-16 rounded-full" />
            ) : (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-3 py-1 text-xs">
                2 Records
              </Badge>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC] border-b border-gray-100 hover:bg-transparent">
                  {["Course Name", "Course Code", "Standard Duration (Weeks)", "Associated Skill Hashtags"].map((col) => (
                    <TableHead key={col} className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-[#64748B] h-auto">{col}</TableHead>
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
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-t border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="px-6 py-4 text-sm text-gray-800 font-medium">Advanced Java Programming</TableCell>
                    <TableCell className="px-6 py-4 text-sm font-mono text-gray-600">JA301</TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">8 Weeks</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {["#OOP", "#Backend"].map((t) => (
                          <Badge key={t} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}