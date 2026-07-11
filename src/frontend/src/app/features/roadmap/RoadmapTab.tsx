import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, Lock, ChevronDown, ChevronUp, Pencil, Save, Trash2, Briefcase, Loader2, Map, Plus, CalendarDays } from "lucide-react";
import { GoalNode } from "./components/GoalNode";
import { RoadmapNode } from "./components/RoadmapNode";
import { CourseCard } from "./components/CourseCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ErrorAlert } from "@/app/components/common/ErrorAlert";
import confetti from "canvas-confetti";

import { COLORS } from "@/shared/constants/colors";
import type { NodeState, CourseNode } from "@/app/types";
import { CourseContext } from "@/app/data/CourseContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { apiClient } from "@/shared/api/apiClient";
import { useNotification } from "@/shared/contexts/NotificationContext";

import { useMemo } from "react";
import { RoadmapCanvas } from "./components/RoadmapCanvas";
import { mapDtoToGraph } from "./core/roadmapAdapter";
import { PhaseBasedLayoutEngine } from "./core/phaseBasedEngine";
import { SkillAnalyticsDashboard } from "./components/SkillAnalyticsDashboard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";


const ROADMAP_GOALS: Record<string, { title: string; subtitle: string }> = {
  "Backend Developer Path": {
    title: "Backend Developer",
    subtitle: "Java · APIs · Cloud",
  },
  "Full-Stack Engineer Path": {
    title: "Full-Stack Engineer",
    subtitle: "React · Node · DB",
  },
  "Data Engineering Path": {
    title: "Data Engineer",
    subtitle: "Python · SQL · Cloud",
  },
};

/* ─────────────────────────────────────── */

const PHASE_COLORS = [
  { textColor: "#4CAF50", bg: "#F0FDF4" },
  { textColor: "#3B82F6", bg: "#EFF6FF" },
  { textColor: "#8B5CF6", bg: "#F5F3FF" },
];

export default function MyRoadmaps() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId || "student-001";
  const { openNotification } = useNotification();
  const [checkedOverdueRoadmapId, setCheckedOverdueRoadmapId] = useState<string>("");

  const [roadmaps, setRoadmaps] = useState<{ roadmapId: string; targetRoleName: string }[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null); // State chứa dữ liệu thật
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPhaseBoard, setShowPhaseBoard] = useState(true);
  const [showCongratModal, setShowCongratModal] = useState(false);
  const [studentSkills, setStudentSkills] = useState<string[]>([]);

  const fetchStudentSkills = async () => {
    if (!userId) return;
    try {
      const data = await apiClient.get<any>(`/student/students/${userId}`);
      if (data && data.tags) {
        setStudentSkills(data.tags);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin kỹ năng sinh viên:", err);
    }
  };

  useEffect(() => {
    void fetchStudentSkills();
    const handleGpaUpdate = () => {
      void fetchStudentSkills();
    };
    window.addEventListener('gpa_updated', handleGpaUpdate);
    return () => {
      window.removeEventListener('gpa_updated', handleGpaUpdate);
    };
  }, [userId]);

  const handleDeleteRoadmap = async () => {
    if (!selectedRoadmapId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/Roadmap/${selectedRoadmapId}`);
      const updatedList = roadmaps.filter((r) => r.roadmapId !== selectedRoadmapId);
      setRoadmaps(updatedList);
      if (updatedList.length > 0) {
        setSelectedRoadmapId(updatedList[0].roadmapId);
      } else {
        setSelectedRoadmapId("");
        setRoadmapData(null);
      }
    } catch (err) {
      console.error("Lỗi xóa roadmap:", err);
      setError("Không thể xóa lộ trình. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateNodeState = (nodeId: string, newStatus: NodeState, gpa?: number) => {
    if (!roadmapData) return;

    // Chuyển đổi trạng thái từ UI sang trạng thái DTO tương ứng của Database:
    // database chỉ chấp nhận 'PENDING' hoặc 'COMPLETED'
    const newDtoStatus = newStatus === "done" ? "COMPLETED" : "PENDING";

    // 1. Thu thập tất cả các Node trong lộ trình phẳng để duyệt tìm quan hệ cha-con
    const flatNodes = roadmapData.phases.flatMap((p: any) => p.nodes);

    // 2. Lưu trữ danh sách cần cập nhật dưới dạng Map
    const statusUpdates: Record<string, { status: string, gpa?: number }> = {};
    statusUpdates[nodeId] = { status: newDtoStatus, gpa };

    // Nếu người dùng hủy hoàn thành (chuyển sang PENDING), chúng ta cần khóa đệ quy tất cả các môn nối sau
    if (newDtoStatus === "PENDING") {
      const updateDescendants = (parentId: string) => {
        const children = flatNodes.filter((n: any) => n.parentNodeId === parentId);
        for (const child of children) {
          statusUpdates[child.nodeId] = { status: "PENDING" };
          updateDescendants(child.nodeId);
        }
      };
      updateDescendants(nodeId);
    }

    // Lấy localStorage hiện tại
    const storageKey = `gpa_roadmap_${roadmapData.roadmapId}`;
    const storedGpasStr = localStorage.getItem(storageKey);
    const storedGpas = storedGpasStr ? JSON.parse(storedGpasStr) : {};

    // Cập nhật gpa vào localStorage
    Object.entries(statusUpdates).forEach(([id, data]) => {
      if (data.status === "COMPLETED" && data.gpa !== undefined) {
        storedGpas[id] = data.gpa;
      } else if (data.status === "PENDING") {
        delete storedGpas[id];
      }
    });
    localStorage.setItem(storageKey, JSON.stringify(storedGpas));

    // 3. Áp dụng toàn bộ thay đổi trạng thái mới vào state roadmapData
    const updatedPhases = roadmapData.phases.map((phase: any) => ({
      ...phase,
      nodes: phase.nodes.map((node: any) =>
        statusUpdates[node.nodeId] !== undefined
          ? { ...node, status: statusUpdates[node.nodeId].status, gpa: statusUpdates[node.nodeId].gpa ?? node.gpa }
          : node
      ),
    }));

    // Tính toán lại xem đã đạt 100% chưa
    const updatedFlatNodes = updatedPhases.flatMap((p: any) => p.nodes);
    const completedCount = updatedFlatNodes.filter((n: any) => n.status === "COMPLETED" || n.status === "done").length;
    const totalCount = updatedFlatNodes.length;

    if (totalCount > 0 && completedCount === totalCount && newDtoStatus === "COMPLETED") {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 9999
      });
      setShowCongratModal(true);
    }

    setRoadmapData({
      ...roadmapData,
      phases: updatedPhases,
    });

    // 4. Gửi yêu cầu cập nhật lên Database nếu là roadmap thực tế
    if (selectedRoadmapId && !selectedRoadmapId.startsWith("preview-")) {
      const updates = Object.entries(statusUpdates).map(([nid, data]) => ({
        nodeId: nid,
        status: data.status,
        gpa: data.gpa
      }));

      apiClient.put("/Roadmap/update-nodes-status", {
        roadmapId: selectedRoadmapId,
        updates: updates
      }).then(() => {
        const targetNode = flatNodes.find((n: any) => n.nodeId === nodeId);
        if (targetNode && targetNode.courseId) {
          return apiClient.put("/student/course-grade", {
            courseId: targetNode.courseId,
            gpa: newDtoStatus === "COMPLETED" ? gpa : null,
            examAttempts: 1
          });
        }
      }).then(() => {
        window.dispatchEvent(new Event('roadmap_updated'));
        window.dispatchEvent(new Event('gpa_updated'));
      }).catch((err) => {
        console.error("Lỗi cập nhật trạng thái node trên Database:", err);
      });
    } else {
      window.dispatchEvent(new Event('roadmap_updated'));
      window.dispatchEvent(new Event('gpa_updated'));
    }
  };


  // 1. Lấy danh sách Roadmap từ Database
  useEffect(() => {
    async function fetchUserRoadmaps() {
      try {
        const data = await apiClient.get<any[]>(`/Roadmap/user/${userId}`);
        // data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        data.reverse();
        if (data && data.length > 0) {
          setRoadmaps(data);
          setSelectedRoadmapId(data[0].roadmapId);
        } else {
          setRoadmaps([]);
          setSelectedRoadmapId("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách roadmap:", err);
        setRoadmaps([]);
        setSelectedRoadmapId("");
        setLoading(false);
      }
    }
    void fetchUserRoadmaps();
  }, [userId]);

  // 2. Lấy chi tiết Roadmap được chọn
  useEffect(() => {
    if (!selectedRoadmapId) return;

    async function fetchRoadmapDetail() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.get<any>(`/Roadmap/${selectedRoadmapId}`);
        console.log("[RoadmapDetail] Raw roadmap loaded:", data);
        setRoadmapData(data);

        // Fetch course details for all nodes in the background
        const uniqueCourseIds = new Set<string>();
        if (data?.phases) {
          data.phases.forEach((p: any) => {
            if (p?.nodes) {
              p.nodes.forEach((n: any) => {
                if (n.courseId) uniqueCourseIds.add(n.courseId);
              });
            }
          });
        }

        console.log("[RoadmapDetail] Unique Course IDs found:", Array.from(uniqueCourseIds));

        if (uniqueCourseIds.size > 0) {
          const courseDetailsMap: Record<string, any> = {};
          await Promise.all(
            Array.from(uniqueCourseIds).map(async (cid) => {
              try {
                const details = await apiClient.get<any>(`/Course/${cid}`);
                console.log(`[RoadmapDetail] Fetched course details for ${cid}:`, details);
                courseDetailsMap[cid] = details;
              } catch (err) {
                console.error(`[RoadmapDetail] Failed to fetch course details for ${cid}:`, err);
              }
            })
          );

          // Load GPA từ localStorage bù vào
          const storageKey = `gpa_roadmap_${selectedRoadmapId}`;
          const storedGpasStr = localStorage.getItem(storageKey);
          const storedGpas = storedGpasStr ? JSON.parse(storedGpasStr) : {};

          // Update roadmap data with course details
          const enrichedPhases = data.phases.map((p: any) => ({
            ...p,
            nodes: p.nodes?.map((n: any) => {
              const details = n.courseId ? courseDetailsMap[n.courseId] : null;
              return {
                ...n,
                courseDetails: details,
                gpa: n.gpa !== undefined && n.gpa !== null ? n.gpa : storedGpas[n.nodeId],
              };
            }) || [],
          }));

          console.log("[RoadmapDetail] Setting enriched phases:", enrichedPhases);

          setRoadmapData((prev: any) => {
            if (!prev || prev.roadmapId !== selectedRoadmapId) return prev;
            return {
              ...prev,
              phases: enrichedPhases,
            };
          });
        }
      } catch (err) {
        console.error("Lỗi load chi tiết roadmap:", err);
        setRoadmapData(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchRoadmapDetail();
  }, [selectedRoadmapId]);

  // Check for overdue course deadlines when roadmap data is loaded
  useEffect(() => {
    if (!roadmapData || !roadmapData.phases || roadmapData.roadmapId === checkedOverdueRoadmapId) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const overdueCourses: { name: string; deadline: string }[] = [];

    roadmapData.phases.forEach((phase: any) => {
      if (phase.nodes) {
        phase.nodes.forEach((node: any) => {
          if (node.deadline) {
            console.log(`[Deadline Check] Course: ${node.courseName || node.courseCode || "Unknown"}, Deadline: ${node.deadline}, Status: ${node.status}`);
          }
          const isCompleted = node.status === "COMPLETED" || node.status === "done";
          if (!isCompleted && node.deadline) {
            const nodeDeadlineStr = node.deadline.split("T")[0];
            if (nodeDeadlineStr < todayStr) {
              overdueCourses.push({
                name: node.courseName || node.courseCode || "Unknown Course",
                deadline: nodeDeadlineStr,
              });
            }
          }
        });
      }
    });

    if (overdueCourses.length > 0) {
      overdueCourses.forEach((course) => {
        openNotification(
          "warning",
          `Course "${course.name}" is overdue! Deadline: ${course.deadline}`
        );
      });
    }

    setCheckedOverdueRoadmapId(roadmapData.roadmapId);
  }, [roadmapData, checkedOverdueRoadmapId, openNotification]);

  // Map phases dynamically from the API
  const zones = roadmapData?.phases?.map((p: any, i: number) => {
    const colorTheme = PHASE_COLORS[i % PHASE_COLORS.length] || PHASE_COLORS[0];
    return {
      label: `PHASE ${i + 1}`,
      sub: p.phaseName,
      textColor: colorTheme.textColor,
      bg: colorTheme.bg
    };
  }) || [];



  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const goal = useMemo(() => {
    if (!roadmapData) return { title: "Career Path", subtitle: "" };
    return {
      title: roadmapData.targetRoleName,
      subtitle: roadmapData.targetRoleName === "Backend Developer" ? "Java · APIs · Cloud" : "Personalized Path"
    };
  }, [roadmapData]);

  const stats = useMemo(() => {
    if (!roadmapData) return { totalCourses: 0, totalHours: 0, progress: 0 };
    const flatNodes = roadmapData.phases?.flatMap((p: any) => p.nodes) || [];
    const totalCourses = flatNodes.length;
    const totalHours = flatNodes.reduce((acc: number, node: any) => {
      if (node.courseDetails?.totalStudyHours !== undefined) {
        return acc + node.courseDetails.totalStudyHours;
      }
      const weeks = parseInt(node.duration) || 8; 
      return acc + (weeks * 5); // Tạm tính 1 week = 5 hours
    }, 0);
    const completedCourses = flatNodes.filter((n: any) => n.status === "COMPLETED" || n.status === "done").length;
    const progress = totalCourses === 0 ? 0 : Math.round((completedCourses / totalCourses) * 100);

    return { totalCourses, totalHours, progress };
  }, [roadmapData]);

  //chúc mừng mỗi khi load roadmap
  // useEffect(() => {
  //   if (stats.progress === 100) {
  //     confetti({
  //       particleCount: 200,
  //       spread: 100,
  //       origin: { y: 0.6 },
  //       zIndex: 9999
  //     });
  //     setShowCongratModal(true);
  //   }
  // }, [stats.progress, selectedRoadmapId]);

  // 1. Chạy Layout Engine để chuyển DTO thành Graph có tọa độ
  const computedGraph = useMemo(() => {
    if (!roadmapData) return null; // Ngăn lỗi sập ứng dụng
    const graph = mapDtoToGraph(roadmapData);
    const engine = new PhaseBasedLayoutEngine();
    return engine.layout(graph);
  }, [roadmapData]);

  // Determine full horizontal width needed for the SVG and Container
  const totalSvgWidth = computedGraph?.zones 
    ? computedGraph.zones[computedGraph.zones.length - 1].x + computedGraph.zones[computedGraph.zones.length - 1].width 
    : 1000;
  
  const containerMinWidth = totalSvgWidth + "px";

  // const byZone = (z: number) => NODES.filter((n) => n.zone === z);

  if (error) {
    return (
      <div className="p-8 min-h-full bg-transparent transition-colors duration-300">
        <ErrorAlert title="Roadmap Load Error" message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <CourseContext.Provider value={{ updateNodeState: handleUpdateNodeState }}>
      <div className="p-8 space-y-6 min-h-full bg-transparent transition-colors duration-300">

      {(!loading && roadmaps.length === 0) ? (
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] p-16 flex flex-col items-center justify-center text-center h-[60vh]">
          <Map className="w-20 h-20 text-[#CBD5E1] mb-6" />
          <h3 className="text-2xl font-bold text-[#0F172A] mb-3">No roadmap available</h3>
          <p className="text-[#64748B] mb-8 max-w-[420px] text-sm leading-relaxed">
            You haven't created any career roadmaps yet. Let our AI Virtual Mentor guide you to build a personalized path for your dream career.
          </p>
          <button
            onClick={() => navigate("/dashboard/mentor")}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold transition-transform hover:scale-105 shadow-sm"
            style={{ background: "linear-gradient(to right, #3B28CC, #6366f1)" }}
          >
            <Plus className="w-5 h-5" />
            Create Roadmap
          </button>
        </div>
      ) : (
        <>
      {/* ── Section 1: Management Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4 flex-wrap transition-colors duration-300">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
            Select Active Roadmap
          </label>
          <div className="relative">
            {loading ? (
              <Skeleton className="h-9 w-44 rounded-lg" />
            ) : (
              <>
                <select
                  value={selectedRoadmapId}
                  onChange={(e) => setSelectedRoadmapId(e.target.value)}
                  className="appearance-none pr-8 pl-3 py-2 rounded-lg border text-sm text-gray-800 focus:outline-none cursor-pointer border-[#E2E8F0] bg-[#F8FAFC] font-medium transition-colors"
                >
                  {roadmaps.map((r) => <option key={r.roadmapId} value={r.roadmapId}>{r.targetRoleName}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={!selectedRoadmapId || isDeleting}
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} 
            Delete
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {/* Progress Bar */}
          <div className="flex flex-col gap-1 w-40 md:w-56">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-700">Progress</span>
              <span className="text-[10px] font-bold" style={{ color: COLORS.BLUE_PRIMARY }}>{stats.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.progress}%`, background: COLORS.BLUE_PRIMARY }}
              />
            </div>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hidden sm:inline">Total:</span>
            {loading ? (
              <Skeleton className="h-3 w-16 rounded" />
            ) : (
              <span className="text-[11px] text-blue-900 font-black tracking-tight">
                {stats.totalCourses} Courses • {stats.totalHours} Hrs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Canvas and Goal ── */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 h-fit bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto w-full">
            <div style={{ width: containerMinWidth, minWidth: "100%" }}>

              {/* Zone label header — scrolls with the map */}
              <div style={{ display: "flex", width: "100%", background: "white" }}>
                {zones.map(({ label, sub, textColor, bg }: { label: string, sub: string, textColor: string, bg: string }, i: number) => {
                  const zoneWidth = computedGraph?.zones?.[i]?.width || 300;
                  const pct = totalSvgWidth > 0 ? (zoneWidth / totalSvgWidth) * 100 : 0;
                  return (
                    <div
                      key={label}
                      style={{
                        width: `${pct}%`,
                        flexShrink: 0,
                        padding: "20px 0",
                        textAlign: "center",
                        background: bg,
                        borderRight: i < zones.length - 1 ? "1px dashed rgba(200,200,200,0.5)" : "none",
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 relative"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" style={{ color: textColor }} />
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: textColor, letterSpacing: "0.05em" }}>
                          {label}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
                        {sub}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Map canvas */}
              <div className="relative bg-[#F3F4F6] transition-colors duration-300" style={{ width: "100%", height: "180px" }}>
                {(loading || !computedGraph) ? (
                  <div className="absolute inset-0 flex items-center justify-around px-12">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="w-16 h-3 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <RoadmapCanvas graph={computedGraph} goal={goal} zones={zones} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Separated Goal Node Card */}
        <div className="w-[180px] lg:w-[220px] shrink flex items-center justify-center relative my-auto">
             <GoalNode goal={goal} />
        </div>
      </div>

      {/* ── Section 3: Chronological Timeline ── */}
      <div className="flex items-center justify-between mt-8 mb-2">
        <h2 className="text-lg font-bold text-gray-800">Phase Details</h2>
        <button
          onClick={() => setShowPhaseBoard(!showPhaseBoard)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
        >
          {showPhaseBoard ? (
            <>
              Hide
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {showPhaseBoard && (
        <>
          <style>{`
            ${PHASE_COLORS.map((c, i) => `
              .phase-scroll-${i}::-webkit-scrollbar {
                width: 6px;
              }
              .phase-scroll-${i}::-webkit-scrollbar-track {
                background: transparent;
              }
              .phase-scroll-${i}::-webkit-scrollbar-thumb {
                background-color: ${c.textColor}25;
                border-radius: 10px;
              }
              .phase-scroll-${i}:hover::-webkit-scrollbar-thumb {
                background-color: ${c.textColor}80;
              }
              .phase-scroll-${i}::-webkit-scrollbar-thumb:hover {
                background-color: ${c.textColor};
              }
            `).join('')}
          `}</style>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-2 w-full items-start custom-scrollbar" style={{ scrollSnapType: "x mandatory" }}>
            {zones.map((zone: any, z: number) => (
              <div 
                key={z} 
                className="flex-shrink-0 min-w-[280px] max-w-[420px] flex-1 rounded-[24px] flex flex-col border border-black/5 overflow-hidden"
                style={{ background: zone.bg, scrollSnapAlign: "start", maxHeight: "65vh" }}
              >
                {/* Header */}
                <div className="px-5 py-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[16px]" style={{ color: zone.textColor }}>{zone.label}</h3>
                    <div className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: `${zone.textColor}15`, color: zone.textColor }}>
                      {computedGraph?.nodes.filter((n) => n.zone === z).length || 0}
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium leading-snug">{zone.sub}</p>
                </div>

                {/* Scrollable Content */}
                <div className={`overflow-y-auto px-3 pb-4 phase-scroll-${z % PHASE_COLORS.length}`}>
                  <div className="space-y-2.5">
                    {loading ? (
                      <>
                        <Skeleton className="h-32 w-full rounded-xl bg-white/60" />
                        <Skeleton className="h-32 w-full rounded-xl bg-white/60" />
                      </>
                    ) : (
                      computedGraph && computedGraph.nodes.filter((n) => n.zone === z).map((n) => (
                        <CourseCard key={n.id} node={n.data as any} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {roadmaps.length > 0 && (
        <SkillAnalyticsDashboard roadmaps={roadmaps} activeRoadmapData={roadmapData} studentSkills={studentSkills} />
      )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your roadmap and all its progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteRoadmap();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Congratulation Dialog */}
      <AlertDialog open={showCongratModal} onOpenChange={setShowCongratModal}>
        <AlertDialogContent className="sm:max-w-md p-8 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <AlertDialogHeader className="text-left space-y-4">
            <div className="flex justify-start">
              <div className="w-12 h-12 bg-[#4CAF50] text-white rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <AlertDialogTitle className="text-[28px] font-bold text-gray-900 tracking-tight text-left">
                Congratulations!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left text-[15px] text-gray-600 leading-relaxed">
                You have successfully completed all the courses in the <strong>{roadmapData?.targetRoleName}</strong> roadmap. Keep up the great work and conquer new goals!
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start mt-6">
            <AlertDialogAction 
              onClick={() => setShowCongratModal(false)}
              className="bg-[#1F2937] text-white hover:bg-black px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Your dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </CourseContext.Provider>
  );
}
