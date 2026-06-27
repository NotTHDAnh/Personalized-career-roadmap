import { useState } from "react";
import { Search, Filter, Plus, CloudUpload, ChevronLeft, ChevronRight, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";

// Mock Data
const MOCK_STUDENTS = [
  { id: 1, name: "Toni Kross", role: "Software Engineering", code: "SE150001", tags: ["Web", "Backend"], date: "03-Jan-2022", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Wade Warren", role: "Information Assurance", code: "IA160021", tags: ["Security", "Network"], date: "11-Jan-2021", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Leslie Alexander", role: "Software Engineering", code: "SE170102", tags: ["Frontend", "UI/UX"], date: "08-Feb-2022", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Robert Fox", role: "Artificial Intelligence", code: "AI150231", tags: ["Data", "Python"], date: "01-Aug-2021", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Jacob Jones", role: "Software Engineering", code: "SE150999", tags: ["Mobile", "iOS"], date: "01-Oct-2022", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Jane Cooper", role: "Information Systems", code: "IS160555", tags: ["Business", "Analyst"], date: "01-Jan-2023", avatar: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "Esther Howard", role: "Software Engineering", code: "SE140123", tags: ["Fullstack", "Java"], date: "01-Jan-2021", avatar: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Jerome Bell", role: "Graphic Design", code: "GD150456", tags: ["Design", "Figma"], date: "01-Jan-2021", avatar: "https://i.pravatar.cc/150?u=8" },
  { id: 9, name: "Kathryn Murphy", role: "Graphic Design", code: "GD160789", tags: ["Design", "2D"], date: "05-Jan-2021", avatar: "https://i.pravatar.cc/150?u=9" },
  { id: 10, name: "Courtney Henry", role: "Graphic Design", code: "GD160321", tags: ["Animation", "3D"], date: "06-Jan-2021", avatar: "https://i.pravatar.cc/150?u=10" },
  { id: 11, name: "Jerome Bell", role: "Software Engineering", code: "SE170654", tags: ["Backend", "C#"], date: "05-Jan-2021", avatar: "https://i.pravatar.cc/150?u=11" },
  { id: 12, name: "Devon Lane", role: "Software Engineering", code: "SE160987", tags: ["Frontend", "React"], date: "01-Jan-2021", avatar: "https://i.pravatar.cc/150?u=12" },
];

export function StaffStudentsView() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = MOCK_STUDENTS.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <span className="text-[#3B28CC]">Students</span>
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
              Students ({filteredStudents.length})
            </h1>
            <p className="text-[13px] text-[#64748B]">All the students of the institution are listed here</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-4 text-[13px] font-semibold text-[#334155] border-[#E2E8F0] hover:bg-white bg-white shadow-sm gap-2">
              <CloudUpload className="w-4 h-4" />
              Import Students
            </Button>
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
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
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
              
              <div className="flex gap-2 mb-5">
                {student.tags.map((tag, idx) => (
                  <span key={idx} className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0F172A]">Student Code:</span>
                  <span className="text-[12px] font-medium text-[#64748B]">{student.code}</span>
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
          <Button variant="ghost" className="text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] gap-1">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#EFF4FF] text-[#3B28CC] text-[13px] font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748B] text-[13px] font-semibold transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748B] text-[13px] font-semibold transition-colors">3</button>
            <span className="text-[#94A3B8] px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748B] text-[13px] font-semibold transition-colors">8</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748B] text-[13px] font-semibold transition-colors">9</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748B] text-[13px] font-semibold transition-colors">10</button>
          </div>

          <Button variant="ghost" className="text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
