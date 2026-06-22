import { Input } from "@/app/components/ui/input";

export function GpaInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <Input
      type="text"
      defaultValue={defaultValue ?? ""}
      placeholder="—"
      className="w-20 text-center bg-white"
    />
  );
}