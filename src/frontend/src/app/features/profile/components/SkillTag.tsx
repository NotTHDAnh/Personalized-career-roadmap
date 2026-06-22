interface SkillTagProps {
  label: string;
  variant?: "default" | "green";
}

export function SkillTag({ label, variant = "default" }: SkillTagProps) {
  if (variant === "green") {
    return (
      <span className="px-2.5 py-1 text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] rounded-full whitespace-nowrap">
        {label}
      </span>
    );
  }

  return (
    <span className="px-3 py-1.5 text-[11px] font-semibold bg-[#E0E7FF] text-[#3B28CC] rounded-full whitespace-nowrap transition-colors">
      {label}
    </span>
  );
}