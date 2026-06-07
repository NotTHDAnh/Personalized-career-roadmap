import { FileCheck, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
      {/* Identity fields — Full Name & Student ID only */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-4" style={{ color: "#94A3B8", fontWeight: 600 }}>
          Student Personal Profile
        </p>
        <div className="space-y-4">
          {[
            { label: "Full Name", value: "Nguyen Van An" },
            { label: "Student ID", value: "STU-2024-0087" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Import Certificate */}
      <div>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#94A3B8", fontWeight: 600 }}>
          Import Certificate
        </p>

        {/* Drop zone */}
        <div
          className="rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-colors"
          style={{
            border: `2px dashed ${isDragging ? TEAL : "#CBD5E1"}`,
            background: isDragging ? "#F0FDFA" : "#F8FAFC",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-7 h-7" style={{ color: isDragging ? TEAL : "#94A3B8" }} />
          <p className="text-xs text-gray-600" style={{ fontWeight: 500 }}>
            Drop certificate here or{" "}
            <span style={{ color: TEAL }}>browse</span>
          </p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG supported</p>
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
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100"
                style={{ background: "#F0FDF4" }}
              >
                <FileCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate" style={{ fontWeight: 500 }}>{c.name}</p>
                  <p className="text-xs text-gray-400">{c.size}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeCert(c.id); }}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}