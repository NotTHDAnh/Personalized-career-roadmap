import { FileCheck, UploadCloud, X, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { StudentDetailDto } from "@/app/types";
import { useAuth } from "@/shared/contexts/AuthContext";

interface RecordFile {
  id: number;
  name: string;
  size: string;
}

interface StudentProfileCardProps {
  studentDetail?: StudentDetailDto | null;
}

export function StudentProfileCard({ studentDetail }: StudentProfileCardProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [records, setRecords] = useState<RecordFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transcript import handler calling the API
  const handleTranscriptUpload = async (file: File) => {
    if (!file) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5007/api";
    const token = localStorage.getItem("accessToken");
    
    try {
      const response = await fetch(`${API_BASE_URL}/Student/academic-records/import`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to import");
      }
      
      const data = await response.json();
      
      if (data && (data.failedCount > 0 || data.successCount === 0)) {
        if (data.successCount === 0) {
          const errorMsgs = data.errors?.length > 0 
            ? data.errors.map((e: any) => `Row ${e.row}: ${e.errorMessage}`).join(' | ') 
            : 'The file contains no valid data rows.';
          toast.error(`No records were added. Details: ${errorMsgs}`);
        } else {
          const errorMsgs = data.errors?.map((e: any) => `Row ${e.row}: ${e.errorMessage}`).join(' | ');
          toast.warning(`Imported ${data.successCount} records. Failed ${data.failedCount} rows. Details: ${errorMsgs}`);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        if (data.successCount > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        }
        return;
      }
      
      const newRecord: RecordFile = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      };
      setRecords([newRecord]);
      
      toast.success(`Academic records imported successfully! (${data.successCount || 0} records) Refreshing...`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Transcript import API failed:", err);
      
      let errorData: any = null;
      try {
        errorData = JSON.parse(err.message);
      } catch {
        errorData = null;
      }

      let errorMessage = "Failed to import academic records.";
      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).flat().join('\\n');
      } else if (errorData?.message || errorData?.title) {
        errorMessage = errorData.message || errorData.title;
      } else if (err.message && err.message !== "[object Object]") {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsImporting(false);
    }
  };

  const removeRecord = () => setRecords([]);

  // Download template for academic records transcript
  const handleDownloadTranscriptTemplate = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5007/api";
    const token = localStorage.getItem("accessToken");
    
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/Student/academic-records/template`, { headers });
      if (!response.ok) throw new Error("Failed to download");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AcademicRecordsTemplate.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download template.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] flex flex-col transition-colors duration-300">
      {/* Profile Header Area */}
      <div className="p-5 flex flex-col items-center text-center border-b border-[#E2E8F0] transition-colors">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-[64px] h-[64px] rounded-full object-cover shadow-sm border border-[#C7D2FE] mb-3" />
        ) : (
          <div className="w-[64px] h-[64px] bg-[#E0E7FF] text-[#3B28CC] rounded-full mb-3 flex items-center justify-center font-bold text-[24px] shadow-sm border border-[#C7D2FE]">
            {studentDetail?.name ? studentDetail.name.substring(0, 2).toUpperCase() : "NA"}
          </div>
        )}
        <h3 className="text-[16px] font-bold text-[#0F172A] tracking-tight mb-0.5">
          {studentDetail?.name || "Loading..."}
        </h3>
        <div className="mt-2 flex gap-2 justify-center">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#E0E7FF] text-[#3B28CC]">
            {studentDetail?.role || "STUDENT"}
          </span>
        </div>
      </div>

      {/* Personal Info & Academic Record Area */}
      <div className="p-5 flex flex-col gap-4">
        <div>
          <h4 className="text-[13px] font-bold text-[#0F172A] mb-3">
            Personal Information
          </h4>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 ml-1">
                Full Name
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[12px] text-[#334155] font-medium transition-colors">
                {studentDetail?.name || "-"}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 ml-1">
                Student ID
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[12px] text-[#334155] font-medium transition-colors">
                {studentDetail?.id || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0]" />

        {/* Academic Record Upload Section */}
        <div>
          <h4 className="text-[13px] font-bold text-[#0F172A] mb-2.5">
            Import Academic Record
          </h4>

          {/* Drop zone */}
          <div
            className={`rounded-xl p-4 flex flex-col items-center gap-1.5 cursor-pointer transition-colors border-[1.5px] border-dashed ${
              isDragging
                ? "border-[#3B28CC] bg-[#F0F5FF]"
                : "border-[#E2E8F0] bg-[#F8FAFC]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleTranscriptUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => {
              if (!isImporting) {
                fileInputRef.current?.click();
              }
            }}
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 mb-0.5 text-[#3B28CC] animate-spin" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 mb-0.5 text-[#94A3B8]" />
            )}
            <p className="text-[12px] text-[#334155] font-medium text-center">
              {isImporting ? "Uploading..." : <>Drop transcript Excel or <span className="text-[#3B28CC] font-semibold">browse</span></>}
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              Excel (.xlsx) only
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleTranscriptUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Download Transcript Template Link */}
          <div className="mt-2.5 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTranscriptTemplate();
              }}
              className="text-[#3B28CC] hover:text-[#251b9e] text-[11px] font-bold flex items-center gap-1 transition-colors hover:underline focus:outline-none cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download template
            </button>
          </div>

          {/* Uploaded file list */}
          {records.length > 0 && (
            <div className="mt-3 space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#10B981]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#334155] font-semibold truncate">
                      {r.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecord();
                    }}
                    className="p-1 hover:bg-[#E2E8F0] rounded-md transition-colors"
                  >
                    <X className="w-3 h-3 text-[#64748B] hover:text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}