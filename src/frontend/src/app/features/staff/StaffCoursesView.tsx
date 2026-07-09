import { useState, useEffect } from "react";
import { 
  Search, ShieldCheck, ChevronLeft, ChevronRight, BookOpen, 
  MoreVertical, Edit2, Trash2, X, Plus, Filter, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiClient } from "@/shared/api/apiClient";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";
import { CourseMockData } from "../../data/mockData";

export function StaffCoursesView() {
  const [courses, setCourses] = useState<CourseMockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'none' | 'single' | 'bulk'>('none');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);

  // Filter State
  const [selectedCredits, setSelectedCredits] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilterGroup, setExpandedFilterGroup] = useState<string | null>('categories');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);

  // Form State
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    credits: 3,
    totalStudyHours: 45,
    skills: [] as string[],
    prerequisites: [] as string[]
  });

  // Filter Options Map
  const [skillCategories, setSkillCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await apiClient.get<any[]>("/Skill");
        const grouped: Record<string, string[]> = {};
        data.forEach(s => {
          const cat = s.category || s.Category || "Uncategorized";
          const name = s.skillName || s.SkillName;
          if (!grouped[cat]) grouped[cat] = [];
          if (!grouped[cat].includes(name)) grouped[cat].push(name);
        });
        setSkillCategories(grouped);
      } catch (error) {
        console.error("Failed to fetch skills for categories", error);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<any[]>("/course/courses");
        
        const detailedCourses = await Promise.all(data.map(async (c) => {
          let prerequisites: string[] = [];
          try {
            const detail = await apiClient.get<any>(`/course/${c.courseId || c.CourseId}`);
            if (detail.prerequisites) {
              prerequisites = detail.prerequisites.split(';').map((p: string) => p.trim()).filter(Boolean);
            } else if (detail.Prerequisites) {
              prerequisites = detail.Prerequisites.split(';').map((p: string) => p.trim()).filter(Boolean);
            }
          } catch (e) {
            console.error(`Failed to fetch details for course ${c.courseId || c.CourseId}`, e);
          }
          return {
            courseId: c.courseId || c.CourseId,
            courseCode: c.courseCode || c.CourseCode,
            courseName: c.courseName || c.CourseName,
            credits: c.credits ?? c.Credits ?? 3,
            totalStudyHours: c.totalStudyHours ?? c.TotalStudyHours ?? 45,
            skills: c.skills || c.Skills || [],
            prerequisites
          };
        }));
        
        setCourses(detailedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Không thể tải danh sách môn học");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Available skills & courses for dropdowns
  const availableSkills = Array.from(new Set(courses.flatMap(c => c.skills))).sort();
  const availableCourses = courses.map(c => c.courseCode);

  // Filter Options
  const availableCreditsList = Array.from(new Set(courses.map(c => c.credits))).sort((a, b) => a - b);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (deleteModalOpen && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [deleteModalOpen, deleteCountdown]);

  // Click outside to close dropdown and filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
      if (isFilterOpen && !(event.target as Element).closest('.filter-container')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId, isFilterOpen]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourseIds(paginatedCourses.map(c => c.courseId));
    } else {
      setSelectedCourseIds([]);
    }
  };

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourseIds(prev => [...prev, courseId]);
    } else {
      setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    }
  };

  const handleOpenSingleEdit = async (course: CourseMockData) => {
    try {
      setIsLoading(true);
      // Gọi API lấy thông tin chi tiết môn học để lấy prerequisites
      const detail = await apiClient.get<any>(`/course/${course.courseId}`);
      
      setEditMode('single');
      setEditingCourseId(course.courseId);
      setFormData({
        courseCode: detail.courseCode || detail.CourseCode || course.courseCode,
        courseName: detail.courseName || detail.CourseName || course.courseName,
        credits: detail.credits ?? detail.Credits ?? course.credits,
        totalStudyHours: detail.totalStudyHours ?? detail.TotalStudyHours ?? course.totalStudyHours,
        skills: detail.learningOutcomes 
          ? detail.learningOutcomes.map((lo: any) => lo.skillName || lo.SkillName)
          : detail.skills || detail.Skills || course.skills,
        prerequisites: detail.prerequisites 
          ? detail.prerequisites.split(';').filter((p: string) => p.trim() !== '') 
          : []
      });
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Failed to load course details:", error);
      toast.error("Không thể lấy chi tiết môn học để chỉnh sửa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBulkEdit = () => {
    if (selectedCourseIds.length === 0) return;
    setEditMode('bulk');
    setEditingCourseId(null);
    const firstCourse = courses.find(c => c.courseId === selectedCourseIds[0]);
    if (firstCourse) {
      setFormData({
        courseCode: "",
        courseName: "",
        credits: firstCourse.credits,
        totalStudyHours: firstCourse.totalStudyHours,
        skills: [...firstCourse.skills],
        prerequisites: []
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editMode === 'single') {
      try {
        const payload = {
          credits: formData.credits,
          totalStudyHours: formData.totalStudyHours,
          skills: formData.skills.join(';'),
          prerequisites: formData.prerequisites.join(';')
        };
        
        const updatedDetail = await apiClient.put<any>(`/Staff/courses/${editingCourseId}`, payload);
        
        setCourses(prev => prev.map(course => {
          if (course.courseId === editingCourseId) {
            return {
              ...course,
              credits: updatedDetail.credits ?? updatedDetail.Credits ?? formData.credits,
              totalStudyHours: updatedDetail.totalStudyHours ?? updatedDetail.TotalStudyHours ?? formData.totalStudyHours,
              skills: updatedDetail.learningOutcomes
                ? updatedDetail.learningOutcomes.map((lo: any) => lo.skillName || lo.SkillName)
                : formData.skills,
            };
          }
          return course;
        }));
        
        toast.success("Cập nhật môn học thành công");
        setEditMode('none');
      } catch (error: any) {
        console.error("Failed to update course:", error);
        toast.error(error?.message || "Lỗi khi cập nhật môn học");
      }
    } else if (editMode === 'bulk') {
      try {
        setIsLoading(true);
        const payload = {
          credits: formData.credits,
          totalStudyHours: formData.totalStudyHours,
          skills: formData.skills.join(';'),
          prerequisites: formData.prerequisites.join(';')
        };
        
        await Promise.all(selectedCourseIds.map(id => 
          apiClient.put(`/Staff/courses/${id}`, payload)
        ));
        
        setCourses(prev => prev.map(course => {
          if (selectedCourseIds.includes(course.courseId)) {
            return {
              ...course,
              credits: formData.credits,
              totalStudyHours: formData.totalStudyHours,
              skills: formData.skills,
            };
          }
          return course;
        }));
        
        toast.success(`Cập nhật thành công ${selectedCourseIds.length} môn học`);
        setEditMode('none');
        setSelectedCourseIds([]);
      } catch (error: any) {
        console.error("Failed bulk update:", error);
        toast.error("Một số môn học cập nhật thất bại. Vui lòng kiểm tra lại");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenDelete = (type: 'single' | 'bulk', id: string | null = null) => {
    setDeleteType(type);
    setDeleteCourseId(id);
    setDeleteCountdown(5);
    setDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const getCoursesToDelete = (initialCourseIds: string[], allCourses: CourseMockData[]): string[] => {
    const toDelete = new Set<string>(initialCourseIds);
    let changed = true;
    while (changed) {
      changed = false;
      for (const course of allCourses) {
        if (!toDelete.has(course.courseId)) {
          const hasDeletedPrereq = course.prerequisites?.some(pCode => {
            const prereqCourse = allCourses.find(c => c.courseCode === pCode);
            return prereqCourse && toDelete.has(prereqCourse.courseId);
          });
          
          if (hasDeletedPrereq) {
            toDelete.add(course.courseId);
            changed = true;
          }
        }
      }
    }
    return Array.from(toDelete);
  };

  const confirmDelete = async () => {
    if (deleteType === 'single' && deleteCourseId) {
      try {
        setIsLoading(true);
        const idsToDelete = getCoursesToDelete([deleteCourseId], courses);
        
        for (const id of idsToDelete) {
          try {
             await apiClient.delete(`/Staff/courses/${id}`);
          } catch (e) {
             console.error(`Failed to delete course ${id}`, e);
          }
        }
        
        setCourses(prev => prev.filter(c => !idsToDelete.includes(c.courseId)));
        
        if (idsToDelete.length > 1) {
          toast.success(`Đã xóa môn học và ${idsToDelete.length - 1} môn học phụ thuộc`);
        } else {
          toast.success("Xóa môn học thành công");
        }
      } catch (error: any) {
        console.error("Failed to delete course:", error);
        toast.error(error?.message || "Lỗi khi xóa môn học");
      } finally {
        setIsLoading(false);
      }
    } else if (deleteType === 'bulk') {
      try {
        setIsLoading(true);
        const idsToDelete = getCoursesToDelete(selectedCourseIds, courses);
        
        for (const id of idsToDelete) {
          try {
             await apiClient.delete(`/Staff/courses/${id}`);
          } catch (e) {
             console.error(`Failed to delete course ${id}`, e);
          }
        }
        
        setCourses(prev => prev.filter(c => !idsToDelete.includes(c.courseId)));
        
        if (idsToDelete.length > selectedCourseIds.length) {
            toast.success(`Đã xóa thành công ${idsToDelete.length} môn học (bao gồm phụ thuộc)`);
        } else {
            toast.success(`Đã xóa thành công ${idsToDelete.length} môn học`);
        }
        setSelectedCourseIds([]);
      } catch (error: any) {
        console.error("Failed bulk delete:", error);
        toast.error("Một số môn học xóa thất bại. Vui lòng thử lại");
      } finally {
        setIsLoading(false);
      }
    }
    setDeleteModalOpen(false);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCredits = selectedCredits.length === 0 || selectedCredits.includes(course.credits);
    
    const matchesCategories = selectedCategories.length === 0 || course.skills.some(skill => 
      selectedCategories.some(cat => skillCategories[cat]?.includes(skill))
    );

    return matchesSearch && matchesCredits && matchesCategories;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-full w-full overflow-hidden flex bg-[#F4F7F9]">
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 flex flex-col transition-all duration-300 ${editMode !== 'none' ? 'mr-[350px]' : ''}`}>
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[12px] text-[#64748B] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B28CC]" />
                <span>Dashboard</span>
                <span>›</span>
                <span className="text-[#3B28CC]">Courses Directory</span>
              </div>
              <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
                Courses Directory ({filteredCourses.length})
              </h1>
              <p className="text-[13px] text-[#64748B]">All active courses available in the curriculum</p>
            </div>
          </div>

          {/* Toolbar Section */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[480px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <Input 
                  placeholder="Search by code, name, or skill..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 text-[13px] bg-white border-[#E2E8F0] focus-visible:ring-[#6366F1] shadow-sm rounded-lg"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
              
              <div className="relative filter-container">
                <Button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`h-10 px-4 rounded-lg shadow-sm font-semibold transition-all flex items-center gap-2 border
                    ${(selectedCredits.length + selectedCategories.length) > 0 || isFilterOpen ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] border-transparent' : 'bg-white text-[#475569] hover:bg-gray-50 border-[#E2E8F0]'}`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {(selectedCredits.length + selectedCategories.length) > 0 && (
                    <span className="bg-white text-[#3B82F6] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ml-1">
                      {selectedCredits.length + selectedCategories.length}
                    </span>
                  )}
                </Button>
                
                {isFilterOpen && (
                  <div className="absolute top-12 left-0 w-[280px] bg-white border border-[#E2E8F0] shadow-xl rounded-xl z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                      <h3 className="font-bold text-[15px] text-[#0F172A]">Filters</h3>
                      {(selectedCredits.length + selectedCategories.length) > 0 && (
                        <button 
                          onClick={() => { setSelectedCredits([]); setSelectedCategories([]); }}
                          className="text-[12px] font-semibold text-[#3B82F6] hover:text-[#2563EB]"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto">
                      {/* Skill Categories Accordion */}
                      <div className="border-b border-[#E2E8F0]">
                        <button 
                          onClick={() => setExpandedFilterGroup(expandedFilterGroup === 'categories' ? null : 'categories')}
                          className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
                        >
                          <span className="text-[13px] font-bold text-[#334155]">Skill Categories</span>
                          {expandedFilterGroup === 'categories' ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                        </button>
                        
                        {expandedFilterGroup === 'categories' && (
                          <div className="p-4 bg-white flex flex-col gap-3">
                            {Object.keys(skillCategories).map(category => (
                              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
                                  checked={selectedCategories.includes(category)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedCategories([...selectedCategories, category]);
                                    else setSelectedCategories(selectedCategories.filter(c => c !== category));
                                  }}
                                />
                                <span className="text-[13px] text-[#475569] group-hover:text-[#0F172A] font-medium transition-colors">
                                  {category}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Credits Accordion */}
                      <div>
                        <button 
                          onClick={() => setExpandedFilterGroup(expandedFilterGroup === 'credits' ? null : 'credits')}
                          className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
                        >
                          <span className="text-[13px] font-bold text-[#334155]">Credits</span>
                          {expandedFilterGroup === 'credits' ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                        </button>
                        
                        {expandedFilterGroup === 'credits' && (
                          <div className="p-4 bg-white flex flex-col gap-3">
                            {availableCreditsList.map(credit => (
                              <label key={credit} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
                                  checked={selectedCredits.includes(credit)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedCredits([...selectedCredits, credit]);
                                    else setSelectedCredits(selectedCredits.filter(c => c !== credit));
                                  }}
                                />
                                <span className="text-[13px] text-[#475569] group-hover:text-[#0F172A] font-medium transition-colors">
                                  {credit} credits
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {!isGlobalEditMode ? (
              <Button 
                onClick={() => setIsGlobalEditMode(true)}
                className="bg-[#1E293B] hover:bg-[#0F172A] text-white text-[13px] h-10 px-4 rounded-lg shadow-sm font-semibold transition-all"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                {selectedCourseIds.length > 0 && (
                  <>
                    <span className="text-[13px] font-semibold text-[#0F172A] bg-white px-3 py-2 rounded-lg border border-[#E2E8F0]">
                      {selectedCourseIds.length} courses selected
                    </span>
                    <Button 
                      onClick={() => handleOpenDelete('bulk')}
                      className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] h-10 px-4 rounded-lg shadow-sm font-semibold transition-all"
                    >
                      Bulk Delete
                    </Button>
                    <Button 
                      onClick={handleOpenBulkEdit}
                      className="bg-[#1E293B] hover:bg-[#0F172A] text-white text-[13px] h-10 px-4 rounded-lg shadow-sm font-semibold transition-all"
                    >
                      Bulk Edit
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => {
                    setIsGlobalEditMode(false);
                    setEditMode('none');
                    setSelectedCourseIds([]);
                  }}
                  variant="outline"
                  className="text-[13px] h-10 px-4 rounded-lg font-semibold transition-all border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                >
                  Cancel Edit
                </Button>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] overflow-hidden mb-8 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {isGlobalEditMode && (
                      <th className="px-6 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-[#CBD5E1] text-[#3B28CC] focus:ring-[#3B28CC] cursor-pointer"
                          checked={paginatedCourses.length > 0 && selectedCourseIds.length === paginatedCourses.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Course Code
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Prerequisites
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Study Hours
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Core Skills
                    </th>
                    {isGlobalEditMode && (
                      <th className="px-4 py-4 w-12 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider"></th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="border-t border-[#E2E8F0]">
                        {isGlobalEditMode && <td className="px-6 py-4"></td>}
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-md" />
                          </div>
                        </td>
                        {isGlobalEditMode && <td></td>}
                      </tr>
                    ))
                  ) : paginatedCourses.length > 0 ? (
                    paginatedCourses.map((course) => (
                      <tr key={course.courseId} className="hover:bg-[#F8FAFC]/50 transition-colors">
                        {isGlobalEditMode && (
                          <td className="px-6 py-4 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-[#CBD5E1] text-[#3B28CC] focus:ring-[#3B28CC] cursor-pointer"
                              checked={selectedCourseIds.includes(course.courseId)}
                              onChange={(e) => handleSelectCourse(course.courseId, e.target.checked)}
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono font-bold text-[#3B28CC]">
                          {course.courseCode}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-[#0F172A]">
                          {course.courseName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {course.prerequisites && course.prerequisites.length > 0 ? (
                              course.prerequisites.map((prereq, idx) => (
                                <span 
                                  key={idx}
                                  className="bg-[#F1F5F9] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E2E8F0]"
                                >
                                  {prereq}
                                </span>
                              ))
                            ) : (
                              <span className="text-[12px] text-gray-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[13px] text-center font-semibold text-[#334155]">
                          {course.credits} credits
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[13px] text-center font-semibold text-[#334155]">
                          {course.totalStudyHours} hrs
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {course.skills.map((skill, idx) => (
                              <span 
                                key={idx}
                                className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#E0E7FF]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        {isGlobalEditMode && (
                          <td className="px-4 py-4 text-center relative dropdown-container">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === course.courseId ? null : course.courseId)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {openDropdownId === course.courseId && (
                              <div className="absolute right-8 top-10 w-36 bg-white border border-[#E2E8F0] shadow-lg rounded-xl z-10 py-1 overflow-hidden animate-in zoom-in-95 duration-100">
                                <button 
                                  onClick={() => handleOpenSingleEdit(course)}
                                  className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleOpenDelete('single', course.courseId)}
                                  className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isGlobalEditMode ? 7 : 5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <BookOpen className="w-10 h-10 text-[#CBD5E1] mb-3" />
                          <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">No courses found</h3>
                          <p className="text-[13px] text-[#64748B]">Try adjusting your search terms.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          <div className="mt-auto pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`${currentPage === 1 ? 'invisible' : ''} text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] gap-1`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] transition-colors
                    ${currentPage === idx + 1 
                      ? 'bg-[#EFF4FF] text-[#3B28CC] font-bold' 
                      : 'hover:bg-gray-100 text-[#64748B] font-semibold'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`${currentPage === totalPages ? 'invisible' : ''} text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] gap-1`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>

      {/* Edit Panel (Side Drawer) */}
      <div 
        className={`fixed top-0 right-0 h-full w-[350px] bg-white border-l border-[#E2E8F0] shadow-2xl transition-transform duration-300 z-20 flex flex-col ${editMode !== 'none' ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <h2 className="text-[18px] font-bold text-[#0F172A]">
            {editMode === 'bulk' ? 'Bulk Edit Courses' : 'Edit Course'}
          </h2>
          <button 
            onClick={() => setEditMode('none')}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {editMode === 'single' && (
            <>
              <div>
                <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Course Code</label>
                <Input 
                  value={formData.courseCode} 
                  className="h-10 text-[13px] font-mono"
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Course Name</label>
                <Input 
                  value={formData.courseName} 
                  className="h-10 text-[13px] font-medium"
                  disabled={true}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Credits</label>
              <Input 
                type="number" 
                value={formData.credits} 
                onChange={e => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                className="h-10 text-[13px] font-medium"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Study Hours</label>
              <Input 
                type="number" 
                value={formData.totalStudyHours} 
                onChange={e => setFormData({...formData, totalStudyHours: parseInt(e.target.value) || 0})}
                className="h-10 text-[13px] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Core Skills</label>
            <div className="border border-[#E2E8F0] rounded-lg p-2 min-h-[100px] bg-white">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.skills.map(skill => (
                  <span key={skill} className="bg-[#F1F5F9] text-[#334155] text-[11px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                    {skill}
                    <button 
                      onClick={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})}
                      className="text-[#94A3B8] hover:text-[#EF4444]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select 
                className="w-full text-[13px] p-2 border border-[#E2E8F0] rounded-md text-[#475569] bg-[#F8FAFC] outline-none focus:border-[#3B28CC]"
                onChange={(e) => {
                  if (e.target.value && !formData.skills.includes(e.target.value)) {
                    setFormData({...formData, skills: [...formData.skills, e.target.value]});
                  }
                  e.target.value = "";
                }}
              >
                <option value="">+ Add skill</option>
                {availableSkills.filter(s => !formData.skills.includes(s)).map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#475569] mb-1.5 uppercase tracking-wide">Prerequisites</label>
            <div className="border border-[#E2E8F0] rounded-lg p-2 min-h-[100px] bg-white">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.prerequisites.map(prereq => (
                  <span key={prereq} className="bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-[11px] font-semibold px-2 py-1 rounded flex items-center gap-1">
                    {prereq}
                    <button 
                      onClick={() => setFormData({...formData, prerequisites: formData.prerequisites.filter(p => p !== prereq)})}
                      className="text-[#FDBA74] hover:text-[#EA580C]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <select 
                className="w-full text-[13px] p-2 border border-[#E2E8F0] rounded-md text-[#475569] bg-[#F8FAFC] outline-none focus:border-[#EA580C]"
                onChange={(e) => {
                  if (e.target.value && !formData.prerequisites.includes(e.target.value)) {
                    setFormData({...formData, prerequisites: [...formData.prerequisites, e.target.value]});
                  }
                  e.target.value = "";
                }}
              >
                <option value="">+ Add prerequisite</option>
                {availableCourses.filter(c => !formData.prerequisites.includes(c) && c !== formData.courseCode).map(courseCode => (
                  <option key={courseCode} value={courseCode}>{courseCode}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setEditMode('none')}
            className="text-[13px] font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit}
            className="bg-[#1E293B] hover:bg-[#0F172A] text-white text-[13px] font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Confirm Deletion</h2>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Are you sure you want to delete {deleteType === 'bulk' ? `the selected courses` : 'this course'}? 
                This action will hide them from the system.
              </p>
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModalOpen(false)}
                className="text-[13px] font-semibold border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={deleteCountdown > 0}
                className={`text-[13px] font-semibold text-white px-5 min-w-[120px] transition-all
                  ${deleteCountdown > 0 
                    ? 'bg-[#FCA5A5] cursor-not-allowed' 
                    : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}
              >
                {deleteCountdown > 0 ? `Confirm (${deleteCountdown}s)` : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
