import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[150px]">
      <Loader2 className={`w-8 h-8 animate-spin text-[#0D9488] ${className ?? ""}`} />
    </div>
  );
}
