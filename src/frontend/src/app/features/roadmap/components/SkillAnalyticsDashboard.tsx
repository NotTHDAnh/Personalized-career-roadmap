import React, { useState, useMemo, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { ChevronDown, Activity, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";

interface RoadmapInfo {
  roadmapId: string;
  targetRoleName: string;
}

interface SkillAnalyticsDashboardProps {
  roadmaps: RoadmapInfo[];
}

const COLORS = ["#38BDF8", "#818CF8", "#34D399", "#FBBF24", "#F472B6", "#A78BFA", "#60A5FA"];

const CircularProgress = ({ value, label }: { value: number, label: string | number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const color = value >= 80 ? "#10B981" : value >= 50 ? "#3B82F6" : "#F59E0B";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="44" height="44" className="transform -rotate-90">
        <circle cx="22" cy="22" r="18" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
        <circle 
          cx="22" cy="22" r="18" 
          stroke={color} strokeWidth="4" fill="transparent" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700">{label}</span>
    </div>
  );
};

const MetricCard = ({ title, value, icon, trend, color }: any) => {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-50/80",
    green: "text-emerald-500 bg-emerald-50/80",
    purple: "text-purple-500 bg-purple-50/80",
  };
  const trendColor = trend.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-50";

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-[28px] font-black text-slate-800 mt-1">{value}</p>
      </div>
      <div className="flex flex-col items-end">
        <div className={`p-2.5 rounded-[14px] ${colorMap[color]} mb-3 shadow-sm`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${trendColor}`}>{trend}</span>
      </div>
    </div>
  );
};

export function SkillAnalyticsDashboard({ roadmaps }: SkillAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overall" | "roadmap">("overall");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("");
  const [allRoadmapDetails, setAllRoadmapDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmaps[0].roadmapId);
    }
  }, [roadmaps, selectedRoadmapId]);

  useEffect(() => {
    async function fetchAllRoadmaps() {
      if (!roadmaps || roadmaps.length === 0) return;
      setLoading(true);
      try {
        const promises = roadmaps.map(r => apiClient.get(`/Roadmap/${r.roadmapId}`));
        const results = await Promise.all(promises);
        
        const uniqueCourseIds = new Set<string>();
        results.forEach((data: any) => {
          if (data?.phases) {
            data.phases.forEach((p: any) => {
              if (p?.nodes) {
                p.nodes.forEach((n: any) => {
                  if (n.courseId) uniqueCourseIds.add(n.courseId);
                });
              }
            });
          }
        });

        if (uniqueCourseIds.size > 0) {
          const courseDetailsMap: Record<string, any> = {};
          await Promise.all(
            Array.from(uniqueCourseIds).map(async (cid) => {
              try {
                const details = await apiClient.get<any>(`/Course/${cid}`);
                courseDetailsMap[cid] = details;
              } catch (err) {
                console.error(`Failed to fetch course details for ${cid}:`, err);
              }
            })
          );

          results.forEach((data: any) => {
            if (data?.phases) {
              data.phases.forEach((p: any) => {
                if (p?.nodes) {
                  p.nodes.forEach((n: any) => {
                     n.courseDetails = n.courseId ? courseDetailsMap[n.courseId] : null;
                  });
                }
              });
            }
          });
        }

        setAllRoadmapDetails(results);
      } catch (e) {
        console.error("Error fetching all roadmaps for analytics", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAllRoadmaps();
  }, [roadmaps]);

  const { stats, overallMetrics } = useMemo(() => {
    const map: Record<string, { skillName: string; count: number; totalGpa: number; coursesWithGpa: number }> = {};
    let totalCompletedCourses = 0;
    
    const roadmapsToAnalyze = activeTab === "overall" 
      ? allRoadmapDetails 
      : allRoadmapDetails.filter(r => r.roadmapId === selectedRoadmapId);

    roadmapsToAnalyze.forEach(roadmap => {
      const flatNodes = roadmap?.phases?.flatMap((p: any) => p.nodes) || [];
      flatNodes.forEach((node: any) => {
        if (node.status === "COMPLETED" || node.status === "done") {
          totalCompletedCourses++;
          const courseGpa = node.gpa || node.courseDetails?.gpa;
          const source = node.source || node.courseDetails?.source;
          const isUniversity = source === "university" || source === "UNIVERSITY";
          const hasValidGpa = isUniversity && typeof courseGpa === "number";

          const details = node.courseDetails;
          const dynamicSkills = details?.learningOutcomes && details.learningOutcomes.length > 0
              ? details.learningOutcomes.map((lo: any) => lo.skillName)
              : [];
          const skills = dynamicSkills;
          const normalizedSkills = Array.isArray(skills) ? skills : (typeof skills === "string" ? [skills] : []);

          normalizedSkills.forEach((s: string) => {
            if (!map[s]) map[s] = { skillName: s, count: 0, totalGpa: 0, coursesWithGpa: 0 };
            map[s].count += 1;
            if (hasValidGpa) {
              map[s].totalGpa += courseGpa;
              map[s].coursesWithGpa += 1;
            }
          });
        }
      });
    });

    const rawArray = Object.values(map).map(item => {
      const avgGpa = item.coursesWithGpa > 0 ? Number((item.totalGpa / item.coursesWithGpa).toFixed(1)) : null;
      let progress = 0;
      if (avgGpa !== null) {
        progress = Math.round((avgGpa / 10) * 100);
      } else {
        progress = Math.min(Math.round((item.count / 3) * 100), 100);
      }
      return {
        name: item.skillName,
        count: item.count,
        avgGpa: avgGpa,
        progress: progress
      };
    });

    const sortedStats = rawArray.sort((a, b) => b.progress - a.progress);
    
    let sumGpa = 0;
    let countGpa = 0;
    sortedStats.forEach(s => {
      if (s.avgGpa !== null) {
        sumGpa += s.avgGpa;
        countGpa++;
      }
    });

    return {
      stats: sortedStats,
      overallMetrics: {
        totalSkills: sortedStats.length,
        globalAvgGpa: countGpa > 0 ? (sumGpa / countGpa).toFixed(1) : "N/A",
        totalCompleted: totalCompletedCourses
      }
    };
  }, [allRoadmapDetails, activeTab, selectedRoadmapId]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing skills data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mt-8 overflow-hidden relative">
      {/* Decorative blurred background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Skill Analytics</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">Your progress and mastery overview.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setActiveTab("overall")}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "overall" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Overview
            </button>
            {roadmaps.length >= 2 && (
              <button 
                onClick={() => setActiveTab("roadmap")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "roadmap" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                By Roadmap
              </button>
            )}
          </div>
          
          {activeTab === "roadmap" && (
            <div className="relative">
              <select
                value={selectedRoadmapId}
                onChange={e => setSelectedRoadmapId(e.target.value)}
                className="appearance-none bg-white border border-slate-200 shadow-sm text-slate-700 text-sm rounded-xl pl-4 pr-10 py-2.5 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[200px]"
              >
                {roadmaps.map(r => (
                  <option key={r.roadmapId} value={r.roadmapId}>{r.targetRoleName}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative z-10">
         <MetricCard title="Total Skills Mastered" value={overallMetrics.totalSkills} icon={<Activity className="w-5 h-5" />} trend="+12%" color="blue" />
         <MetricCard title="Avg Mastery GPA" value={overallMetrics.globalAvgGpa} icon={<TrendingUp className="w-5 h-5" />} trend="+5%" color="green" />
         <MetricCard title="Completed Courses" value={overallMetrics.totalCompleted} icon={<BookOpen className="w-5 h-5" />} trend="Steady" color="purple" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-base font-bold text-slate-800 tracking-tight">Skill Analysis (GPA & Frequency)</h3>
           </div>
           <div className="h-[280px]">
             {stats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={stats.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 600 }} dy={10} />
                   <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 600 }} />
                   <YAxis yAxisId="right" orientation="right" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8", fontWeight: 600 }} />
                   <Tooltip 
                     cursor={{ fill: "rgba(241, 245, 249, 0.5)" }} 
                     contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                   />
                   <Bar yAxisId="left" dataKey="count" name="Courses" radius={[8, 8, 0, 0]} maxBarSize={48}>
                     {stats.slice(0, 7).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                   <Line yAxisId="right" type="monotone" dataKey="avgGpa" name="Avg GPA" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#FFF" }} activeDot={{ r: 6 }} connectNulls />
                 </ComposedChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400 font-medium">No data to display chart.</div>
             )}
           </div>
        </div>

        {/* Right: Detailed List */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 tracking-tight mb-5">Skill Breakdown</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[290px] scrollbar-thin scrollbar-thumb-slate-200">
            {stats.length > 0 ? stats.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[13px] font-bold text-slate-800 mb-0.5">{s.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {s.avgGpa ? `GPA: ${s.avgGpa}` : "External Resource"} • {s.count} courses
                  </p>
                </div>
                <CircularProgress 
                  value={s.progress} 
                  label={s.avgGpa !== null ? s.avgGpa : s.count} 
                />
              </div>
            )) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">Complete a course to see your skills.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
