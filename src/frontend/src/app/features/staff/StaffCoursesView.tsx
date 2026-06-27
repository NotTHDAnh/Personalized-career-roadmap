import { BookOpen } from "lucide-react";

export function StaffCoursesView() {
  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-8 flex flex-col bg-[#F4F7F9]">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-[#4F46E5]" />
        </div>
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">Courses Directory</h2>
        <p className="text-[14px] text-[#64748B] max-w-md">
          This section is currently under construction. Future updates will include a comprehensive grid view of all active courses.
        </p>
      </div>
    </div>
  );
}
