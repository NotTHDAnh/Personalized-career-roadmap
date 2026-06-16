import { createContext, useContext, useState, ReactNode } from "react";
import type { NodeState } from "@/app/types";

type CourseStatuses = Record<number, NodeState>;

interface CourseContextType {
  courseStatuses: CourseStatuses;
  updateCourseStatus: (id: number, status: NodeState) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  // Initialize with the default states from RoadmapTab's NODES
  const [courseStatuses, setCourseStatuses] = useState<CourseStatuses>({
    1: "done",
    2: "done",
    3: "done",
    4: "active",
    5: "active",
    6: "locked",
    7: "locked",
    8: "locked",
    9: "locked",
  });

  const updateCourseStatus = (id: number, status: NodeState) => {
    setCourseStatuses((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <CourseContext.Provider value={{ courseStatuses, updateCourseStatus }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
}
