export interface CourseMockData {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalStudyHours: number;
  skills: string[];
  prerequisites: string[];
  is_active: boolean;
}

export const MOCK_COURSES: CourseMockData[] = [
  { courseId: "CRS_001", courseCode: "CSI106", courseName: "Introduction to Computer Science", credits: 3, totalStudyHours: 45, skills: ["Computer Science", "Algorithms", "Networking", "Security"], prerequisites: [], is_active: true },
  { courseId: "CRS_002", courseCode: "PRF192", courseName: "Programming Fundamentals", credits: 3, totalStudyHours: 45, skills: ["C Programming", "Logic", "Control Flow", "Pointers"], prerequisites: ["CSI106"], is_active: true },
  { courseId: "CRS_003", courseCode: "MAE101", courseName: "Mathematics for Engineering", credits: 3, totalStudyHours: 60, skills: ["Calculus", "Linear Algebra", "Matrices"], prerequisites: [], is_active: true },
  { courseId: "CRS_004", courseCode: "MAD101", courseName: "Discrete Mathematics", credits: 3, totalStudyHours: 45, skills: ["Discrete Math", "Inference", "Graphs & Trees"], prerequisites: ["MAE101"], is_active: true },
  { courseId: "CRS_005", courseCode: "CEA201", courseName: "Computer Organization and Architecture", credits: 3, totalStudyHours: 45, skills: ["Digital Logic", "Computer Architecture", "Instruction Sets"], prerequisites: ["CSI106"], is_active: true },
  { courseId: "CRS_006", courseCode: "PRO192", courseName: "Object-Oriented Programming", credits: 3, totalStudyHours: 45, skills: ["Java", "OOP", "Encapsulation", "Polymorphism"], prerequisites: ["PRF192"], is_active: true },
  { courseId: "CRS_007", courseCode: "DBI202", courseName: "Database Systems", credits: 3, totalStudyHours: 45, skills: ["SQL", "Database Design", "Normalization"], prerequisites: ["PRF192"], is_active: true },
  { courseId: "CRS_008", courseCode: "OSG202", courseName: "Operating System", credits: 3, totalStudyHours: 45, skills: ["Linux", "Operating Systems", "Shell Scripting"], prerequisites: ["CEA201", "PRF192"], is_active: true },
  { courseId: "CRS_009", courseCode: "CNA201", courseName: "Computer Networking", credits: 3, totalStudyHours: 45, skills: ["TCP/IP", "Networking Layers", "Routing"], prerequisites: ["OSG202"], is_active: true },
  { courseId: "CRS_010", courseCode: "WED201c", courseName: "Web Design", credits: 3, totalStudyHours: 12, skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"], prerequisites: [], is_active: true },
  { courseId: "CRS_011", courseCode: "LAB211", courseName: "OOP with Java Lab", credits: 1, totalStudyHours: 60, skills: ["Java Programming", "Debugging", "Testing"], prerequisites: ["PRO192"], is_active: true },
  { courseId: "CRS_012", courseCode: "SWE202c", courseName: "Introduction to Software Engineering", credits: 3, totalStudyHours: 12, skills: ["Software Engineering", "UML", "SDLC"], prerequisites: ["PRO192"], is_active: true },
  { courseId: "CRS_013", courseCode: "IOT102", courseName: "Internet of Things", credits: 3, totalStudyHours: 45, skills: ["IoT", "Arduino", "Sensors & Actuators"], prerequisites: ["CEA201", "PRO192"], is_active: true },
  { courseId: "CRS_014", courseCode: "PRJ301", courseName: "Java Web Application Development", credits: 3, totalStudyHours: 56, skills: ["JSP & Servlets", "MVC", "Spring Boot", "JPA"], prerequisites: ["PRO192", "DBI202"], is_active: true },
  { courseId: "CRS_015", courseCode: "SWR302", courseName: "Software Requirement Engineering", credits: 3, totalStudyHours: 60, skills: ["Requirements", "Elicitation", "Validation"], prerequisites: ["SWE202c"], is_active: true },
  { courseId: "CRS_016", courseCode: "SWP391", courseName: "Software Development Project", credits: 4, totalStudyHours: 60, skills: ["Software Project", "Teamwork", "Full Stack Development"], prerequisites: ["PRJ301", "SWR302"], is_active: true },
  { courseId: "CRS_017", courseCode: "WDU203c", courseName: "UI/UX Design", credits: 3, totalStudyHours: 12, skills: ["UI/UX Research", "Wireframing", "Prototyping"], prerequisites: ["WED201c"], is_active: true },
  { courseId: "CRS_018", courseCode: "PRM393", courseName: "Mobile Programming (Flutter)", credits: 3, totalStudyHours: 60, skills: ["Mobile Dev", "Flutter", "Dart", "REST APIs"], prerequisites: ["PRO192"], is_active: true },
  { courseId: "CRS_019", courseCode: "PRP201c", courseName: "Python Programming", credits: 3, totalStudyHours: 12, skills: ["Python", "Data Structures", "Web Scraping"], prerequisites: ["PRF192"], is_active: true },
  { courseId: "CRS_020", courseCode: "FER202", courseName: "Front-End Web Development with React", credits: 3, totalStudyHours: 60, skills: ["React.js", "Redux", "Bootstrap", "Web Dev"], prerequisites: ["WED201c"], is_active: true }
];
