import { useState, useEffect } from "react";
import { Search, ShieldCheck, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { apiClient } from "@/shared/api/apiClient";

export function StaffCoursesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
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
        
        setCourses(loadedCourses);
      } catch (err) {
        console.error("Failed to load courses from API", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses by code, name, or associated skills
  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.learningOutcomes || []).some((lo: any) => lo.skillName.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <span>Organisation</span>
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
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-44" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => {
                    const skills = Array.from(new Set(course.learningOutcomes?.map((lo: any) => lo.skillName) || []));
                    return (
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
                            {skills.map((skill: any, idx) => (
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
                    );
                  })
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
