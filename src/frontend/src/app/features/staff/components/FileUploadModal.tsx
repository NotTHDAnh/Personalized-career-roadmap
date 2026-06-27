import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Upload, X, FileIcon, CheckCircle2, Loader2, Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { apiClient } from "@/shared/api/apiClient";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  importType?: 'students' | 'courses';
  acceptedTypes?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error" | "saved";
  uploadedSize: number;
}

export function FileUploadModal({ isOpen, onClose, title, importType, acceptedTypes = ".csv, .xlsx" }: FileUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ headers: string[], rows: string[][] } | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  // Simulate file upload progress and validate file locally
  useEffect(() => {
    const uploadingFiles = files.filter((f) => f.status === "uploading");
    
    if (uploadingFiles.length === 0) return;

    uploadingFiles.forEach(async (upload) => {
      // Background validation
      let isValid = true;
      let errorMessage = "";

      try {
        const arrayBuffer = await upload.file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the first row to JSON to get headers
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = (json[0] as string[])?.map(h => typeof h === 'string' ? h.trim() : h) || [];

        const studentExpected = ["STT", "Mã số sinh viên", "Họ và tên", "Email", "Mật khẩu"];
        const courseExpected = ["STT", "Mã môn học", "Tên môn học", "Số tín chỉ", "Tổng số giờ học", "Kỹ năng đầu ra", "Chuẩn đầu ra"];
        
        const expectedHeaders = importType === 'students' ? studentExpected : courseExpected;

        if (headers.length < expectedHeaders.length) {
          isValid = false;
          errorMessage = `File Excel không đúng định dạng. Header cần có: ${expectedHeaders.join(", ")}`;
        } else {
          for (let i = 0; i < expectedHeaders.length; i++) {
            if (headers[i]?.toLowerCase() !== expectedHeaders[i].toLowerCase()) {
              isValid = false;
              errorMessage = `Sai tên cột ở vị trí số ${i + 1}. Mong đợi: "${expectedHeaders[i]}", nhưng nhận được: "${headers[i] || ""}"`;
              break;
            }
          }
        }
      } catch (error) {
        isValid = false;
        errorMessage = "Không thể đọc file. Vui lòng đảm bảo file không bị hỏng và đúng định dạng Excel.";
      }

      // Fake progress interval
      const timer = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === upload.id && f.status === "uploading") {
              const newProgress = Math.min(f.progress + Math.random() * 20, 100);
              const newUploadedSize = (f.file.size * newProgress) / 100;
              
              if (newProgress === 100) {
                clearInterval(timer);
                if (!isValid) {
                  toast.error(`Failed to import ${f.file.name}: ${errorMessage}`);
                }
                return {
                  ...f,
                  progress: 100,
                  uploadedSize: f.file.size,
                  status: isValid ? "completed" : "error",
                };
              }
              
              return {
                ...f,
                progress: newProgress,
                uploadedSize: newUploadedSize,
              };
            }
            return f;
          })
        );
      }, 150); // Speed up fake progress slightly
    });
  }, [files, importType]);

  const processUploads = async () => {
    const stagedFiles = files.filter(f => f.status === "completed");
    if (stagedFiles.length === 0) return;

    setIsSubmitting(true);
    let hasError = false;

    for (const upload of stagedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        
        const endpoint = importType === 'students' 
          ? '/Staff/import-students' 
          : '/Staff/import-courses';
          
        await apiClient.post(endpoint, formData);
        
        setFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: "saved" } : f));
      } catch (err: any) {
        hasError = true;
        setFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: "error" } : f));
        toast.error(`Failed to import ${upload.file.name}: ${err.response?.data?.message || err.message}`);
      }
    }

    setIsSubmitting(false);

    if (!hasError) {
      toast.success(`${stagedFiles.length} file(s) imported successfully!`);
      onClose();
      setTimeout(() => setFiles([]), 300);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    newFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx")) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Unsupported files discarded: ${invalidFiles.join(", ")}. Only .csv and .xlsx are allowed.`);
    }

    if (validFiles.length === 0) return;

    const newUploads: UploadingFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: "uploading",
      uploadedSize: 0,
    }));
    setFiles((prev) => [...prev, ...newUploads]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handlePreview = (file: File) => {
    const isSupported = file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".xlsx");
    if (!isSupported) {
      toast.error(`Preview is only available for CSV and XLSX files. (Selected: ${file.name})`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        
        // Use SheetJS (xlsx) to read the file (works for both CSV and Excel)
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to an array of arrays
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          toast.error("The file is empty.");
          return;
        }

        // The first row is headers, the next 5 rows are data
        const headers = (jsonData[0] || []).map(h => String(h));
        const rows = jsonData.slice(1, 6).map(row => 
          // Pad rows with empty strings if they have fewer columns than headers
          headers.map((_, i) => (row[i] !== undefined ? String(row[i]) : ""))
        );
        
        setPreviewData({ headers, rows });
        setPreviewFileName(file.name);
        setPreviewOpen(true);
      } catch (error) {
        console.error("Preview error:", error);
        toast.error("Failed to parse file for preview.");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    // Read as ArrayBuffer for xlsx compatibility
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl shadow-xl border-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold text-[#0F172A] m-0">Upload {title}</DialogTitle>
              <p className="text-[13px] text-[#64748B] mt-0.5">Select and upload the files of your choice</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
              isDragging ? "border-[#8B5CF6] bg-[#F5F3FF]" : "border-[#E2E8F0] bg-[#F8FAFC]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Button
              variant="outline"
              className="bg-white border-[#E2E8F0] text-[#0F172A] font-semibold h-9 px-4 rounded-lg shadow-sm mb-4 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <p className="text-[14px] font-semibold text-[#0F172A] mb-1">
              Choose a file or drag & drop it here
            </p>
            <p className="text-[13px] text-[#64748B]">
              Maximum 500 MB file size
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept={acceptedTypes}
              onChange={handleFileSelect}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {files.map((fileObj) => (
                <div key={fileObj.id} className="border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-3 relative bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex flex-col items-center justify-center flex-shrink-0 text-[#3B82F6]">
                      <FileText className="w-4 h-4 mb-0.5" />
                      <span className="text-[8px] font-black tracking-wider">FILE</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0F172A] truncate pr-8 mb-1">
                        {fileObj.file.name}
                      </h4>
                      <div className="flex items-center text-[12px] text-[#64748B] font-medium">
                        <span>{formatSize(fileObj.uploadedSize)} / {formatSize(fileObj.file.size)}</span>
                        <span className="mx-2">•</span>
                        {fileObj.status === "completed" || fileObj.status === "saved" ? (
                          <span className="text-[#10B981] flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : fileObj.status === "error" ? (
                          <span className="text-[#EF4444] flex items-center gap-1 font-semibold">
                            <X className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        ) : (
                          <span className="text-[#64748B] flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 flex items-center gap-1">
                      {fileObj.status === "completed" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(fileObj.file);
                          }}
                          className="p-1 text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
                          title="Preview File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(fileObj.id);
                        }}
                        className="p-1 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                      >
                        {fileObj.status === "completed" || fileObj.status === "saved" || fileObj.status === "error" ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {fileObj.status === "uploading" && (
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={fileObj.progress} 
                        className="h-1.5 flex-1 bg-[#E2E8F0] [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#3B82F6] [&>[data-slot=progress-indicator]]:to-[#8B5CF6]" 
                      />
                      <span className="text-[11px] font-bold text-[#0F172A] w-8 text-right">
                        {Math.round(fileObj.progress)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#E2E8F0] bg-gray-50/50 flex sm:justify-end gap-2 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              toast.info("Import cancelled.");
              onClose();
              // Reset state for next time
              setTimeout(() => setFiles([]), 300);
            }}
            disabled={isSubmitting}
            className="text-[#64748B] border-[#E2E8F0] hover:bg-white bg-transparent h-10 px-6 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (files.length === 0) {
                toast.error("Please select at least one file to attach.");
                return;
              }
              const readyFiles = files.filter(f => f.status === "completed");
              if (readyFiles.length === 0) {
                toast.info("No files ready to attach.");
                onClose();
                setTimeout(() => setFiles([]), 300);
                return;
              }
              processUploads();
            }}
            disabled={isSubmitting}
            className="bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white h-10 px-8 font-semibold shadow-sm min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Attach Files"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Preview: {previewFileName}</DialogTitle>
          <p className="text-sm text-gray-500">Showing first 5 rows</p>
        </DialogHeader>
        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                {previewData?.headers.map((header, i) => (
                  <TableHead key={i} className="whitespace-nowrap">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData?.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j} className="whitespace-nowrap max-w-[200px] truncate">{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
              {previewData?.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={previewData?.headers.length} className="text-center text-gray-500">
                    No data rows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
