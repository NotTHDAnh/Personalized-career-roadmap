const BLUE = "#1B365D";

export function GpaInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue ?? ""}
      placeholder="—"
      className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1"
      style={{
        borderColor: defaultValue ? "#E2E8F0" : "#E2E8F0",
        background: defaultValue ? "#fff" : "#F8FAFC",
        // @ts-ignore
        "--tw-ring-color": BLUE,
      }}
    />
  );
}