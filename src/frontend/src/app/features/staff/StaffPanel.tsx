import { useState, useEffect } from "react";
import { 
  CloudUpload, 
  FileSpreadsheet, 
  LogOut,
  Users,
  BookOpen,
  Code2,
  Briefcase,
  Key,
  Eye,
  EyeOff,
  Save,
  Settings,
  Plus,
  Trash2
} from "lucide-react";
import { CourseForm } from "./components/CourseForm";
import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from "sonner";
import { apiClient } from "@/shared/api/apiClient";
import { useRef } from "react";
import { FileUploadModal } from "./components/FileUploadModal";
import { getApiKeyStatus, saveApiKey, deleteApiKey } from "../../services/apiKeyApi";
import { parseApiError } from "@/shared/utils/errorHelper";

interface StatCount {
  students: number;
  courses: number;
  skills: number;
}

export default function StaffPanel() {
  const { logout, user } = useAuth();
  
  // Data States
  const [stats, setStats] = useState<StatCount | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Course Form State
  const [form, setForm] = useState({ courseName: "", courseCode: "", credits: "", totalStudyHours: "", hashtags: "", outcomes: "" });
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  
  // Table state
  const [loadingTable, setLoadingTable] = useState(true);
  const [newestCourses, setNewestCourses] = useState<any[]>([]);
  
  // File Import Modal State
  const [uploadModalState, setUploadModalState] = useState<{isOpen: boolean, title: string, importType: 'students' | 'courses'}>({ isOpen: false, title: "", importType: 'students' });
  
  // AI Config State
  const [aiKey, setAiKey] = useState("");
  const [savedAiKey, setSavedAiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [aiKeyError, setAiKeyError] = useState("");

  const fetchTableCourses = async () => {
    try {
      setLoadingTable(true);
      const batchSize = 20;
      let loadedCourses: any[] = [];
      let index = 1;
      let keepFetching = true;

      while (keepFetching) {
        const ids = Array.from({ length: batchSize }, (_, i) => `CRS_${String(index + i).padStart(3, '0')}`);
        const results = await Promise.allSettled(
          ids.map(id => apiClient.get<any>(`/Course/${id}`))
        );

        const fulfilled = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value);

        loadedCourses = [...loadedCourses, ...fulfilled];

        if (fulfilled.length === 0) {
          keepFetching = false;
        } else {
          index += batchSize;
        }
      }

      const sorted = loadedCourses
        .sort((a, b) => b.courseId.localeCompare(a.courseId))
        .slice(0, 4);

      setNewestCourses(sorted);
    } catch (error) {
      console.error("Failed to fetch table courses", error);
    } finally {
      setLoadingTable(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const [students, courses, skills] = await Promise.all([
        apiClient.get<number>("/students/count").catch(() => 0),
        apiClient.get<number>("/courses/count").catch(() => 0),
        apiClient.get<number>("/skills/count").catch(() => 0),
      ]);
      setStats({ students, courses, skills });
    } catch (error) {
      console.error("Failed to fetch stats", error);
      setStats({ students: 0, courses: 0, skills: 0 }); // Fallback on error
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // Load saved AI Key
    if (user?.userId) {
      getApiKeyStatus(user.userId)
        .then((status) => {
          if (status.hasKey && status.maskedKey) {
            setSavedAiKey(status.maskedKey);
            setAiKey(status.maskedKey);
          }
        })
        .catch(console.error);
    }
    
    fetchStats();
    fetchTableCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseName.trim() || !form.courseCode.trim() || !form.hashtags.trim() || !form.outcomes.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      await apiClient.post("/Staff/courses", {
        CourseCode: form.courseCode.trim(),
        CourseName: form.courseName.trim(),
        Credits: parseInt(form.credits) || 3,
        TotalStudyHours: parseInt(form.totalStudyHours) || 0,
        Skills: form.hashtags.trim(),
        Outcomes: form.outcomes.trim()
      });
      toast.success(`Successfully added course: ${form.courseName} (${form.courseCode})`);
      setForm({ courseName: "", courseCode: "", credits: "", totalStudyHours: "", hashtags: "", outcomes: "" });
      setIsCourseModalOpen(false);
      fetchStats(); // Refresh stats after adding
      fetchTableCourses(); // Refresh table after adding
    } catch (err: any) {
      let errorData: any = err.response?.data;
      if (!errorData) {
        try {
          errorData = JSON.parse(err.message);
        } catch {
          errorData = null;
        }
      }

      if (errorData?.errors) {
        const errorMessages = Object.values(errorData.errors).flat().join('\n');
        toast.error(errorMessages);
      } else if (errorData?.message || errorData?.title) {
        toast.error(errorData.message || errorData.title);
      } else {
        toast.error(err.message || "Failed to add course");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast.info(`Uploading ${file.name}...`);
    // Here you would call apiClient.post for the file upload
    setTimeout(() => {
      toast.success(`${type} imported successfully!`);
    }, 1000);
    
    // Reset input
    e.target.value = '';
  };

  const formatMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 10) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  const handleSaveAiKey = async () => {
    setAiKeyError("");
    if (!aiKey.trim()) {
      setAiKeyError("Please enter a valid API Key");
      return;
    }
    
    if (!user?.userId) {
      toast.error("User not found");
      return;
    }

    setIsSavingKey(true);
    try {
      await saveApiKey(user.userId, aiKey.trim());
      setSavedAiKey(formatMaskedKey(aiKey.trim()));
      toast.success("AI Configuration saved successfully");
    } catch (err: any) {
      const parsedError = parseApiError(err);
      const msg = parsedError.detail || parsedError.message || "Failed to save Gemini API key.";
      setAiKeyError(msg);
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-6">
      <div className="space-y-4 max-w-7xl mx-auto w-full">
        {/* HEADER */}
        <div className="mb-4">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0F172A] mb-1">Staff Dashboard</h1>
          <p className="text-[13px] text-[#64748B]">Overview of system statistics and master data management.</p>
        </div>
        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Students Imported" icon={Users} value={stats?.students} loading={loadingStats} color="blue" />
          <StatCard title="Courses" icon={BookOpen} value={stats?.courses} loading={loadingStats} color="indigo" />
          <StatCard title="Skills" icon={Code2} value={stats?.skills} loading={loadingStats} color="emerald" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {/* DATA IMPORT SECTION */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-4 flex gap-4 transition-colors">
                <div className="w-10 h-10 bg-[#E0E7FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <CloudUpload className="w-5 h-5 text-[#3B28CC]" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-[14px] font-bold text-[#0F172A] mb-1">Student Accounts</h3>
                  <p className="text-[12px] text-[#64748B] mb-3 leading-relaxed flex-1">Upload .CSV or .XLSX list to batch import student accounts and profiles.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setUploadModalState({ isOpen: true, title: "Student Accounts", importType: "students" })}
                    className="w-full border-[#E2E8F0] text-[#3B28CC] hover:bg-[#E0E7FF] hover:text-[#3B28CC] hover:border-[#C7D2FE] text-[12px] h-8"
                  >
                    Select File
                  </Button>
                </div>
              </Card>

              <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-4 flex gap-4 transition-colors">
                <div className="w-10 h-10 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-[14px] font-bold text-[#0F172A] mb-1">Curriculum & Courses</h3>
                  <p className="text-[12px] text-[#64748B] mb-3 leading-relaxed flex-1">Import master curriculum, courses, skills, and roles via file.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setUploadModalState({ isOpen: true, title: "Curriculum & Courses", importType: "courses" })}
                    className="w-full border-[#E2E8F0] text-[#16A34A] hover:bg-[#DCFCE7] hover:text-[#16A34A] hover:border-[#bbf7d0] text-[12px] h-8"
                  >
                    Select File
                  </Button>
                </div>
              </Card>
            </div>

            {/* MASTER VERIFICATION TABLE */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] overflow-hidden transition-colors duration-300">
              <div className="px-4 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] text-[#0F172A] font-bold flex items-center gap-2">
                    Master Verification Table
                  </h3>
                  <p className="text-[12px] text-[#64748B] mt-0.5 font-medium">Active school master data for alignment checking</p>
                </div>
                <div className="flex items-center gap-3">
                  {loadingTable ? (
                    <Skeleton className="h-6 w-16 rounded-full" />
                  ) : (
                    <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      {newestCourses.length} Records
                    </span>
                  )}
                  <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white h-8 text-[12px] gap-1.5 rounded-full px-4">
                        <Plus className="w-3.5 h-3.5" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Course Manually</DialogTitle>
                      </DialogHeader>
                      <div className="py-2">
                        <CourseForm form={form} setForm={setForm} onSubmit={handleAddCourse} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC] border-b border-[#E2E8F0] hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Course Code</TableHead>
                      <TableHead className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Course Name</TableHead>
                      <TableHead className="px-6 py-4 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Credits</TableHead>
                      <TableHead className="px-6 py-4 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Study Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTable ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i} className="border-t border-[#E2E8F0]">
                          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-44" /></TableCell>
                          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      newestCourses.map((course) => (
                        <TableRow key={course.courseId} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50 transition-colors">
                          <TableCell className="px-6 py-4 whitespace-nowrap text-[13px] font-mono font-bold text-[#3B28CC]">{course.courseCode}</TableCell>
                          <TableCell className="px-6 py-4 text-[13px] font-bold text-[#0F172A]">{course.courseName}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-[13px] text-center font-semibold text-[#334155]">{course.credits} credits</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-[13px] text-center font-semibold text-[#334155]">{course.totalStudyHours} hrs</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            {/* AI CONFIGURATION SECTION */}
            <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-5 flex flex-col gap-0 transition-colors relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Settings className="w-24 h-24" />
              </div>
              
              <div className="flex items-start gap-3 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center border border-[#E2E8F0] shrink-0 mt-0.5">
                  <Key className="w-4 h-4 text-[#0F172A]" />
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <h2 className="text-[15px] font-bold text-[#0F172A] whitespace-nowrap">AI Configuration</h2>
                  {savedAiKey ? (
                    <span className="bg-[#DCFCE7] text-[#16A34A] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="bg-[#FEF2F2] text-[#EF4444] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                      Not Configured
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-[12px] text-[#64748B] mb-2 leading-relaxed relative z-10">
                Gemini API Key is required for AI-powered features such as Mentor Chat and Roadmap Generation.
              </p>

              <div className="mt-auto space-y-3 relative z-10">
                {savedAiKey ? (
                  <div className="bg-[#0F172A] rounded-xl p-3.5 flex items-center justify-between border border-[#1E293B]">
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] mb-0.5">Connected Key</p>
                      <p className="text-[13px] text-white font-mono font-medium tracking-wide">
                        {formatMaskedKey(savedAiKey)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={async () => {
                          if (user?.userId) {
                            try {
                              await deleteApiKey(user.userId);
                              setAiKey("");
                              setSavedAiKey(null);
                              toast.success("API Key removed");
                              setShowKey(false);
                            } catch (error: any) {
                              toast.error(error.response?.data?.message || "Failed to delete key");
                            }
                          }
                        }}
                        className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#1E293B] rounded-lg transition-colors"
                        title="Delete Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] mb-1.5">
                        Gemini API Key
                      </label>
                      {aiKeyError && (
                        <div className="text-[11px] font-medium text-red-500 mb-1.5">
                          {aiKeyError}
                        </div>
                      )}
                      <div className="relative">
                        <Input 
                          type={showKey ? "text" : "password"} 
                          placeholder="AIzaSy..." 
                          value={aiKey}
                          onChange={(e) => {
                            setAiKey(e.target.value);
                            if (aiKeyError) setAiKeyError("");
                          }}
                          className={`pr-10 text-[13px] bg-[#F8FAFC] focus-visible:ring-[#3B28CC] ${aiKeyError ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveAiKey} 
                      disabled={isSavingKey || !aiKey.trim()}
                      className="w-full bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white gap-2 mt-2 h-9 text-[13px]"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingKey ? "Saving..." : "Save Key"}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <FileUploadModal 
        isOpen={uploadModalState.isOpen} 
        onClose={() => {
          setUploadModalState(prev => ({ ...prev, isOpen: false }));
          fetchStats(); // Refresh stats in case something was imported
          fetchTableCourses(); // Refresh table in case something was imported
        }}
        title={uploadModalState.title}
        importType={uploadModalState.importType}
      />
    </div>
  );
}

// Subcomponent for Stats
function StatCard({ title, icon: Icon, value, loading, color }: { title: string, icon: any, value?: number, loading: boolean, color: "blue" | "indigo" | "emerald" | "amber" }) {
  const colorMap = {
    blue: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    indigo: "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]",
    emerald: "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]",
    amber: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  };
  
  return (
    <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-5 flex flex-col transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${colorMap[color]}`}>
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <h3 className="text-[13px] font-bold text-[#64748B] uppercase tracking-wide">{title}</h3>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-[32px] font-black text-[#0F172A] tracking-tight leading-none">
            {value !== undefined ? value.toLocaleString() : "0"}
          </div>
        )}
      </div>
    </Card>
  );
}