import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { TrendingUp, Code2, Plus, Key, Github, Search, ChevronDown, ChevronUp, Check, X, Trash2 } from "lucide-react";
import { SkillTag } from "./components/SkillTag";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { GpaInput } from "./components/GpaInput";
import { ErrorAlert } from "@/app/components/common/ErrorAlert";
import { useNotification } from "@/shared/contexts/NotificationContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { StudentDetailDto } from "@/app/types";
import { apiClient } from "@/shared/api/apiClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { mapDtoToGraph } from "../roadmap/core/roadmapAdapter";

export default function ProfileTranscripts() {
  const { user, token } = useAuth();
  const [studentDetail, setStudentDetail] = useState<StudentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<{
    roleName: string;
    percent: number;
    completed: number;
    total: number;
    totalHours: number;
    completedHours: number;
  } | null>(null);
  const [inProgressRoadmapCourses, setInProgressRoadmapCourses] = useState<any[] | null>(null);

  // Notification hooks & state simulations
  const { openNotification, updateNotification } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState<"success" | "error">("success");

  // Mock Add Skill State
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedNewSkills, setSelectedNewSkills] = useState<string[]>([]);
  const [isExpandedSkills, setIsExpandedSkills] = useState(false);
  const [isGeminiGuideOpen, setIsGeminiGuideOpen] = useState(false);
  const [rowEdits, setRowEdits] = useState<Record<string, { gpa: string, examAttempts: number }>>({});
  const [courseIdToCodeMap, setCourseIdToCodeMap] = useState<Record<string, string>>({});

  // NEW STATES
  const [courseDetailsMapGlobal, setCourseDetailsMapGlobal] = useState<Record<string, any>>({});
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedNewCourses, setSelectedNewCourses] = useState<string[]>([]);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);

  // New Handlers
  const handleOpenAddCourse = async () => {
    setIsAddCourseOpen(true);
    if (allCourses.length === 0) {
      setIsFetchingCourses(true);
      try {
        const data = await apiClient.get<any[]>('/course/courses');
        setAllCourses(data);
      } catch (err) {
        toast.error("Failed to fetch courses");
      } finally {
        setIsFetchingCourses(false);
      }
    }
  };

  const handleSaveAddCourses = async () => {
    if (!studentDetail || !user?.userId) return;
    if (selectedNewCourses.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 khóa học.");
      return;
    }

    const updatedCourses = [...studentDetail.courses];
    let addedCount = 0;

    for (const cid of selectedNewCourses) {
      if (!updatedCourses.some(c => c.courseId === cid)) {
        const foundCourse = allCourses.find(c => c.courseId === cid);
        updatedCourses.push({
          courseId: cid,
          courseName: foundCourse?.courseName || foundCourse?.name || cid,
          gpa: null,
          examAttempts: null
        });
        addedCount++;
      }
    }

    if (addedCount === 0) {
      toast.info("Các khóa học này đã có trong hồ sơ của bạn.");
      setIsAddCourseOpen(false);
      return;
    }

    try {
      let dateVal: string | null = null;
      if (studentDetail.createdAt && studentDetail.createdAt !== "N/A") {
        const parsedDate = Date.parse(studentDetail.createdAt.replace(" ", "T"));
        if (!isNaN(parsedDate)) {
          dateVal = new Date(parsedDate).toISOString();
        }
      }

      const isStatusActive = typeof studentDetail.status === 'boolean'
        ? studentDetail.status
        : (typeof studentDetail.status === 'string' && (studentDetail.status.toLowerCase() === 'active' || studentDetail.status.toLowerCase() === 'true'));

      await apiClient.put(`/student/students/${user.userId}`, {
        fullName: studentDetail.name,
        email: studentDetail.email,
        role: studentDetail.role,
        status: isStatusActive,
        createdAt: dateVal,
        courses: updatedCourses
      });

      toast.success(`Đã thêm ${addedCount} khóa học thành công!`);
      setIsAddCourseOpen(false);
      setSelectedNewCourses([]);
      setCourseSearch("");
      fetchDetail();
    } catch (error: any) {
      console.error("Add Course Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || error.message || "Lỗi khi thêm khóa học.");
    }
  };

  const handleCloseAddCourseModal = (open: boolean) => {
    setIsAddCourseOpen(open);
    if (!open) {
      setSelectedNewCourses([]);
      setCourseSearch("");
    }
  };

  const filteredCourses = allCourses.filter(c =>
    (c.courseName && c.courseName.toLowerCase().includes(courseSearch.toLowerCase())) ||
    (c.courseCode && c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  useEffect(() => {
    if (window.location.hash === "#api-key-guide" || window.location.search.includes("openGuide")) {
      setIsGeminiGuideOpen(true);
      setTimeout(() => {
        document.getElementById('api-key-guide')?.scrollIntoView({ behavior: 'smooth' });
        // Clear hash and query so it doesn't trigger on refresh
        const url = new URL(window.location.href);
        url.hash = '';
        url.searchParams.delete('openGuide');
        window.history.replaceState({}, '', url.toString());
      }, 300);
    }
  }, []);

  const mockAvailableSkills = [
    "Java", "Python", "C#", "C++", "JavaScript", "TypeScript",
    "React", "Angular", "Vue", "Node.js", "Express", "Spring Boot",
    "Django", "Flask", ".NET", "SQL", "MySQL", "PostgreSQL",
    "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
    "GCP", "Git", "Machine Learning", "Data Science", "UI/UX Design",
    "Agile", "Scrum", "Communication", "Problem Solving", "HTML & CSS"
  ];

  const handleUpdateCourseRecord = async (courseId: string, gpaVal: string | number | null, attemptsVal: number) => {
    if (!studentDetail || !user?.userId) return;

    // If gpa is empty/null/whitespace, reject it!
    if (gpaVal === null || gpaVal === "" || gpaVal === undefined) {
      toast.error("GPA cannot be empty");
      fetchDetail(); // Reset input back to database values
      return;
    }

    // Validate GPA
    const gpaNum = parseFloat(gpaVal.toString());
    if (isNaN(gpaNum) || gpaNum < 5.0 || gpaNum > 10.0) {
      toast.error("GPA must be between 5.0 and 10.0");
      return;
    }

    // Validate attempts
    const attemptsNum = parseInt(attemptsVal.toString()) || 1;
    if (attemptsNum < 1) {
      toast.error("Attempts must be at least 1");
      return;
    }

    try {
      // Construct the payload for PUT api/student/students/{id}
      const updatedCourses = studentDetail.courses.map(c => {
        if (c.courseId === courseId) {
          return { courseId, gpa: gpaNum, examAttempts: attemptsNum };
        }
        return {
          courseId: c.courseId,
          gpa: c.gpa,
          examAttempts: c.examAttempts
        };
      });

      // If this course is not yet in studentDetail.courses (it was in-progress), add it!
      if (!studentDetail.courses.some(c => c.courseId === courseId)) {
        updatedCourses.push({ courseId, gpa: gpaNum, examAttempts: attemptsNum });
      }

      let dateVal: string | null = null;
      if (studentDetail.createdAt && studentDetail.createdAt !== "N/A") {
        const parsedDate = Date.parse(studentDetail.createdAt.replace(" ", "T"));
        if (!isNaN(parsedDate)) {
          dateVal = new Date(parsedDate).toISOString();
        }
      }

      const isStatusActive = typeof studentDetail.status === 'boolean'
        ? studentDetail.status
        : (typeof studentDetail.status === 'string' && (studentDetail.status.toLowerCase() === 'active' || studentDetail.status.toLowerCase() === 'true'));

      await apiClient.put(`/student/students/${user.userId}`, {
        fullName: studentDetail.name,
        email: studentDetail.email,
        role: studentDetail.role,
        status: isStatusActive,
        createdAt: dateVal,
        courses: updatedCourses
      });

      setRowEdits(prev => {
        const copy = { ...prev };
        delete copy[courseId];
        return copy;
      });

      toast.success("Course record updated successfully!");
      fetchDetail(); // Refresh data
    } catch (error) {
      toast.error("Failed to update course record.");
    }
  };

  const handleCancelRowEdit = (courseId: string) => {
    setRowEdits(prev => {
      const copy = { ...prev };
      delete copy[courseId];
      return copy;
    });
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!studentDetail || !user?.userId) return;
    try {
      const updatedCourses = studentDetail.courses.filter(c => c.courseId !== courseId);
      
      let dateVal: string | null = null;
      if (studentDetail.createdAt && studentDetail.createdAt !== "N/A") {
        const parsedDate = Date.parse(studentDetail.createdAt.replace(" ", "T"));
        if (!isNaN(parsedDate)) {
          dateVal = new Date(parsedDate).toISOString();
        }
      }

      const isStatusActive = typeof studentDetail.status === 'boolean'
        ? studentDetail.status
        : (typeof studentDetail.status === 'string' && (studentDetail.status.toLowerCase() === 'active' || studentDetail.status.toLowerCase() === 'true'));

      await apiClient.put(`/student/students/${user.userId}`, {
        fullName: studentDetail.name,
        email: studentDetail.email,
        role: studentDetail.role,
        status: isStatusActive,
        createdAt: dateVal,
        courses: updatedCourses
      });

      toast.success("Course removed successfully!");
      fetchDetail();
    } catch (error) {
      toast.error("Failed to remove course.");
    }
  };

  const handleSyncToGithub = () => {
    if (isSyncing) return;

    setIsSyncing(true);
    const notifId = openNotification("loading", "Syncing profile data with GitHub...");

    setTimeout(() => {
      setIsSyncing(false);
      if (syncMode === "success") {
        updateNotification(notifId, "success", "Syncing completed successfully! Your profile data is now up-to-date on GitHub.");
      } else {
        updateNotification(notifId, "error", "Error: Failed to sync with GitHub. Please check your connection or try again later.");
      }
    }, 1500); // added timeout so it looks real
  };

  const fetchDetail = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<StudentDetailDto>(`/student/students/${user.userId}`);
      setStudentDetail(data);
      setLocalTags(data.tags || []);

      try {
        const roadmapList = await apiClient.get<any[]>(`/Roadmap/user/${user.userId}`);
        if (roadmapList && roadmapList.length > 0) {
          const latestRoadmap = roadmapList[roadmapList.length - 1];
          const latestDetail = await apiClient.get<any>(`/Roadmap/${latestRoadmap.roadmapId}`);

          const allDetails = await Promise.all(
            roadmapList.map(r => apiClient.get<any>(`/Roadmap/${r.roadmapId}`).catch(() => null))
          );

          let aggregatedTotalHours = 0;
          let aggregatedCompletedHours = 0;

          // 1. Gather all unique course IDs across all roadmaps and student courses
          const uniqueCourseIds = new Set<string>();
          for (const detail of allDetails) {
            if (detail && detail.phases) {
              const flatNodes = detail.phases.flatMap((p: any) => p.nodes) || [];
              for (const node of flatNodes) {
                if (node.courseId) uniqueCourseIds.add(node.courseId);
              }
            }
          }
          if (data && data.courses) {
            for (const c of data.courses) {
              if (c.courseId) uniqueCourseIds.add(c.courseId);
            }
          }

          // 2. Fetch course details
          const courseDetailsMap: Record<string, any> = {};
          if (uniqueCourseIds.size > 0) {
            await Promise.all(
              Array.from(uniqueCourseIds).map(async (cid) => {
                try {
                  const details = await apiClient.get<any>(`/Course/${cid}`);
                  courseDetailsMap[cid] = details;
                  // Map by courseCode as well for robust check
                  if (details.courseCode) {
                    courseDetailsMap[details.courseCode] = details;
                  }
                } catch (err) {
                  // ignore
                }
              })
            );
          }
          setCourseDetailsMapGlobal(courseDetailsMap);

          // 3. Compute hours and courses
          let aggregatedTotalCourses = 0;
          let aggregatedCompletedCourses = 0;

          for (const detail of allDetails) {
            if (detail && detail.phases) {
              const flatNodes = detail.phases.flatMap((p: any) => p.nodes) || [];
              aggregatedTotalCourses += flatNodes.length;
              for (const node of flatNodes) {
                let nodeHours = 0;
                const cDetails = node.courseId ? courseDetailsMap[node.courseId] : null;

                if (cDetails?.totalStudyHours !== undefined) {
                  nodeHours = cDetails.totalStudyHours;
                } else if (node.courseDetails?.totalStudyHours !== undefined) {
                  nodeHours = node.courseDetails.totalStudyHours;
                } else {
                  const weeks = parseInt(node.duration) || 8;
                  nodeHours = weeks * 5;
                }

                aggregatedTotalHours += nodeHours;
                if (node.status === "COMPLETED" || node.status === "done" || node.state === "done") {
                  aggregatedCompletedHours += nodeHours;
                  aggregatedCompletedCourses += 1;
                }
              }
            }
          }

          const progressPercent = aggregatedTotalCourses === 0 ? 0 : Math.round((aggregatedCompletedCourses / aggregatedTotalCourses) * 100);

          setRoadmapProgress({
            roleName: "Overall Career",
            percent: progressPercent,
            completed: aggregatedCompletedCourses,
            total: aggregatedTotalCourses,
            totalHours: aggregatedTotalHours,
            completedHours: aggregatedCompletedHours
          });

          const idToCode: Record<string, string> = {};
          for (const detail of allDetails) {
            if (detail && detail.phases) {
              for (const phase of detail.phases) {
                if (phase.nodes) {
                  for (const node of phase.nodes) {
                    if (node.courseId && (node.courseCode || node.code)) {
                      idToCode[node.courseId] = node.courseCode || node.code;
                    }
                  }
                }
              }
            }
          }
          setCourseIdToCodeMap(idToCode);

          const combinedActiveNodes: any[] = [];
          const seenCourseIds = new Set<string>();

          for (const detail of allDetails) {
            if (detail && detail.phases) {
              const graph = mapDtoToGraph(detail);
              const activeOrLocked = graph.nodes
                .filter(n => n.data.state === "active" || n.data.state === "locked")
                .map(n => n.data);

              for (const node of activeOrLocked) {
                const identifier = node.courseId || node.courseCode || node.name;
                if (!seenCourseIds.has(identifier)) {
                  seenCourseIds.add(identifier);
                  combinedActiveNodes.push(node);
                }
              }
            }
          }

          setInProgressRoadmapCourses(combinedActiveNodes);
        }
      } catch (err) {
        console.error("Error fetching roadmap progress for dashboard:", err);
      }
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [user, token]);

  const handleRetry = () => {
    fetchDetail();
  };

  if (error) {
    return (
      <div className="p-6 md:p-8 min-h-full bg-transparent">
        <ErrorAlert title="Profile Loading Error" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  const completedCourses = studentDetail?.courses.filter(c => c.gpa !== null) || [];
  const completedCourseIds = new Set(completedCourses.map(c => c.courseId));
  const completedCourseCodes = new Set(completedCourses.map(c => {
    const detail = courseDetailsMapGlobal[c.courseId];
    return detail ? detail.courseCode : null;
  }).filter(Boolean));

  const checkCourseLocked = (courseId: string, courseCode?: string) => {
    const detail = courseDetailsMapGlobal[courseId] || courseDetailsMapGlobal[courseCode || ""];
    if (!detail) {
      console.log(`[checkCourseLocked] No detail found for ${courseId} / ${courseCode}`);
      return false;
    }
    const prereqStr = detail.prerequisites;
    if (!prereqStr || prereqStr === "Không có" || prereqStr === "None") {
      return false;
    }

    const prereqArr = prereqStr.split(/[,;]/).map((s: string) => s.trim()).filter((s: string) => s);
    const locked = prereqArr.some((p: string) => !completedCourseCodes.has(p) && !completedCourseIds.has(p));
    console.log(`[checkCourseLocked] Course ${courseId} (${courseCode}): prereqStr="${prereqStr}", locked=${locked}, completed=[${Array.from(completedCourseCodes).join(',')}]`);
    return locked;
  };

  const inProgressCourses = studentDetail?.courses.filter(c => c.gpa === null) || [];
  let displayInProgressRaw: any[] = [];
  if (inProgressRoadmapCourses !== null) {
    displayInProgressRaw = [...inProgressRoadmapCourses];
    inProgressCourses.forEach(ipc => {
      const ipcCode = (ipc as any).courseCode || courseDetailsMapGlobal[ipc.courseId]?.courseCode || (ipc as any).code;
      const isDuplicate = displayInProgressRaw.some(r => {
        const rCode = r.courseCode || courseDetailsMapGlobal[r.courseId]?.courseCode || r.code;
        const idMatch = r.courseId && ipc.courseId && String(r.courseId).toLowerCase() === String(ipc.courseId).toLowerCase();
        const codeMatch = rCode && ipcCode && String(rCode).toLowerCase() === String(ipcCode).toLowerCase();
        return idMatch || codeMatch;
      });
      if (!isDuplicate) {
        displayInProgressRaw.push({ ...ipc, _isIndependent: true });
      }
    });
  } else {
    displayInProgressRaw = [...inProgressCourses].map(c => ({ ...c, _isIndependent: true }));
  }

  // Recalculate state based on actual prerequisites completion ONLY for independent courses
  displayInProgressRaw = displayInProgressRaw.map(course => {
    if (!course._isIndependent && course.state) {
      return course; // Preserve roadmap adapter's lock logic
    }
    const cid = course.courseId || course.courseCode || course.code;
    const ccode = course.courseCode || course.code || courseDetailsMapGlobal[cid]?.courseCode;
    const isLocked = checkCourseLocked(cid, ccode);
    return {
      ...course,
      state: isLocked ? "locked" : "active"
    };
  });

  const displayInProgress = [...displayInProgressRaw].sort((a, b) => {
    const aLocked = a.state === "locked";
    const bLocked = b.state === "locked";
    if (aLocked && !bLocked) return 1;
    if (!aLocked && bLocked) return -1;
    return 0;
  });
  const tags = localTags;

  const handleToggleNewSkill = (skill: string) => {
    if (selectedNewSkills.includes(skill)) {
      setSelectedNewSkills(selectedNewSkills.filter(s => s !== skill));
    } else {
      setSelectedNewSkills([...selectedNewSkills, skill]);
    }
  };

  const handleSaveSelectedSkills = () => {
    if (selectedNewSkills.length === 0) {
      toast.info("Vui lòng chọn ít nhất 1 skill.");
      return;
    }
    const newTags = selectedNewSkills.filter(s => !tags.includes(s));
    if (newTags.length > 0) {
      setLocalTags([...tags, ...newTags]);
      toast.success(`Đã thêm ${newTags.length} skill thành công! (Dữ liệu tạm)`);
    } else {
      toast.info(`Các skill bạn chọn đều đã có trong hồ sơ.`);
    }
    setIsAddSkillOpen(false);
    setSelectedNewSkills([]);
    setSkillSearch("");
  };

  const handleCloseAddModal = (open: boolean) => {
    setIsAddSkillOpen(open);
    if (!open) {
      setSelectedNewSkills([]);
      setSkillSearch("");
    }
  };

  const filteredMockSkills = mockAvailableSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()));

  const gpaCourses = studentDetail?.courses.filter(c => c.gpa != null && c.gpa > 0) || [];
  const avgGpa = gpaCourses.length > 0 ? (gpaCourses.reduce((sum, c) => sum + (c.gpa || 0), 0) / gpaCourses.length).toFixed(2) : "0.00";

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-full bg-transparent transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
            Profile & Transcript Management
          </h2>
          <p className="text-[13px] text-[#64748B]">
            Workspace - Academic Year: 2024 - 2025
          </p>
        </div>

        {/* Syncing to GitHub Button & Simulator */}
        <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-2xl shadow-[0_2px_8px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold border-r border-[#E2E8F0] pr-3 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Simulate:
            <select
              value={syncMode}
              onChange={(e) => setSyncMode(e.target.value as "success" | "error")}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="success">Success (Happy)</option>
              <option value="error">Fail (Unhappy)</option>
            </select>
          </div>

          <button
            onClick={handleSyncToGithub}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] ${isSyncing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            style={{ background: "linear-gradient(to right, #3B28CC, #6366F1)" }}
          >
            <Github size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync to GitHub"}
          </button>
        </div>
      </div>

      {/* ── TOP TIER: 2-column layout (Student Card | Stats) ── */}
      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "320px 1fr" }}>
        {/* Left: Student Profile */}
        <StudentProfileCard studentDetail={studentDetail} />

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
                {/* Progress Bars */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Average GPA */}
                  <div className="border border-[#E2E8F0] bg-white rounded-xl p-4 relative overflow-hidden transition-colors flex flex-col justify-between">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B28CC]" />
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-bold text-[#0F172A] truncate pr-2">Average GPA</span>
                      <span className="bg-[#E0E7FF] text-[#3B28CC] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">Scale 10.0</span>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-black text-[#3B28CC] leading-none">{avgGpa}</span>
                    </div>
                  </div>

                  {/* Roadmap Progress */}
                  <div className="border border-[#E2E8F0] bg-white rounded-xl p-4 relative overflow-hidden transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]" />
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[13px] font-bold text-[#0F172A] pr-2 leading-tight">
                        {roadmapProgress ? `${roadmapProgress.roleName} Progress` : "Overall Career Progress"}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-semibold text-[#64748B]">Overall Progress</span>
                      <span className="text-[11px] font-bold text-[#0F172A]">{roadmapProgress ? roadmapProgress.percent : 0}%</span>
                    </div>
                    <Progress value={roadmapProgress ? roadmapProgress.percent : 0} className="h-1.5 bg-[#E2E8F0] [&>[data-slot=progress-indicator]]:bg-[#10B981]" />
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-5 border-t border-[#E2E8F0]">
                  <div className="flex justify-between text-center divide-x divide-[#E2E8F0]">
                    <div className="flex-1">
                      <p className="text-[24px] font-bold text-[#3B28CC]">{tags.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">SKILLS</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[24px] font-bold text-[#10B981]">{completedCourses.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">COMPLETED</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-[24px] font-bold text-[#0F172A] leading-none">
                          {roadmapProgress ? roadmapProgress.completedHours : (completedCourses.length * 45)}
                        </span>
                        {roadmapProgress && (
                          <span className="text-[14px] font-semibold text-[#64748B] leading-none">
                            /{roadmapProgress.totalHours}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mt-0.5">STUDY HOUR</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Acquired Skills Card */}
          <Card className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-6 flex flex-col transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#3B28CC]" strokeWidth={2.5} />
                <h4 className="text-[16px] font-bold text-[#0F172A]">Acquired Skills</h4>
              </div>
              <button
                onClick={() => setIsAddSkillOpen(true)}
                className="flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E0E7FF] hover:border-[#C7D2FE] text-[#3B28CC] text-[13px] font-bold h-8 px-3 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
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
                {tags.length > 0 ? (
                  (isExpandedSkills ? tags : tags.slice(0, 5)).map((s) => (
                    <SkillTag key={s} label={s} />
                  ))
                ) : (
                  <span className="text-sm text-slate-500 font-medium">No skills acquired yet.</span>
                )}
                {tags.length > 5 && !isExpandedSkills && (
                  <button
                    onClick={() => setIsExpandedSkills(true)}
                    className="text-xs text-[#3B28CC] font-bold px-2.5 py-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-full border border-[#C7D2FE] transition-colors cursor-pointer"
                  >
                    + {tags.length - 5} more skills
                  </button>
                )}
                {isExpandedSkills && tags.length > 5 && (
                  <button
                    onClick={() => setIsExpandedSkills(false)}
                    className="text-xs text-[#64748B] font-bold px-2.5 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-full border border-[#E2E8F0] transition-colors cursor-pointer"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
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
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {loading ? (
              <Skeleton className="h-5 w-14 rounded-full" />
            ) : (
              <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
                {displayInProgress.length} Active
              </span>
            )}
            <button
              onClick={handleOpenAddCourse}
              className="flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E0E7FF] hover:border-[#C7D2FE] text-[#3B28CC] text-[12px] font-bold h-7 px-3 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Course
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] pr-[15px]">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Name</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Code</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Attempts</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">GPA</TableHead>
                  <TableHead className="px-5 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <div className="[&>div]:max-h-[350px] [&>div]:overflow-y-scroll [&>div]:overflow-x-hidden [&>div]:custom-scrollbar">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
              </colgroup>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i} className="border-t border-[#E2E8F0]">
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : displayInProgress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm text-slate-500 font-medium">
                      No in-progress courses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayInProgress.map((course: any, i: number) => {
                    const isLocked = course.state === "locked" || (course.state === undefined && (course.status === "PENDING" || course.status === "pending"));
                    return (
                      <TableRow key={course.nodeId || course.courseId || i} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50 transition-colors">
                        <TableCell className="px-5 py-3 align-middle whitespace-normal break-words">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-[13px] text-[#0F172A] font-bold">{course.name || course.courseName}</span>
                            {(() => {
                              const prereqs = course.prerequisite || course.courseDetails?.prerequisites || courseDetailsMapGlobal[course.courseId || course.courseCode || course.code]?.prerequisites;
                              const hasPrerequisite = prereqs && prereqs.trim() !== "" && prereqs !== "Không có" && prereqs !== "None";
                              if (hasPrerequisite) {
                                return (
                                  <span className="bg-[#FEF9C3] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md w-fit flex items-center">
                                    * Prerequisite
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-middle text-center">
                          {course.code || course.courseCode || course.courseId || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-middle text-center">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min="1"
                              value={(() => {
                                const cid = course.courseId || course.courseCode || course.code;
                                return rowEdits[cid]?.examAttempts ?? "";
                              })()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const cid = course.courseId || course.courseCode || course.code;
                                if (cid) {
                                  setRowEdits(prev => ({
                                    ...prev,
                                    [cid]: {
                                      gpa: prev[cid]?.gpa ?? "",
                                      examAttempts: val
                                    }
                                  }));
                                }
                              }}
                              placeholder="1"
                              disabled={isLocked}
                              className="h-8 w-16 text-center border-gray-300 focus:ring-blue-500 rounded-md disabled:bg-slate-50 disabled:text-slate-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const cid = course.courseId || course.courseCode || course.code;
                                  const edit = rowEdits[cid];
                                  if (edit && edit.gpa) {
                                    handleUpdateCourseRecord(cid, edit.gpa, edit.examAttempts);
                                  }
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3 align-middle text-center">
                          <div className="flex justify-center">
                            <GpaInput
                              placeholder="—"
                              value={(() => {
                                const cid = course.courseId || course.courseCode || course.code;
                                return rowEdits[cid]?.gpa ?? "";
                              })()}
                              onChange={(e) => {
                                const val = e.target.value;
                                const cid = course.courseId || course.courseCode || course.code;
                                if (cid) {
                                  setRowEdits(prev => ({
                                    ...prev,
                                    [cid]: {
                                      gpa: val,
                                      examAttempts: prev[cid]?.examAttempts ?? 1
                                    }
                                  }));
                                }
                              }}
                              disabled={isLocked}
                              className="w-20 text-center bg-white disabled:bg-slate-50 disabled:text-slate-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const cid = course.courseId || course.courseCode || course.code;
                                  const edit = rowEdits[cid];
                                  if (edit && edit.gpa) {
                                    handleUpdateCourseRecord(cid, edit.gpa, edit.examAttempts);
                                  }
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-3 align-middle text-right flex items-center justify-end gap-2">
                          {(() => {
                            const cid = course.courseId || course.courseCode || course.code;
                            const edit = rowEdits[cid];
                            if (edit) {
                              return (
                                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                  {edit.gpa && (
                                    <button
                                      onClick={() => handleUpdateCourseRecord(cid, edit.gpa, edit.examAttempts)}
                                      className="bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#16A34A] p-1.5 rounded-lg border border-[#BBF7D0] transition-colors"
                                      title="Lưu điểm môn học"
                                    >
                                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCancelRowEdit(cid)}
                                    className="bg-[#FFE4E6] hover:bg-[#fecdd3] text-[#E11D48] p-1.5 rounded-lg border border-[#FECDD3] transition-colors"
                                    title="Hủy thay đổi"
                                  >
                                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </button>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {course.state === "locked" || (course.state === undefined && (course.status === "PENDING" || course.status === "pending")) ? (
                            <span className="bg-[#F1F5F9] text-[#64748B] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#E2E8F0]">
                              Locked
                            </span>
                          ) : (
                            <span className="bg-[#E0E7FF] text-[#3B28CC] px-2.5 py-1 rounded-full text-[11px] font-bold">
                              In Progress
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
              {completedCourses.length} Completed
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] pr-[15px]">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Name</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Course Code</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Attempts</TableHead>
                  <TableHead className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">GPA</TableHead>
                  <TableHead className="px-5 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[#64748B] h-auto whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <div className="[&>div]:max-h-[350px] [&>div]:overflow-y-scroll [&>div]:overflow-x-hidden [&>div]:custom-scrollbar">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
              </colgroup>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i} className="border-t border-[#E2E8F0]">
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : completedCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm text-slate-500 font-medium">
                      No completed courses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  completedCourses.map((course) => (
                    <TableRow key={course.courseId} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]/50 transition-colors">
                      <TableCell className="px-5 py-3 align-middle whitespace-normal break-words">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[13px] text-[#0F172A] font-bold">{course.courseName}</span>
                          {(() => {
                            const prereqs = courseDetailsMapGlobal[course.courseId]?.prerequisites;
                            const hasPrerequisite = prereqs && prereqs.trim() !== "" && prereqs !== "Không có" && prereqs !== "None";
                            if (hasPrerequisite) {
                              return (
                                <span className="bg-[#FEF9C3] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md w-fit flex items-center">
                                  * Prerequisite
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-[12px] font-mono text-[#64748B] font-medium align-middle text-center">
                        {courseIdToCodeMap[course.courseId] || course.courseId}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-[12px] text-[#334155] font-medium align-middle text-center">
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min="1"
                            value={rowEdits[course.courseId]?.examAttempts ?? course.examAttempts ?? 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setRowEdits(prev => ({
                                ...prev,
                                [course.courseId]: {
                                  gpa: (prev[course.courseId]?.gpa ?? course.gpa?.toString()) || "",
                                  examAttempts: val
                                }
                              }));
                            }}
                            className="h-8 w-16 text-center border-gray-300 focus:ring-blue-500 rounded-md"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const edit = rowEdits[course.courseId];
                                if (edit) {
                                  handleUpdateCourseRecord(course.courseId, edit.gpa, edit.examAttempts);
                                }
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 align-middle text-center">
                        <div className="flex justify-center">
                          <GpaInput
                            value={(rowEdits[course.courseId]?.gpa ?? course.gpa?.toString()) || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRowEdits(prev => ({
                                ...prev,
                                [course.courseId]: {
                                  gpa: val,
                                  examAttempts: (prev[course.courseId]?.examAttempts ?? course.examAttempts) ?? 1
                                }
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const edit = rowEdits[course.courseId];
                                if (edit) {
                                  handleUpdateCourseRecord(course.courseId, edit.gpa, edit.examAttempts);
                                }
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rowEdits[course.courseId] && (
                            <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={() => {
                                  const edit = rowEdits[course.courseId];
                                  if (edit) {
                                    handleUpdateCourseRecord(course.courseId, edit.gpa, edit.examAttempts);
                                  }
                                }}
                                className="bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#16A34A] p-1.5 rounded-lg border border-[#BBF7D0] transition-colors"
                                title="Lưu thay đổi"
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleCancelRowEdit(course.courseId)}
                                className="bg-[#FFE4E6] hover:bg-[#fecdd3] text-[#E11D48] p-1.5 rounded-lg border border-[#FECDD3] transition-colors"
                                title="Hủy thay đổi"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                          <span className="bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full text-[11px] font-bold">
                            Done
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Gemini API Key Guide (Footer Card) */}
      <Card id="api-key-guide" className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-4 flex flex-col transition-colors duration-300 scroll-mt-6">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsGeminiGuideOpen(!isGeminiGuideOpen)}
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#3B28CC]" strokeWidth={2.5} />
            <h4 className="text-[14px] font-bold text-[#0F172A]">Gemini API Key Guide</h4>
          </div>
          <button className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-full border border-[#E2E8F0]">
            {isGeminiGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isGeminiGuideOpen && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3 pt-3 border-t border-[#E2E8F0] animate-in fade-in duration-300">
            <div className="flex flex-col gap-1.5 max-w-sm">
              <p className="text-[11px] text-[#64748B] leading-tight">
                Configure your Gemini API Key to unlock AI features.
              </p>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E0E7FF] hover:border-[#C7D2FE] text-[#3B28CC] text-[11px] font-bold h-7 px-3 rounded-lg transition-colors w-fit"
              >
                Open AI Studio
              </a>
            </div>

            <div className="flex-1 bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] w-full sm:w-auto">
              <ol className="list-decimal pl-4 space-y-1 text-[11.5px] text-[#334155] font-medium marker:text-[#3B28CC] marker:font-bold">
                <li>Go to Google AI Studio & sign in.</li>
                <li>Open <strong>API Keys</strong> section.</li>
                <li>Click <strong>Create a new API key</strong> & copy it.</li>
                <li>Paste it into the AI Configuration in settings.</li>
              </ol>
            </div>
          </div>
        )}
      </Card>

      {/* Add Skill Modal (Mock) */}
      <Dialog open={isAddSkillOpen} onOpenChange={handleCloseAddModal}>
        <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Acquired Skills</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                placeholder="Search skills (e.g. Java, Python...)"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="overflow-y-auto max-h-[300px] border border-[#E2E8F0] rounded-lg p-2 space-y-1">
              {filteredMockSkills.length > 0 ? (
                filteredMockSkills.map(skill => {
                  const isSelected = selectedNewSkills.includes(skill);
                  const isAlreadyAcquired = tags.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => !isAlreadyAcquired && handleToggleNewSkill(skill)}
                      disabled={isAlreadyAcquired}
                      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded transition-colors flex items-center justify-between group
                        ${isAlreadyAcquired ? 'opacity-50 cursor-not-allowed bg-[#F8FAFC]' :
                          isSelected ? 'bg-[#EEF2FF] text-[#3B28CC]' : 'text-[#334155] hover:bg-[#F1F5F9]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center
                          ${isSelected ? 'bg-[#3B28CC] border-[#3B28CC]' : 'border-[#CBD5E1]'}`}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        {skill} {isAlreadyAcquired && "(Already acquired)"}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-4 text-[13px] text-[#64748B]">
                  No matching skills found
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleCloseAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSelectedSkills} className="bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white">
              Add {selectedNewSkills.length > 0 ? `(${selectedNewSkills.length})` : ""} Skills
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Course Modal */}
      <Dialog open={isAddCourseOpen} onOpenChange={handleCloseAddCourseModal}>
        <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add Courses</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                placeholder="Search courses (e.g. PRJ301...)"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="overflow-y-auto max-h-[450px] border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg p-3">
              {isFetchingCourses ? (
                <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3B28CC]"></div></div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCourses.map(course => {
                    const isSelected = selectedNewCourses.includes(course.courseId);
                    const isAlreadyAcquired = studentDetail?.courses.some(c => c.courseId === course.courseId);
                    return (
                      <label
                        key={course.courseId}
                        className={`relative flex items-start p-3 border rounded-xl cursor-pointer transition-all shadow-sm ${isAlreadyAcquired
                          ? 'bg-slate-100 border-slate-200 opacity-60'
                          : isSelected
                            ? 'bg-white border-[#3B28CC] ring-1 ring-[#3B28CC]'
                            : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-md'
                          }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[#CBD5E1] text-[#3B28CC] focus:ring-[#3B28CC] cursor-pointer"
                            checked={isSelected || isAlreadyAcquired}
                            disabled={isAlreadyAcquired}
                            onChange={() => {
                              if (isSelected) setSelectedNewCourses(selectedNewCourses.filter(id => id !== course.courseId));
                              else setSelectedNewCourses([...selectedNewCourses, course.courseId]);
                            }}
                          />
                        </div>
                        <div className="ml-3 flex flex-col min-w-0">
                          <span className={`text-[13px] font-bold truncate leading-tight ${isAlreadyAcquired ? 'text-slate-500' : 'text-slate-900'}`} title={course.courseName}>
                            {course.courseName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono mt-1">
                            {course.courseCode}
                          </span>
                          {isAlreadyAcquired && (
                            <span className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Added</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[#64748B]">No courses found.</div>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E2E8F0] gap-3">
              <button
                onClick={() => handleCloseAddCourseModal(false)}
                className="px-4 py-2 text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddCourses}
                className="px-5 py-2 bg-[#3B28CC] hover:bg-[#2e1f9e] text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm"
              >
                Add Courses ({selectedNewCourses.length})
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
