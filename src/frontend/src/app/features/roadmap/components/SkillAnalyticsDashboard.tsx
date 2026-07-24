import React, { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, Activity, BookOpen, Sparkles, AlertCircle } from "lucide-react";
import { apiClient } from "@/shared/api/apiClient";

const PHASE_COLORS = ["#4CAF50", "#3B82F6", "#8B5CF6"];

interface RoadmapInfo {
  roadmapId: string;
  targetRoleName: string;
}

interface SkillAnalyticsDashboardProps {
  roadmaps: RoadmapInfo[];
  activeRoadmapData?: any;
  studentSkills?: string[];
}

export function SkillAnalyticsDashboard({ roadmaps, activeRoadmapData }: SkillAnalyticsDashboardProps) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("");
  const [allRoadmapDetails, setAllRoadmapDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [missingSkillsFromApi, setMissingSkillsFromApi] = useState<string[]>([]);
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [allGlobalCourses, setAllGlobalCourses] = useState<any[]>([]);

  useEffect(() => {
    if (roadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmaps[0].roadmapId);
    }
  }, [roadmaps, selectedRoadmapId]);

  // Fetch all global courses for recommendations
  useEffect(() => {
    apiClient.get<any[]>("/Course/courses")
      .then(res => setAllGlobalCourses(res || []))
      .catch(err => console.error("Failed to fetch all global courses", err));
  }, []);

  // Fetch all roadmaps to get course details and skills mapping
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

  // Fetch Missing Skills from API
  useEffect(() => {
    if (selectedRoadmapId) {
      setLoadingMissing(true);
      apiClient.get<string[]>(`/Roadmap/missing-skills?roadmapId=${selectedRoadmapId}`)
        .then(res => {
          setMissingSkillsFromApi(res || []);
        })
        .catch(err => {
          console.error("Failed to fetch missing skills", err);
          setMissingSkillsFromApi([]);
        })
        .finally(() => {
          setLoadingMissing(false);
        });
    }
  }, [selectedRoadmapId, activeRoadmapData]);

  // Calculations for UI
  const { totalSkills, completedSkills, missingSkillsDetails, targetRole } = useMemo(() => {
    let targetRoleName = "Target Role";
    const roadmapInfo = roadmaps.find(r => r.roadmapId === selectedRoadmapId);
    if (roadmapInfo) targetRoleName = roadmapInfo.targetRoleName;

    let currentRoadmap = allRoadmapDetails.find(r => r.roadmapId === selectedRoadmapId);
    
    if (currentRoadmap && activeRoadmapData && activeRoadmapData.roadmapId === currentRoadmap.roadmapId) {
      const activeNodesMap: Record<string, any> = {};
      if (activeRoadmapData.phases) {
        activeRoadmapData.phases.forEach((p: any) => {
          if (p.nodes) {
            p.nodes.forEach((n: any) => {
              if (n.nodeId) activeNodesMap[n.nodeId] = n;
            });
          }
        });
      }

      currentRoadmap = {
        ...currentRoadmap,
        phases: currentRoadmap.phases?.map((p: any) => ({
          ...p,
          nodes: p.nodes?.map((n: any) => {
            const activeNode = activeNodesMap[n.nodeId];
            if (activeNode) {
              return { ...n, status: activeNode.status };
            }
            return n;
          })
        }))
      };
    }

    if (!currentRoadmap) return { totalSkills: 0, completedSkills: 0, missingSkillsDetails: [], targetRole: targetRoleName };

    const nodes = currentRoadmap.phases?.flatMap((p: any) => p.nodes) || [];
    
    const skillToNodes: Record<string, any[]> = {};
    
    nodes.forEach((node: any) => {
      const details = node.courseDetails;
      const skills = details?.learningOutcomes?.map((lo: any) => lo.skillName) || [];
      skills.forEach((skill: string) => {
        if (!skillToNodes[skill]) skillToNodes[skill] = [];
        skillToNodes[skill].push(node);
      });
    });

    const allSkillNames = Object.keys(skillToNodes);
    
    let reactiveCompleted = 0;
    allSkillNames.forEach(skill => {
       const nodesForSkill = skillToNodes[skill];
       const isCompleted = nodesForSkill.every(n => n.status === "COMPLETED" || n.status === "done");
       if (isCompleted) reactiveCompleted++;
    });

    const courseToPhaseColor: Record<string, string> = {};
    if (currentRoadmap?.phases) {
      currentRoadmap.phases.forEach((p: any, phaseIndex: number) => {
        const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
        p.nodes?.forEach((n: any) => {
          const courseCode = n.courseDetails?.courseCode || n.courseCode;
          if (courseCode) {
            courseToPhaseColor[courseCode] = color;
          }
        });
      });
    }

    const missingSkillsDetails = missingSkillsFromApi.map(skill => {
      const matchingGlobalCourses = allGlobalCourses
        .filter(c => c.skills && c.skills.includes(skill))
        .map(c => c.courseCode || c.courseName);
      
      const uniqueCourseCodes = Array.from(new Set(matchingGlobalCourses));

      const suggestedCourses = uniqueCourseCodes.map(code => {
        return {
          code,
          color: courseToPhaseColor[code] || null
        };
      });

      return {
        skillName: skill,
        suggestedCourses
      };
    });

    const missingCount = missingSkillsFromApi.length;
    const completedCount = reactiveCompleted;

    return {
      totalSkills: completedCount + missingCount,
      completedSkills: completedCount,
      missingSkillsDetails,
      targetRole: targetRoleName
    };
  }, [allRoadmapDetails, activeRoadmapData, selectedRoadmapId, missingSkillsFromApi, roadmaps, allGlobalCourses]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-center min-h-[300px] mt-6">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const progressPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  const pieData = [
    { name: 'Completed', value: completedSkills, color: '#10B981' }, 
    { name: 'Missing', value: Math.max(0, totalSkills - completedSkills), color: '#F1F5F9' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mt-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Skill Gap Analysis</h2>
          </div>
          <p className="text-slate-500 text-[14px] font-medium">Analyze your skill completion progress towards your Target Role.</p>
        </div>
        
        {roadmaps.length > 0 && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Side: Pie Chart */}
        <div className="lg:col-span-1 bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[420px]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">READINESS LEVEL</h2>
            <p className="text-[13px] text-slate-500 mt-1">Current readiness level for the {targetRole} role</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                <span className="text-4xl font-black text-slate-800 tracking-tight">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">MATCH SCORE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 w-full gap-2 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-slate-800">{completedSkills}</span>
                <span className="text-[11px] font-semibold text-slate-500">Achieved</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-200">
                <span className="text-xl font-bold text-slate-800">{missingSkillsFromApi.length}</span>
                <span className="text-[11px] font-semibold text-slate-500">Missing</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-200">
                <span className="text-xl font-bold text-slate-800">{totalSkills}</span>
                <span className="text-[11px] font-semibold text-slate-500">Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Missing Skills List */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Missing Skills ({missingSkillsFromApi.length})</h3>
            {loadingMissing && <Activity className="w-4 h-4 text-slate-400 animate-spin" />}
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-slate-200 space-y-2.5">
            {missingSkillsDetails.length > 0 ? (
              missingSkillsDetails.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-red-50 p-1 rounded-md">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div>
                       <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block leading-none mb-0.5">Required Skill</span>
                       <h4 className="font-bold text-slate-800 text-[13px] leading-tight">{item.skillName}</h4>
                    </div>
                  </div>
                  <div className="pl-8">
                    <p className="text-[11px] font-medium text-slate-500 mb-1.5">Suggested courses for this skill:</p>
                    {item.suggestedCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.suggestedCourses.map((courseObj: any, cIdx: number) => (
                          <span 
                            key={cIdx} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                            style={courseObj.color ? {
                              backgroundColor: `${courseObj.color}15`,
                              color: courseObj.color,
                              borderColor: `${courseObj.color}30`
                            } : {
                              backgroundColor: '#f8fafc',
                              color: '#334155',
                              borderColor: '#f1f5f9'
                            }}
                          >
                            <BookOpen className="w-3 h-3" style={courseObj.color ? { color: courseObj.color } : { color: '#94a3b8' }} />
                            {courseObj.code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No courses found that teach this skill.</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              !loadingMissing && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Sparkles className="w-10 h-10 mb-3 text-emerald-400" />
                  <p className="font-bold text-slate-600">Excellent!</p>
                  <p className="text-sm">You have completed all skills for this roadmap.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
