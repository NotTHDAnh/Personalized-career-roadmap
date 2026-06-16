import { CheckCircle2, Clock, Circle } from "lucide-react";

export function StatusIcon({ status }: { status: "completed" | "in-progress" | "pending" }) {
  if (status === "completed")
    return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />;
  if (status === "in-progress")
    return <Clock size={15} className="text-sky-500 shrink-0" />;
  return <Circle size={15} className="text-slate-300 shrink-0" />;
}
