export function SkillTag({ label, variant }: { label: string; variant?: "blue" | "green" }) {
  const isGreen = variant === "green";
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs"
      style={
        isGreen
          ? { background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }
          : { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }
      }
    >
      {label}
    </span>
  );
}