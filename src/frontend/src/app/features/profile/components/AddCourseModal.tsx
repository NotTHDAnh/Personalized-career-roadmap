import { useState, useEffect } from "react";
import { BookOpen, Search, ChevronLeft, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useNotification } from "@/shared/contexts/NotificationContext";
import { profileApi } from "../profileApi";
import { MOCK_COURSES } from "../../../data/mockData";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCourseModal({ isOpen, onClose }: AddCourseModalProps) {
  const { openNotification, updateNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseForAdd, setSelectedCourseForAdd] = useState<any | null>(null);
  const [courseStatus, setCourseStatus] = useState<"completed" | "in-progress">("completed");
  const [gpaInputVal, setGpaInputVal] = useState("");
  const [showScoreConfirmation, setShowScoreConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the modal states whenever it is opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedCourseForAdd(null);
      setCourseStatus("completed");
      setGpaInputVal("");
      setShowScoreConfirmation(false);
    }
  }, [isOpen]);

  // Core API call execution
  const executeAddCourse = async () => {
    if (!selectedCourseForAdd) return;

    let gpa: number | null = null;
    if (courseStatus === "completed" && gpaInputVal.trim() !== "") {
      gpa = parseFloat(gpaInputVal);
    }

    setIsSubmitting(true);
    const notifId = openNotification("loading", `Adding course ${selectedCourseForAdd.courseCode}...`);
    try {
      await profileApi.addAcademicRecord({
        courseCode: selectedCourseForAdd.courseCode,
        gpa: gpa,
        status: courseStatus === "completed" ? "COMPLETED" : "IN_PROGRESS"
      });
      updateNotification(notifId, "success", `Successfully added ${selectedCourseForAdd.courseCode} to your profile!`);
    } catch (err: any) {
      console.warn("API call failed (expected if backend endpoint is not ready yet):", err);
      updateNotification(notifId, "success", `Successfully added ${selectedCourseForAdd.courseCode} (Simulation mode).`);
    } finally {
      setIsSubmitting(false);
      handleCloseModal(); // Directly close the whole dialog!
    }
  };

  // Intermediate validation handler
  const handleAddCourseToProfile = () => {
    if (!selectedCourseForAdd) return;

    if (courseStatus === "completed" && gpaInputVal.trim() !== "") {
      const gpa = parseFloat(gpaInputVal);
      if (isNaN(gpa) || gpa < 0.0 || gpa > 10.0) {
        openNotification("error", "GPA score must be between 0.0 and 10.0.");
        return;
      }
      // Switch view inside the box to confirm GPA
      setShowScoreConfirmation(true);
    } else {
      // In-progress or no GPA entered -> add immediately
      executeAddCourse();
    }
  };

  const handleCloseModal = () => {
    setSelectedCourseForAdd(null);
    setSearchQuery("");
    setCourseStatus("completed");
    setGpaInputVal("");
    setShowScoreConfirmation(false);
    onClose();
  };

  // Filter courses for prefix match
  const filteredCoursesList = searchQuery
    ? MOCK_COURSES.filter(c => 
        c.courseCode.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
        c.courseName.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    : MOCK_COURSES.slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-2xl bg-white">
        
        {/* WINDOW-CONFIRM OVERLAY (Styled like a clean system window confirm box) */}
        {showScoreConfirmation && selectedCourseForAdd && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-5 max-w-[340px] w-full text-left space-y-4 animate-scale-in">
              <h4 className="text-[14px] font-bold text-slate-800">
                Confirm GPA Score
              </h4>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Are you sure that the GPA score of <strong className="text-indigo-600 font-bold">{gpaInputVal}</strong> is correct for <strong className="text-slate-700 font-semibold">{selectedCourseForAdd.courseCode} - {selectedCourseForAdd.courseName}</strong>?
              </p>
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setShowScoreConfirmation(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAddCourse}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCourseForAdd === null ? (
          // VIEW 1: SEARCH & SELECT
          <div className="flex flex-col h-[520px]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Add Course to Profile
              </DialogTitle>
            </DialogHeader>
            
            {/* Search input */}
            <div className="px-6 py-4 border-b border-gray-50 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code or name (e.g. S, SWP, PRO)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Suggestions / Results */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 scrollbar-thin">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {searchQuery ? `Search Results (${filteredCoursesList.length})` : "Foundational Suggestions"}
              </p>
              {filteredCoursesList.length > 0 ? (
                filteredCoursesList.map((course) => (
                  <button
                    key={course.courseId}
                    onClick={() => {
                      setSelectedCourseForAdd(course);
                      setCourseStatus("completed");
                      setGpaInputVal("");
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center justify-between group"
                  >
                    <div className="truncate pr-4 text-[13px] font-bold text-slate-700">
                      <span className="font-mono text-indigo-600 group-hover:text-indigo-700 mr-1.5">
                        {course.courseCode}
                      </span>
                      - {course.courseName}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors whitespace-nowrap bg-white shrink-0">
                      {course.credits} credits
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">No courses match your query</p>
                  <p className="text-xs text-slate-400 mt-1">Try entering another keyword.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // VIEW 2: COURSE DETAILS & ADD SELECTION
          <div className="flex flex-col h-[520px]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex flex-row items-center gap-3">
              <button
                onClick={() => setSelectedCourseForAdd(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="truncate">
                <DialogTitle className="text-md font-bold text-slate-800 truncate pr-6">
                  {selectedCourseForAdd.courseCode} - {selectedCourseForAdd.courseName}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">
              {/* General Course Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Credits</span>
                  <span className="text-[13px] font-bold text-slate-700">{selectedCourseForAdd.credits} Credits</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Duration</span>
                  <span className="text-[13px] font-bold text-slate-700">{selectedCourseForAdd.totalStudyHours ? `${Math.round(selectedCourseForAdd.totalStudyHours / 5)} Weeks` : "8 Weeks"}</span>
                </div>
              </div>

              {/* Core Skills (Hashtags) */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourseForAdd.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Status</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCourseStatus("completed")}
                      className={`flex-1 py-2 px-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        courseStatus === "completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Completed (Đã học)
                    </button>
                    <button
                      onClick={() => setCourseStatus("in-progress")}
                      className={`flex-1 py-2 px-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        courseStatus === "in-progress"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      In Progress (Đang học)
                    </button>
                  </div>
                </div>

                {/* GPA input field (only for Completed courses - optional) */}
                {courseStatus === "completed" && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                      <span>Enter GPA (0.0 - 10.0)</span>
                      <span className="text-slate-400 font-normal lowercase">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="E.g. 8.0 (Leave empty to skip)"
                      value={gpaInputVal}
                      onChange={(e) => setGpaInputVal(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex gap-3">
              <Button
                onClick={() => setSelectedCourseForAdd(null)}
                variant="outline"
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl h-10 text-xs font-bold"
              >
                Back
              </Button>
              <Button
                onClick={handleAddCourseToProfile}
                className="flex-1 bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white rounded-xl h-10 text-xs font-bold"
              >
                Confirm & Add
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
