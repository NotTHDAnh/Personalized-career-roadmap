import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, ShieldCheck, Trash2, Users, Pencil } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

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
  status: boolean;
  deleteHistory: boolean;
}

interface StudentDetail extends Student {
  email: string;
  createdAt: string;
  courses: { courseId?: string, courseName: string, gpa: number, examAttempts?: number }[];
}

export function StaffStudentsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecycleBin, setIsRecycleBin] = useState(false);

  // Modals state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<StudentDetail | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmDeactiveOpen, setIsConfirmDeactiveOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [isConfirmDeleteGradeOpen, setIsConfirmDeleteGradeOpen] = useState(false);
  const [deleteGradeInfo, setDeleteGradeInfo] = useState<{ courseId: string, courseName: string } | null>(null);

  const [availableCourses, setAvailableCourses] = useState<{courseId: string, courseName: string}[]>([]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    status: false,
    createdAt: "",
    courses: [] as {courseId: string, gpa: number | string, examAttempts: number | string}[]
  });

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Student[]>(`/Staff/students?deleted=${isRecycleBin}`);
      setStudentsData(data);
    } catch (error) {
      toast.error("Failed to fetch students data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get<any[]>('/Staff/courses');
      setAvailableCourses(data.map(c => ({ courseId: c.courseId, courseName: c.courseName })));
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [isRecycleBin]);

  const filteredStudents = studentsData.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isRecycleBin]);

  // Actions
  const handleOpenDetail = async (id: string) => {
    try {
      const data = await apiClient.get<StudentDetail>(`/Staff/students/${id}`);
      setDetailData(data);
      
      let dateVal = "";
      if (data.createdAt && data.createdAt !== "N/A") {
        try { dateVal = new Date(data.createdAt).toISOString().split('T')[0]; } catch(e){}
      }
      setEditForm({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: dateVal,
        courses: data.courses.map(c => ({ courseId: c.courseId || "", gpa: c.gpa, examAttempts: c.examAttempts ?? 1 }))
      });
      setIsEditing(false);
      setIsDetailOpen(true);
    } catch (error) {
      toast.error("Failed to fetch student details");
    }
  };

  const handleSaveDetail = async () => {
    if (!detailData) return;
    try {
      setIsSaving(true);
      await apiClient.put(`/Staff/students/${detailData.id}`, {
        fullName: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        createdAt: editForm.createdAt ? new Date(editForm.createdAt).toISOString() : null,
        courses: editForm.courses.map(c => ({
          courseId: c.courseId,
          gpa: typeof c.gpa === 'string' ? (parseFloat(c.gpa) || 0) : c.gpa,
          examAttempts: typeof c.examAttempts === 'string' ? (parseInt(c.examAttempts) || 1) : c.examAttempts
        }))
      });
      toast.success("Updated successfully");
      setIsEditing(false);
      handleOpenDetail(detailData.id); // refresh modal data
      fetchStudents(); // refresh list
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedStudentId) return;
    try {
      await apiClient.patch(`/Staff/students/${selectedStudentId}/toggle-status`, {});
      toast.success("Cập nhật trạng thái thành công");
      fetchStudents();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsConfirmDeactiveOpen(false);
    }
  };

  const handleToggleDelete = async () => {
    if (!selectedStudentId) return;
    try {
      await apiClient.patch(`/Staff/students/${selectedStudentId}/toggle-delete`, {});
      toast.success("Cập nhật thành công");
      fetchStudents();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsConfirmDeleteOpen(false);
      setIsConfirmRestoreOpen(false);
    }
  };

  const handleOpenConfirmDeleteGrade = (courseId: string, courseName: string) => {
    setDeleteGradeInfo({ courseId, courseName });
    setIsConfirmDeleteGradeOpen(true);
  };

  const handleDeleteGrade = async () => {
    if (!detailData || !deleteGradeInfo) return;
    try {
      await apiClient.delete(`/Staff/students/${detailData.id}/courses/${deleteGradeInfo.courseId}`);
      toast.success(`Đã xóa điểm môn học ${deleteGradeInfo.courseName}`);
      handleOpenDetail(detailData.id); // refresh modal data
      fetchStudents(); // refresh list
    } catch (error) {
      toast.error("Xóa điểm môn học thất bại");
    } finally {
      setIsConfirmDeleteGradeOpen(false);
      setDeleteGradeInfo(null);
    }
  };

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
              <span className="text-[#3B28CC]">{isRecycleBin ? "Recycle Bin" : "Students"}</span>
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
              {isRecycleBin ? "Recycle Bin" : "Students"} ({filteredStudents.length})
            </h1>
            <p className="text-[13px] text-[#64748B]">
              {isRecycleBin ? "The list of deleted accounts." : "All the students of the institution are listed here"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsRecycleBin(!isRecycleBin)}
              className="flex items-center gap-2"
            >
              {isRecycleBin ? (
                <><Users className="w-4 h-4" /> Students List</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Recycle Bin</>
              )}
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
          {isLoading ? (
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
              
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#0F172A]">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDetail(student.id)}>
                      More Detail
                    </DropdownMenuItem>
                    {!isRecycleBin ? (
                      <>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsConfirmDeactiveOpen(true);
                        }}>
                          {student.status ? "Deactive Account" : "Active Account"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsConfirmDeleteOpen(true);
                        }}>
                          Delete Account
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem className="text-green-600" onClick={() => {
                        setSelectedStudentId(student.id);
                        setIsConfirmRestoreOpen(true);
                      }}>
                        Restore Account
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] font-bold text-[#0F172A] leading-snug">{student.name}</h3>
                    <div className={`w-1.5 h-1.5 rounded-full ${student.deleteHistory ? 'bg-black' : student.status ? 'bg-green-500' : 'bg-red-500'}`} title={student.deleteHistory ? 'Deleted' : student.status ? 'Active' : 'Deactive'}></div>
                  </div>
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

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="absolute right-12 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" 
              title="Edit Student"
            >
              <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-600" />
              <span className="sr-only">Edit</span>
            </button>
          )}

          {detailData && (
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Full Name</p>
                  {isEditing ? (
                    <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-8 text-sm" />
                  ) : (
                    <p className="text-sm font-medium">{detailData.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Student Code</p>
                  {isEditing ? (
                    <Input value={detailData.id} disabled className="h-8 text-sm bg-gray-50 text-gray-500" />
                  ) : (
                    <p className="text-sm font-medium">{detailData.id}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Email</p>
                  {isEditing ? (
                    <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-8 text-sm" />
                  ) : (
                    <p className="text-sm font-medium">{detailData.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Target Role</p>
                  {isEditing ? (
                    <Input value={detailData.role} disabled className="h-8 text-sm bg-gray-50 text-gray-500" />
                  ) : (
                    <p className="text-sm font-medium">{detailData.role}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Status</p>
                  {isEditing ? (
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.status} 
                        onChange={e => setEditForm({...editForm, status: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        disabled={detailData.deleteHistory}
                      />
                      <span className="text-sm font-medium">{detailData.deleteHistory ? "Deleted (Cannot Edit)" : editForm.status ? "Active" : "Deactivated"}</span>
                    </label>
                  ) : (
                    <p className="text-sm font-medium">
                      {detailData.deleteHistory ? (
                        <span className="text-red-600 font-bold">Deleted</span>
                      ) : detailData.status ? (
                        <span className="text-green-600 font-bold">Active</span>
                      ) : (
                        <span className="text-red-600 font-bold">Deactivated</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Enrolled Date</p>
                  {isEditing ? (
                    <Input value={detailData.createdAt} disabled className="h-8 text-sm bg-gray-50 text-gray-500" />
                  ) : (
                    <p className="text-sm font-medium">{detailData.createdAt}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-2">Skills</p>
                <div className="flex gap-2 flex-wrap">
                  {detailData.tags.map((tag, idx) => (
                    <span key={idx} className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-bold mb-2">Academic Records (Courses)</p>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 font-bold">Course Name</th>
                        <th className="px-4 py-2 font-bold w-24 text-right">GPA / Score</th>
                        <th className="px-4 py-2 font-bold w-24 text-right">Exam Attempts</th>
                        <th className="px-4 py-2 font-bold w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isEditing ? (
                        <>
                          {editForm.courses.map((c, idx) => (
                            <tr key={idx} className="border-t border-gray-200">
                              <td className="px-4 py-2">
                                <select 
                                  value={c.courseId} 
                                  onChange={e => {
                                    const newCourses = [...editForm.courses];
                                    newCourses[idx].courseId = e.target.value;
                                    setEditForm({...editForm, courses: newCourses});
                                  }}
                                  className="w-full h-8 rounded-md border border-gray-300 text-sm px-2"
                                >
                                  <option value="" disabled>-- Chọn môn học --</option>
                                  {availableCourses.map(ac => {
                                    // Kiểm tra xem môn học này đã được chọn ở một dòng khác chưa
                                    const isSelectedElsewhere = editForm.courses.some(
                                      (course, courseIdx) => courseIdx !== idx && course.courseId === ac.courseId
                                    );
                                    return (
                                      <option 
                                        key={ac.courseId} 
                                        value={ac.courseId} 
                                        disabled={isSelectedElsewhere}
                                      >
                                        {ac.courseName}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex flex-col items-end">
                                  <Input 
                                    type="number" 
                                    min="5.0" 
                                    max="10.0" 
                                    step="0.1"
                                    value={c.gpa} 
                                    onChange={e => {
                                      const newCourses = [...editForm.courses];
                                      newCourses[idx].gpa = e.target.value;
                                      setEditForm({...editForm, courses: newCourses});
                                    }}
                                    className="h-8 w-20 text-right ml-auto"
                                  />
                                  {c.gpa !== "" && (Number(c.gpa) < 5.0 || Number(c.gpa) > 10.0) && (
                                    <span className="text-red-500 text-[11px] whitespace-nowrap mt-1 font-medium">Must between: 5.0 - 10.0</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex flex-col items-end">
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    step="1"
                                    value={c.examAttempts} 
                                    onChange={e => {
                                      const newCourses = [...editForm.courses];
                                      newCourses[idx].examAttempts = e.target.value;
                                      setEditForm({...editForm, courses: newCourses});
                                    }}
                                    className="h-8 w-16 text-right ml-auto"
                                  />
                                  {c.examAttempts !== "" && Number(c.examAttempts) < 1 && (
                                    <span className="text-red-500 text-[11px] whitespace-nowrap mt-1 font-medium">Must be &gt;= 1</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button onClick={() => {
                                  const newCourses = editForm.courses.filter((_, i) => i !== idx);
                                  setEditForm({...editForm, courses: newCourses});
                                }} className="text-red-500 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-center">
                              <Button variant="outline" size="sm" onClick={() => {
                                setEditForm({...editForm, courses: [...editForm.courses, { courseId: "", gpa: 5.0, examAttempts: 1 }]});
                              }} className="text-blue-600 border-blue-600 hover:bg-blue-50">+ Thêm môn học</Button>
                            </td>
                          </tr>
                        </>
                      ) : (
                        detailData.courses && detailData.courses.length > 0 ? (
                          detailData.courses.map((c, idx) => (
                            <tr key={idx} className="border-t border-gray-200">
                              <td className="px-4 py-2 font-medium text-gray-900">{c.courseName}</td>
                              <td className="px-4 py-2 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${c.gpa >= 5.0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {c.gpa.toFixed(1)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right text-gray-600 font-medium">
                                {c.examAttempts || 1}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button 
                                  onClick={() => handleOpenConfirmDeleteGrade(c.courseId || "", c.courseName)} 
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-t border-gray-200">
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">
                              No enrolled courses yet
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Actions Footer */}
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                  <Button 
                    onClick={handleSaveDetail} 
                    disabled={isSaving || !editForm.courses.every(c => {
                      const val = typeof c.gpa === 'string' ? parseFloat(c.gpa) : c.gpa;
                      const attempts = typeof c.examAttempts === 'string' ? parseInt(c.examAttempts) : c.examAttempts;
                      return !isNaN(val) && val >= 5.0 && val <= 10.0 && c.gpa !== "" && c.courseId !== "" && !isNaN(attempts) && attempts >= 1 && c.examAttempts !== "";
                    })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Deactive Modal */}
      <AlertDialog open={isConfirmDeactiveOpen} onOpenChange={setIsConfirmDeactiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of this student? Deactivated students will not be able to log in to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Modal */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? The account will be moved to the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleToggleDelete}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Restore Modal */}
      <AlertDialog open={isConfirmRestoreOpen} onOpenChange={setIsConfirmRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Restoration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this account? The account will be returned to the active students list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={handleToggleDelete}>Restore Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Grade Modal */}
      <AlertDialog open={isConfirmDeleteGradeOpen} onOpenChange={setIsConfirmDeleteGradeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Grade Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa điểm môn học <strong>{deleteGradeInfo?.courseName}</strong> của sinh viên này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteGrade}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
