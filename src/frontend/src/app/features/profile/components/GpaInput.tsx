const BLUE = "#1B365D";

export function GpaInput({ value, defaultValue, onChange }: { value?: string; defaultValue?: string; onChange?: (val: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      defaultValue={defaultValue ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="—"
      className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1"
      style={{
        borderColor: defaultValue || value ? "#E2E8F0" : "#E2E8F0",
        background: defaultValue || value ? "#fff" : "#F8FAFC",
        // @ts-ignore
        "--tw-ring-color": BLUE,
      }}
    />
  );
}