import { useState, useEffect } from "react";
import { Search, Filter, Plus, CloudUpload, ChevronLeft, ChevronRight, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";

import { apiClient } from "@/shared/api/apiClient";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  role: string;
  code: string;
  tags: string[];
  date: string;
  avatar: string;
}

export function StaffStudentsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<Student[]>("/Staff/students");
        setStudentsData(data);
      } catch (error) {
        toast.error("Failed to fetch students data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = studentsData.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when searching
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
              <span className="text-[#3B28CC]">Students</span>
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
              Students ({filteredStudents.length})
            </h1>
            <p className="text-[13px] text-[#64748B]">All the students of the institution are listed here</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Import Students button removed per request */}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input 
              placeholder="Search by name, code, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 text-[13px] bg-white border-[#E2E8F0] focus-visible:ring-[#6366F1] shadow-sm rounded-lg"
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="bg-white border-[#E2E8F0] shadow-sm rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-4 w-12 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))
          ) : paginatedStudents.length > 0 ? (
            paginatedStudents.map((student) => (
            <Card key={student.id} className="bg-white border-[#E2E8F0] shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
              {/* Action Menu (...) */}
              <button className="absolute top-4 right-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#0F172A]">
                <MoreHorizontal className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
                <div>
                  <h3 className="text-[14px] font-bold text-[#0F172A] leading-snug">{student.name}</h3>
                  <p className="text-[12px] text-[#64748B] font-medium">{student.role}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mb-5 flex-wrap">
                {student.tags.map((tag, idx) => (
                  <span key={idx} className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0F172A]">Student Code:</span>
                  <span className="text-[12px] font-medium text-[#64748B]" title={student.code}>
                    {student.code.length > 15 ? student.code.substring(0, 15) + '...' : student.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0F172A]">Enrolled Date:</span>
                  <span className="text-[12px] font-medium text-[#64748B]">{student.date}</span>
                </div>
              </div>
            </Card>
            ))
          ) : (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-[#CBD5E1] mb-3" />
              <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">No students found</h3>
              <p className="text-[13px] text-[#64748B]">Try adjusting your search terms.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
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
