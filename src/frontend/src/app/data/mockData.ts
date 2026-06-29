// import type { CourseRecord, RoadmapPhase } from "../types";

// export const ALL_COURSES = [
//   { code: "CS101", name: "Introduction to Programming", credits: 3, prereqs: [] },
//   { code: "CS201", name: "Data Structures & Algorithms", credits: 4, prereqs: ["CS101"] },
//   { code: "CS301", name: "Software Engineering", credits: 3, prereqs: ["CS201"] },
//   { code: "CS302", name: "Operating Systems", credits: 3, prereqs: ["CS201"] },
//   { code: "CS401", name: "Senior Capstone Project", credits: 6, prereqs: ["CS301", "CS302"] },
//   { code: "WEB101", name: "HTML & CSS Fundamentals", credits: 2, prereqs: [] },
//   { code: "WEB201", name: "JavaScript & TypeScript", credits: 3, prereqs: ["WEB101"] },
//   { code: "WEB301", name: "React & Modern Frontend", credits: 3, prereqs: ["WEB201"] },
//   { code: "WEB302", name: "State Management & Testing", credits: 3, prereqs: ["WEB301"] },
//   { code: "DB101", name: "Database Fundamentals", credits: 3, prereqs: [] },
//   { code: "DB201", name: "Advanced SQL & NoSQL", credits: 3, prereqs: ["DB101"] },
//   { code: "DB301", name: "Data Warehousing & ETL", credits: 3, prereqs: ["DB201"] },
//   { code: "MATH101", name: "Discrete Mathematics", credits: 3, prereqs: [] },
//   { code: "MATH201", name: "Linear Algebra & Statistics", credits: 3, prereqs: ["MATH101"] },
//   { code: "NET101", name: "Computer Networks", credits: 3, prereqs: ["CS101"] },
//   { code: "SEC201", name: "Information Security", credits: 3, prereqs: ["NET101"] },
//   { code: "CLOUD201", name: "Cloud Computing", credits: 3, prereqs: ["NET101", "CS201"] },
//   { code: "ML201", name: "Machine Learning", credits: 4, prereqs: ["MATH201", "DB101"] },
// ];

// export const ROADMAPS: Record<string, RoadmapPhase[]> = {
//   "Frontend Developer": [
//     {
//       phase: "Phase 1 ΓÇö Foundation",
//       colorClass: "border-emerald-200 bg-emerald-50",
//       headerColor: "text-emerald-700 bg-emerald-100",
//       nodes: [
//         { code: "CS101", name: "Intro to Programming", skill: "Logic & Python", status: "completed" },
//         { code: "WEB101", name: "HTML & CSS", skill: "Web Markup & Styling", status: "completed" },
//         { code: "MATH101", name: "Discrete Mathematics", skill: "Logic & Sets", status: "completed" },
//       ],
//     },
//     {
//       phase: "Phase 2 ΓÇö Core Web",
//       colorClass: "border-sky-200 bg-sky-50",
//       headerColor: "text-sky-700 bg-sky-100",
//       nodes: [
//         { code: "WEB201", name: "JavaScript & TypeScript", skill: "JS/TS Proficiency", status: "in-progress" },
//         { code: "CS201", name: "Data Structures", skill: "Algorithmic Thinking", status: "in-progress" },
//         { code: "DB101", name: "Database Basics", skill: "SQL Fundamentals", status: "pending" },
//       ],
//     },
//     {
//       phase: "Phase 3 ΓÇö Specialization",
//       colorClass: "border-violet-200 bg-violet-50",
//       headerColor: "text-violet-700 bg-violet-100",
//       nodes: [
//         { code: "WEB301", name: "React & Next.js", skill: "Component Architecture", status: "pending" },
//         { code: "WEB302", name: "State Management", skill: "Redux / Zustand", status: "pending" },
//         { code: "CS301", name: "Software Engineering", skill: "Design Patterns", status: "pending" },
//       ],
//     },
//     {
//       phase: "Phase 4 ΓÇö Capstone",
//       colorClass: "border-amber-200 bg-amber-50",
//       headerColor: "text-amber-700 bg-amber-100",
//       nodes: [
//         { code: "CS401", name: "Senior Capstone", skill: "Portfolio & Deployment", status: "pending" },
//       ],
//     },
//   ],
//   "Data Engineer": [
//     {
//       phase: "Phase 1 ΓÇö Foundation",
//       colorClass: "border-emerald-200 bg-emerald-50",
//       headerColor: "text-emerald-700 bg-emerald-100",
//       nodes: [
//         { code: "CS101", name: "Intro to Programming", skill: "Python Scripting", status: "completed" },
//         { code: "DB101", name: "Database Basics", skill: "SQL & RDBMS", status: "completed" },
//         { code: "MATH101", name: "Discrete Mathematics", skill: "Mathematical Logic", status: "completed" },
//       ],
//     },
//     {
//       phase: "Phase 2 ΓÇö Data Core",
//       colorClass: "border-sky-200 bg-sky-50",
//       headerColor: "text-sky-700 bg-sky-100",
//       nodes: [
//         { code: "MATH201", name: "Linear Algebra & Stats", skill: "Statistical Analysis", status: "in-progress" },
//         { code: "DB201", name: "Advanced SQL & NoSQL", skill: "Complex Queries", status: "in-progress" },
//         { code: "CS201", name: "Data Structures", skill: "Efficient Processing", status: "completed" },
//       ],
//     },
//     {
//       phase: "Phase 3 ΓÇö Engineering",
//       colorClass: "border-violet-200 bg-violet-50",
//       headerColor: "text-violet-700 bg-violet-100",
//       nodes: [
//         { code: "DB301", name: "Data Warehousing", skill: "ETL Pipelines", status: "pending" },
//         { code: "CLOUD201", name: "Cloud Computing", skill: "AWS / GCP", status: "pending" },
//         { code: "ML201", name: "Machine Learning", skill: "Predictive Models", status: "pending" },
//       ],
//     },
//     {
//       phase: "Phase 4 ΓÇö Capstone",
//       colorClass: "border-amber-200 bg-amber-50",
//       headerColor: "text-amber-700 bg-amber-100",
//       nodes: [
//         { code: "CS401", name: "Senior Capstone", skill: "Data Architecture", status: "pending" },
//       ],
//     },
//   ],
//   "Cloud Architect": [
//     {
//       phase: "Phase 1 ΓÇö Foundation",
//       colorClass: "border-emerald-200 bg-emerald-50",
//       headerColor: "text-emerald-700 bg-emerald-100",
//       nodes: [
//         { code: "CS101", name: "Intro to Programming", skill: "Scripting Basics", status: "completed" },
//         { code: "NET101", name: "Computer Networks", skill: "TCP/IP & DNS", status: "completed" },
//         { code: "CS302", name: "Operating Systems", skill: "Linux / Unix", status: "in-progress" },
//       ],
//     },
//     {
//       phase: "Phase 2 ΓÇö Core Cloud",
//       colorClass: "border-sky-200 bg-sky-50",
//       headerColor: "text-sky-700 bg-sky-100",
//       nodes: [
//         { code: "CLOUD201", name: "Cloud Computing", skill: "AWS / Azure / GCP", status: "in-progress" },
//         { code: "SEC201", name: "Information Security", skill: "IAM & Compliance", status: "pending" },
//         { code: "CS201", name: "Data Structures", skill: "System Design", status: "completed" },
//       ],
//     },
//     {
//       phase: "Phase 3 ΓÇö Architecture",
//       colorClass: "border-violet-200 bg-violet-50",
//       headerColor: "text-violet-700 bg-violet-100",
//       nodes: [
//         { code: "CS301", name: "Software Engineering", skill: "Microservices", status: "pending" },
//         { code: "DB201", name: "Advanced Databases", skill: "Distributed Systems", status: "pending" },
//       ],
//     },
//     {
//       phase: "Phase 4 ΓÇö Capstone",
//       colorClass: "border-amber-200 bg-amber-50",
//       headerColor: "text-amber-700 bg-amber-100",
//       nodes: [
//         { code: "CS401", name: "Senior Capstone", skill: "Cloud Architecture", status: "pending" },
//       ],
//     },
//   ],
// };

// export const MARKET_DATA = [
//   { skill: "Python", demand: 94 },
//   { skill: "React/Next", demand: 89 },
//   { skill: "AWS", demand: 82 },
//   { skill: "SQL", demand: 78 },
//   { skill: "TypeScript", demand: 76 },
//   { skill: "Docker/K8s", demand: 71 },
//   { skill: "Go", demand: 58 },
// ];

// export const INITIAL_TRANSCRIPT: CourseRecord[] = [
//   { code: "CS101", name: "Introduction to Programming", credits: 3, prereqs: [], gpa: "3.8", semester: "2023 ΓÇö Semester 1" },
//   { code: "MATH101", name: "Discrete Mathematics", credits: 3, prereqs: [], gpa: "3.5", semester: "2023 ΓÇö Semester 1" },
//   { code: "WEB101", name: "HTML & CSS Fundamentals", credits: 2, prereqs: [], gpa: "4.0", semester: "2023 ΓÇö Semester 1" },
//   { code: "WEB201", name: "JavaScript & TypeScript", credits: 3, prereqs: ["WEB101"], gpa: "3.7", semester: "2023 ΓÇö Semester 2" },
//   { code: "CS201", name: "Data Structures & Algorithms", credits: 4, prereqs: ["CS101"], gpa: "3.6", semester: "2023 ΓÇö Semester 2" },
// ];

// export const AI_PROMPTS = [
//   { emoji: "≡ƒÄ»", text: "What careers best match my profile?" },
//   { emoji: "≡ƒôÜ", text: "Which courses should I prioritize?" },
//   { emoji: "≡ƒÆ╝", text: "How to prepare for tech internships?" },
//   { emoji: "≡ƒôè", text: "What are the most in-demand skills?" },
//   { emoji: "≡ƒù║∩╕Å", text: "Build me a study plan this semester" },
//   { emoji: "ΓÜí", text: "Tips to improve my grade in CS201" },
// ];


// export const SEMESTERS = [
//   "2024 ΓÇö Semester 1",
//   "2024 ΓÇö Semester 2",
//   "2023 ΓÇö Semester 2",
//   "2023 ΓÇö Semester 1",
//   "2022 ΓÇö Semester 2",
// ];

// export const STAFF_EXISTING_COURSES = [
//   { code: "CS101", name: "Introduction to Programming" },
//   { code: "CS201", name: "Data Structures & Algorithms" },
//   { code: "CS301", name: "Software Engineering" },
//   { code: "CS302", name: "Operating Systems" },
//   { code: "WEB101", name: "HTML & CSS Fundamentals" },
//   { code: "WEB201", name: "JavaScript & TypeScript" },
//   { code: "DB101", name: "Database Fundamentals" },
//   { code: "MATH101", name: "Discrete Mathematics" },
//   { code: "NET101", name: "Computer Networks" },
// ];

// export const MOCK_IMPORT = [
//   { name: "Nguyen Van An", studentId: "20210001", gmail: "nguyen.van.an@student.uni.edu", major: "Computer Science", tempPw: "Tmp#2024!" },
//   { name: "Tran Thi Bich", studentId: "20210002", gmail: "tran.thi.bich@student.uni.edu", major: "Software Engineering", tempPw: "Tmp#2024!" },
//   { name: "Le Minh Cuong", studentId: "20210003", gmail: "le.minh.cuong@student.uni.edu", major: "Information Systems", tempPw: "Tmp#2024!" },
//   { name: "Pham Ngoc Dung", studentId: "20210004", gmail: "pham.ngoc.dung@student.uni.edu", major: "Computer Science", tempPw: "Tmp#2024!" },
//   { name: "Hoang Thi Em", studentId: "20210005", gmail: "hoang.thi.em@student.uni.edu", major: "Data Science", tempPw: "Tmp#2024!" },
// ];

export interface CourseMockData {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalStudyHours: number;
  skills: string[];
}

export const MOCK_COURSES: CourseMockData[] = [
  { courseId: "CRS_001", courseCode: "CSI106", courseName: "Introduction to Computer Science", credits: 3, totalStudyHours: 45, skills: ["Computer Science", "Algorithms", "Networking", "Security"] },
  { courseId: "CRS_002", courseCode: "PRF192", courseName: "Programming Fundamentals", credits: 3, totalStudyHours: 45, skills: ["C Programming", "Logic", "Control Flow", "Pointers"] },
  { courseId: "CRS_003", courseCode: "MAE101", courseName: "Mathematics for Engineering", credits: 3, totalStudyHours: 60, skills: ["Calculus", "Linear Algebra", "Matrices"] },
  { courseId: "CRS_004", courseCode: "MAD101", courseName: "Discrete Mathematics", credits: 3, totalStudyHours: 45, skills: ["Discrete Math", "Inference", "Graphs & Trees"] },
  { courseId: "CRS_005", courseCode: "CEA201", courseName: "Computer Organization and Architecture", credits: 3, totalStudyHours: 45, skills: ["Digital Logic", "Computer Architecture", "Instruction Sets"] },
  { courseId: "CRS_006", courseCode: "PRO192", courseName: "Object-Oriented Programming", credits: 3, totalStudyHours: 45, skills: ["Java", "OOP", "Encapsulation", "Polymorphism"] },
  { courseId: "CRS_007", courseCode: "DBI202", courseName: "Database Systems", credits: 3, totalStudyHours: 45, skills: ["SQL", "Database Design", "Normalization"] },
  { courseId: "CRS_008", courseCode: "OSG202", courseName: "Operating System", credits: 3, totalStudyHours: 45, skills: ["Linux", "Operating Systems", "Shell Scripting"] },
  { courseId: "CRS_009", courseCode: "CNA201", courseName: "Computer Networking", credits: 3, totalStudyHours: 45, skills: ["TCP/IP", "Networking Layers", "Routing"] },
  { courseId: "CRS_010", courseCode: "WED201c", courseName: "Web Design", credits: 3, totalStudyHours: 12, skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"] },
  { courseId: "CRS_011", courseCode: "LAB211", courseName: "OOP with Java Lab", credits: 1, totalStudyHours: 60, skills: ["Java Programming", "Debugging", "Testing"] },
  { courseId: "CRS_012", courseCode: "SWE202c", courseName: "Introduction to Software Engineering", credits: 3, totalStudyHours: 12, skills: ["Software Engineering", "UML", "SDLC"] },
  { courseId: "CRS_013", courseCode: "IOT102", courseName: "Internet of Things", credits: 3, totalStudyHours: 45, skills: ["IoT", "Arduino", "Sensors & Actuators"] },
  { courseId: "CRS_014", courseCode: "PRJ301", courseName: "Java Web Application Development", credits: 3, totalStudyHours: 56, skills: ["JSP & Servlets", "MVC", "Spring Boot", "JPA"] },
  { courseId: "CRS_015", courseCode: "SWR302", courseName: "Software Requirement Engineering", credits: 3, totalStudyHours: 60, skills: ["Requirements", "Elicitation", "Validation"] },
  { courseId: "CRS_016", courseCode: "SWP391", courseName: "Software Development Project", credits: 4, totalStudyHours: 60, skills: ["Software Project", "Teamwork", "Full Stack Development"] },
  { courseId: "CRS_017", courseCode: "WDU203c", courseName: "UI/UX Design", credits: 3, totalStudyHours: 12, skills: ["UI/UX Research", "Wireframing", "Prototyping"] },
  { courseId: "CRS_018", courseCode: "PRM393", courseName: "Mobile Programming (Flutter)", credits: 3, totalStudyHours: 60, skills: ["Mobile Dev", "Flutter", "Dart", "REST APIs"] },
  { courseId: "CRS_019", courseCode: "PRP201c", courseName: "Python Programming", credits: 3, totalStudyHours: 12, skills: ["Python", "Data Structures", "Web Scraping"] },
  { courseId: "CRS_020", courseCode: "FER202", courseName: "Front-End Web Development with React", credits: 3, totalStudyHours: 60, skills: ["React.js", "Redux", "Bootstrap", "Web Dev"] }
];

