import React, { createContext, useContext } from "react";
import type { NodeState } from "@/app/types";

interface CourseContextType {
  updateNodeState: (nodeId: string, newState: NodeState, gpa?: number) => void;
}

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourseContext() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
}
