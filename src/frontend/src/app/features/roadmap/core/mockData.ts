import { RoadmapDetailDto } from "./types";

export const MOCK_ROADMAP_DTO: RoadmapDetailDto = {
  roadmapId: "rm-001",
  targetRoleName: "Backend Developer",
  dailyStudyHours: 2.0,
  progressPercent: 35.5,
  phases: [
    {
      phaseName: "Month 1",
      nodes: [
        {
          nodeId: "1",
          courseCode: "CS101",
          courseName: "Introduction to Computer Science (CS101)",
          status: "done",
          academicLevel: "Beginner",
        },
        {
          nodeId: "2",
          courseCode: "Coursera",
          courseName: "Web Foundations (Coursera)",
          status: "done",
          parentNodeId: "1",
          academicLevel: "Beginner",
        },
        {
          nodeId: "3",
          courseCode: "PR101",
          courseName: "Programming Fundamentals (PR101)",
          status: "done",
          parentNodeId: "2",
          academicLevel: "Beginner",
        },
      ],
    },
    {
      phaseName: "Month 2",
      nodes: [
        {
          nodeId: "4",
          courseCode: "DSA201",
          courseName: "Data Structures & Algorithms (DSA201)",
          status: "active",
          parentNodeId: "3",
          academicLevel: "Intermediate",
        },
        {
          nodeId: "5",
          courseCode: "DB202",
          courseName: "Database Management Systems (DB202)",
          status: "active",
          parentNodeId: "4",
          academicLevel: "Intermediate",
        },
      ],
    },
    {
      phaseName: "Month 3",
      nodes: [
        {
          nodeId: "6",
          courseCode: "JA301",
          courseName: "Advanced Java Programming (JA301)",
          status: "locked",
          parentNodeId: "5",
          academicLevel: "Advanced",
        },
        {
          nodeId: "7",
          courseCode: "Coursera",
          courseName: "RESTful API Design (Coursera)",
          status: "locked",
          parentNodeId: "6",
          academicLevel: "Advanced",
        },
      ],
    },
    {
      phaseName: "Month 4",
      nodes: [
        {
          nodeId: "8",
          courseCode: "MSA401",
          courseName: "Microservices Architecture (MSA401)",
          status: "locked",
          parentNodeId: "7",
          academicLevel: "Specialization",
        },
        {
          nodeId: "9",
          courseCode: "Coursera",
          courseName: "Cloud Fundamentals — AWS (Coursera)",
          status: "locked",
          parentNodeId: "8",
          academicLevel: "Specialization",
        },
      ],
    },
  ],
};
