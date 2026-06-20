import { Badge } from "@/app/components/ui/badge";

export function SkillTag({ label, variant }: { label: string; variant?: "blue" | "green" }) {
  const isGreen = variant === "green";
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-xs border ${
        isGreen
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-blue-50 text-blue-600 border-blue-200"
      }`}
    >
      {label}
    </Badge>
  );
}