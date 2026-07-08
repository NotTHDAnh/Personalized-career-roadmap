import { useState, useEffect } from "react";
import { Search, ShieldCheck, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiClient } from "@/shared/api/apiClient";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";
import { CourseMockData } from "../../data/mockData";
import { apiClient } from "@/shared/api/apiClient";

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalStudyHours: number;
  skills: string[];
}
export function StaffCoursesView() {
  const [courses, setCourses] = useState<CourseMockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        // Assuming the endpoint is GET /Course or /courses and returns a list of CourseDetailDto
        const data = await apiClient.get<any[]>('/Course');
        
        const formattedCourses: CourseMockData[] = data.map(c => ({
          courseId: c.courseId || c.CourseId,
          courseCode: c.courseCode || c.CourseCode,
          courseName: c.courseName || c.CourseName,
          credits: c.credits ?? c.Credits ?? 3,
          totalStudyHours: c.totalStudyHours ?? c.TotalStudyHours ?? 45,
          skills: (c.learningOutcomes || c.LearningOutcomes || []).map((lo: any) => lo.skillName || lo.SkillName),
          prerequisites: (c.prerequisites || c.Prerequisites) ? (c.prerequisites || c.Prerequisites).split(';') : [],
          is_active: true
        }));
        
        setCourses(formattedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<Course[]>("/Staff/courses");
        setCoursesData(data);
      } catch (error) {
        toast.error("Failed to fetch courses data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses by code, name, or associated skills
  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 whenever search criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-8 flex flex-col bg-[#F4F7F9]">
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
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input 
              placeholder="Search by code, name, or skill..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 text-[13px] bg-white border-[#E2E8F0] focus-visible:ring-[#6366F1] shadow-sm rounded-lg"
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] overflow-hidden mb-8 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Course Name
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-t border-[#E2E8F0]">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-md" />
                          <Skeleton className="h-5 w-16 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono font-bold text-[#3B28CC]">
                        {course.courseCode}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-[#0F172A]">
                        {course.courseName}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
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
  );
}
