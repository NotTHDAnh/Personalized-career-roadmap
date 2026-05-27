import type { CourseRecord, RoadmapPhase } from "../types";

export const ALL_COURSES = [
  { code: "CS101", name: "Introduction to Programming", credits: 3, prereqs: [] },
  { code: "CS201", name: "Data Structures & Algorithms", credits: 4, prereqs: ["CS101"] },
  { code: "CS301", name: "Software Engineering", credits: 3, prereqs: ["CS201"] },
  { code: "CS302", name: "Operating Systems", credits: 3, prereqs: ["CS201"] },
  { code: "CS401", name: "Senior Capstone Project", credits: 6, prereqs: ["CS301", "CS302"] },
  { code: "WEB101", name: "HTML & CSS Fundamentals", credits: 2, prereqs: [] },
  { code: "WEB201", name: "JavaScript & TypeScript", credits: 3, prereqs: ["WEB101"] },
  { code: "WEB301", name: "React & Modern Frontend", credits: 3, prereqs: ["WEB201"] },
  { code: "WEB302", name: "State Management & Testing", credits: 3, prereqs: ["WEB301"] },
  { code: "DB101", name: "Database Fundamentals", credits: 3, prereqs: [] },
  { code: "DB201", name: "Advanced SQL & NoSQL", credits: 3, prereqs: ["DB101"] },
  { code: "DB301", name: "Data Warehousing & ETL", credits: 3, prereqs: ["DB201"] },
  { code: "MATH101", name: "Discrete Mathematics", credits: 3, prereqs: [] },
  { code: "MATH201", name: "Linear Algebra & Statistics", credits: 3, prereqs: ["MATH101"] },
  { code: "NET101", name: "Computer Networks", credits: 3, prereqs: ["CS101"] },
  { code: "SEC201", name: "Information Security", credits: 3, prereqs: ["NET101"] },
  { code: "CLOUD201", name: "Cloud Computing", credits: 3, prereqs: ["NET101", "CS201"] },
  { code: "ML201", name: "Machine Learning", credits: 4, prereqs: ["MATH201", "DB101"] },
];

export const ROADMAPS: Record<string, RoadmapPhase[]> = {
  "Frontend Developer": [
    {
      phase: "Phase 1 — Foundation",
      colorClass: "border-emerald-200 bg-emerald-50",
      headerColor: "text-emerald-700 bg-emerald-100",
      nodes: [
        { code: "CS101", name: "Intro to Programming", skill: "Logic & Python", status: "completed" },
        { code: "WEB101", name: "HTML & CSS", skill: "Web Markup & Styling", status: "completed" },
        { code: "MATH101", name: "Discrete Mathematics", skill: "Logic & Sets", status: "completed" },
      ],
    },
    {
      phase: "Phase 2 — Core Web",
      colorClass: "border-sky-200 bg-sky-50",
      headerColor: "text-sky-700 bg-sky-100",
      nodes: [
        { code: "WEB201", name: "JavaScript & TypeScript", skill: "JS/TS Proficiency", status: "in-progress" },
        { code: "CS201", name: "Data Structures", skill: "Algorithmic Thinking", status: "in-progress" },
        { code: "DB101", name: "Database Basics", skill: "SQL Fundamentals", status: "pending" },
      ],
    },
    {
      phase: "Phase 3 — Specialization",
      colorClass: "border-violet-200 bg-violet-50",
      headerColor: "text-violet-700 bg-violet-100",
      nodes: [
        { code: "WEB301", name: "React & Next.js", skill: "Component Architecture", status: "pending" },
        { code: "WEB302", name: "State Management", skill: "Redux / Zustand", status: "pending" },
        { code: "CS301", name: "Software Engineering", skill: "Design Patterns", status: "pending" },
      ],
    },
    {
      phase: "Phase 4 — Capstone",
      colorClass: "border-amber-200 bg-amber-50",
      headerColor: "text-amber-700 bg-amber-100",
      nodes: [
        { code: "CS401", name: "Senior Capstone", skill: "Portfolio & Deployment", status: "pending" },
      ],
    },
  ],
  "Data Engineer": [
    {
      phase: "Phase 1 — Foundation",
      colorClass: "border-emerald-200 bg-emerald-50",
      headerColor: "text-emerald-700 bg-emerald-100",
      nodes: [
        { code: "CS101", name: "Intro to Programming", skill: "Python Scripting", status: "completed" },
        { code: "DB101", name: "Database Basics", skill: "SQL & RDBMS", status: "completed" },
        { code: "MATH101", name: "Discrete Mathematics", skill: "Mathematical Logic", status: "completed" },
      ],
    },
    {
      phase: "Phase 2 — Data Core",
      colorClass: "border-sky-200 bg-sky-50",
      headerColor: "text-sky-700 bg-sky-100",
      nodes: [
        { code: "MATH201", name: "Linear Algebra & Stats", skill: "Statistical Analysis", status: "in-progress" },
        { code: "DB201", name: "Advanced SQL & NoSQL", skill: "Complex Queries", status: "in-progress" },
        { code: "CS201", name: "Data Structures", skill: "Efficient Processing", status: "completed" },
      ],
    },
    {
      phase: "Phase 3 — Engineering",
      colorClass: "border-violet-200 bg-violet-50",
      headerColor: "text-violet-700 bg-violet-100",
      nodes: [
        { code: "DB301", name: "Data Warehousing", skill: "ETL Pipelines", status: "pending" },
        { code: "CLOUD201", name: "Cloud Computing", skill: "AWS / GCP", status: "pending" },
        { code: "ML201", name: "Machine Learning", skill: "Predictive Models", status: "pending" },
      ],
    },
    {
      phase: "Phase 4 — Capstone",
      colorClass: "border-amber-200 bg-amber-50",
      headerColor: "text-amber-700 bg-amber-100",
      nodes: [
        { code: "CS401", name: "Senior Capstone", skill: "Data Architecture", status: "pending" },
      ],
    },
  ],
  "Cloud Architect": [
    {
      phase: "Phase 1 — Foundation",
      colorClass: "border-emerald-200 bg-emerald-50",
      headerColor: "text-emerald-700 bg-emerald-100",
      nodes: [
        { code: "CS101", name: "Intro to Programming", skill: "Scripting Basics", status: "completed" },
        { code: "NET101", name: "Computer Networks", skill: "TCP/IP & DNS", status: "completed" },
        { code: "CS302", name: "Operating Systems", skill: "Linux / Unix", status: "in-progress" },
      ],
    },
    {
      phase: "Phase 2 — Core Cloud",
      colorClass: "border-sky-200 bg-sky-50",
      headerColor: "text-sky-700 bg-sky-100",
      nodes: [
        { code: "CLOUD201", name: "Cloud Computing", skill: "AWS / Azure / GCP", status: "in-progress" },
        { code: "SEC201", name: "Information Security", skill: "IAM & Compliance", status: "pending" },
        { code: "CS201", name: "Data Structures", skill: "System Design", status: "completed" },
      ],
    },
    {
      phase: "Phase 3 — Architecture",
      colorClass: "border-violet-200 bg-violet-50",
      headerColor: "text-violet-700 bg-violet-100",
      nodes: [
        { code: "CS301", name: "Software Engineering", skill: "Microservices", status: "pending" },
        { code: "DB201", name: "Advanced Databases", skill: "Distributed Systems", status: "pending" },
      ],
    },
    {
      phase: "Phase 4 — Capstone",
      colorClass: "border-amber-200 bg-amber-50",
      headerColor: "text-amber-700 bg-amber-100",
      nodes: [
        { code: "CS401", name: "Senior Capstone", skill: "Cloud Architecture", status: "pending" },
      ],
    },
  ],
};

export const MARKET_DATA = [
  { skill: "Python", demand: 94 },
  { skill: "React/Next", demand: 89 },
  { skill: "AWS", demand: 82 },
  { skill: "SQL", demand: 78 },
  { skill: "TypeScript", demand: 76 },
  { skill: "Docker/K8s", demand: 71 },
  { skill: "Go", demand: 58 },
];

export const INITIAL_TRANSCRIPT: CourseRecord[] = [
  { code: "CS101", name: "Introduction to Programming", credits: 3, prereqs: [], gpa: "3.8", semester: "2023 — Semester 1" },
  { code: "MATH101", name: "Discrete Mathematics", credits: 3, prereqs: [], gpa: "3.5", semester: "2023 — Semester 1" },
  { code: "WEB101", name: "HTML & CSS Fundamentals", credits: 2, prereqs: [], gpa: "4.0", semester: "2023 — Semester 1" },
  { code: "WEB201", name: "JavaScript & TypeScript", credits: 3, prereqs: ["WEB101"], gpa: "3.7", semester: "2023 — Semester 2" },
  { code: "CS201", name: "Data Structures & Algorithms", credits: 4, prereqs: ["CS101"], gpa: "3.6", semester: "2023 — Semester 2" },
];

export const AI_PROMPTS = [
  { emoji: "🎯", text: "What careers best match my profile?" },
  { emoji: "📚", text: "Which courses should I prioritize?" },
  { emoji: "💼", text: "How to prepare for tech internships?" },
  { emoji: "📊", text: "What are the most in-demand skills?" },
  { emoji: "🗺️", text: "Build me a study plan this semester" },
  { emoji: "⚡", text: "Tips to improve my grade in CS201" },
];


export const SEMESTERS = [
  "2024 — Semester 1",
  "2024 — Semester 2",
  "2023 — Semester 2",
  "2023 — Semester 1",
  "2022 — Semester 2",
];

export const STAFF_EXISTING_COURSES = [
  { code: "CS101", name: "Introduction to Programming" },
  { code: "CS201", name: "Data Structures & Algorithms" },
  { code: "CS301", name: "Software Engineering" },
  { code: "CS302", name: "Operating Systems" },
  { code: "WEB101", name: "HTML & CSS Fundamentals" },
  { code: "WEB201", name: "JavaScript & TypeScript" },
  { code: "DB101", name: "Database Fundamentals" },
  { code: "MATH101", name: "Discrete Mathematics" },
  { code: "NET101", name: "Computer Networks" },
];

export const MOCK_IMPORT = [
  { name: "Nguyen Van An", studentId: "20210001", gmail: "nguyen.van.an@student.uni.edu", major: "Computer Science", tempPw: "Tmp#2024!" },
  { name: "Tran Thi Bich", studentId: "20210002", gmail: "tran.thi.bich@student.uni.edu", major: "Software Engineering", tempPw: "Tmp#2024!" },
  { name: "Le Minh Cuong", studentId: "20210003", gmail: "le.minh.cuong@student.uni.edu", major: "Information Systems", tempPw: "Tmp#2024!" },
  { name: "Pham Ngoc Dung", studentId: "20210004", gmail: "pham.ngoc.dung@student.uni.edu", major: "Computer Science", tempPw: "Tmp#2024!" },
  { name: "Hoang Thi Em", studentId: "20210005", gmail: "hoang.thi.em@student.uni.edu", major: "Data Science", tempPw: "Tmp#2024!" },
];

