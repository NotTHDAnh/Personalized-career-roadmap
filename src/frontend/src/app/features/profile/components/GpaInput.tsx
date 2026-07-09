import { Input } from "@/app/components/ui/input";
import React from "react";

export function GpaInput({ defaultValue, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      type="text"
      defaultValue={defaultValue}
      placeholder="—"
      className="w-20 text-center bg-white"
      {...props}
    />
  );
}