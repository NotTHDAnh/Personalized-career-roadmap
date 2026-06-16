import { useState } from "react";
import { Input } from "@/app/components/ui/input";

interface GpaInputProps {
  value?: string;
  onChange?: (val: string) => void;
}

export function GpaInput({ value, onChange }: GpaInputProps) {
  const [localVal, setLocalVal] = useState(value || "");

  const handleBlur = () => {
    if (onChange && localVal !== value) {
      onChange(localVal);
    }
  };

  return (
    <Input
      type="text"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      placeholder="—"
      className="w-20 text-center bg-white dark:bg-input/30"
    />
  );
}