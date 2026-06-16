export type NodeState = "done" | "active" | "locked";

export interface CourseNode {
  id: number;
  name: string;
  code: string;
  shortLabel: string;
  state: NodeState;
  zone: 1 | 2 | 3 | 4;
  source: "university" | "external";
  duration: string;
  prerequisite: string;
  skills: string[];
  gpa?: string; // Optional GPA
  // SVG coords (viewBox 0 0 1100 200)
  cx: number;
  cy: number;
}

export const INITIAL_NODES: CourseNode[] = [
  // ── Zone 1: Foundation (Done) ──
  {
    id: 1,
    name: "Introduction to Computer Science (CS101)",
    code: "CS101",
    shortLabel: "CS101",
    state: "done",
    zone: 1,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "None",
    skills: ["#Logic", "#Syntax", "#ComputerScience"],
    cx: 75,
    cy: 100,
    gpa: "3.8",
  },
  {
    id: 2,
    name: "Web Foundations (Coursera)",
    code: "Coursera",
    shortLabel: "Web\nFound.",
    state: "done",
    zone: 1,
    source: "external",
    duration: "4 Weeks",
    prerequisite: "CS101",
    skills: ["#HTML", "#CSS", "#WebDesign"],
    cx: 165,
    cy: 55,
    gpa: "4.0",
  },
  {
    id: 3,
    name: "Programming Fundamentals (PR101)",
    code: "PR101",
    shortLabel: "PR101",
    state: "done",
    zone: 1,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "CS101",
    skills: ["#Variables", "#ControlFlow", "#Functions"],
    cx: 248,
    cy: 118,
    gpa: "3.9",
  },
  // ── Zone 2: Core Skills (Active) ──
  {
    id: 4,
    name: "Data Structures & Algorithms (DSA201)",
    code: "DSA201",
    shortLabel: "DSA201",
    state: "active",
    zone: 2,
    source: "university",
    duration: "10 Weeks",
    prerequisite: "PR101",
    skills: ["#DataStructures", "#Algorithms", "#Efficiency"],
    cx: 365,
    cy: 78,
  },
  {
    id: 5,
    name: "Database Management Systems (DB202)",
    code: "DB202",
    shortLabel: "DB202",
    state: "active",
    zone: 2,
    source: "university",
    duration: "6 Weeks",
    prerequisite: "PR101",
    skills: ["#SQL", "#Schema", "#Databases"],
    cx: 488,
    cy: 128,
  },
  // ── Zone 3: Advanced (Locked) ──
  {
    id: 6,
    name: "Advanced Java Programming (JA301)",
    code: "JA301",
    shortLabel: "JA301",
    state: "locked",
    zone: 3,
    source: "university",
    duration: "8 Weeks",
    prerequisite: "DSA201",
    skills: ["#OOP", "#Backend", "#Java"],
    cx: 622,
    cy: 72,
  },
  {
    id: 7,
    name: "RESTful API Design (Coursera)",
    code: "Coursera",
    shortLabel: "API\nDesign",
    state: "locked",
    zone: 3,
    source: "external",
    duration: "4 Weeks",
    prerequisite: "JA301",
    skills: ["#RESTful_API", "#HTTP", "#JSON"],
    cx: 742,
    cy: 128,
  },
  // ── Zone 4: Specialisation (Locked) ──
  {
    id: 8,
    name: "Microservices Architecture (MSA401)",
    code: "MSA401",
    shortLabel: "MSA401",
    state: "locked",
    zone: 4,
    source: "university",
    duration: "6 Weeks",
    prerequisite: "RESTful API Design",
    skills: ["#Microservices", "#Docker", "#Distributed"],
    cx: 885,
    cy: 80,
  },
  {
    id: 9,
    name: "Cloud Fundamentals — AWS (Coursera)",
    code: "Coursera",
    shortLabel: "AWS\nCloud",
    state: "locked",
    zone: 4,
    source: "external",
    duration: "6 Weeks",
    prerequisite: "MSA401",
    skills: ["#AWS_Cloud", "#CloudComputing", "#Serverless"],
    cx: 1000,
    cy: 90,
  },
];
