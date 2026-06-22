import { FileCheck, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface CertFile {
  id: number;
  name: string;
  size: string;
}

export function StudentProfileCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [certs, setCerts] = useState<CertFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newCerts: CertFile[] = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setCerts((prev) => [...prev, ...newCerts]);
  };

  const removeCert = (id: number) => setCerts((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-[#E2E8F0] flex flex-col transition-colors duration-300">
      {/* Profile Header Area */}
      <div className="p-5 flex flex-col items-center text-center border-b border-[#E2E8F0] transition-colors">
        <div className="w-[64px] h-[64px] bg-[#E0E7FF] text-[#3B28CC] rounded-full mb-3 flex items-center justify-center font-bold text-[24px] shadow-sm border border-[#C7D2FE]">
          NA
        </div>
        <h3 className="text-[16px] font-bold text-[#0F172A] tracking-tight mb-0.5">
          Nguyen Van An
        </h3>
        <div className="mt-2 flex gap-2 justify-center">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#E0E7FF] text-[#3B28CC]">
            STUDENT
          </span>
        </div>
      </div>

      {/* Personal Info & Certificate Area */}
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
                Nguyen Van An
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 ml-1">
                Student ID
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-[12px] text-[#334155] font-medium transition-colors">
                STU-2024-0087
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0]" />

        <div>
          <h4 className="text-[13px] font-bold text-[#0F172A] mb-2.5">
            Import Certificate
          </h4>

          {/* Drop zone */}
          <div
            className={`rounded-xl p-4 flex flex-col items-center gap-1.5 cursor-pointer transition-colors border-[1.5px] border-dashed ${
              isDragging
                ? "border-[#3B28CC] bg-[#F0F5FF]"
                : "border-[#CBD5E1] bg-[#F8FAFC]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud
              className={`w-5 h-5 mb-0.5 transition-colors ${
                isDragging ? "text-[#3B28CC]" : "text-[#94A3B8]"
              }`}
            />
            <p className="text-[12px] text-[#334155] font-medium">
              Drop here or <span className="text-[#3B28CC] font-semibold">browse</span>
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              PDF, JPG, PNG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Uploaded cert list */}
          {certs.length > 0 && (
            <div className="mt-3 space-y-2">
              {certs.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#10B981]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#334155] font-semibold truncate">
                      {c.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCert(c.id);
                    }}
                    className="p-1 hover:bg-[#E2E8F0]:bg-slate-700 rounded-md transition-colors"
                  >
                    <X className="w-3 h-3 text-[#64748B] hover:text-[#EF4444]:text-red-400" />
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