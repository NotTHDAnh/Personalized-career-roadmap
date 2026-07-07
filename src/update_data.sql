USE SE_Career_Roadmap;
GO

-- ========================================================
-- 1. CẬP NHẬT CỘT PREREQUISITES CHO CÁC MÔN HỌC
-- ========================================================
UPDATE Courses SET prerequisites = NULL;
GO

UPDATE Courses SET prerequisites = NULL WHERE course_code = 'CSI106';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'PRF192';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'MAE101';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'MAD101';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'CEA201';
UPDATE Courses SET prerequisites = 'PRF192' WHERE course_code = 'PRO192';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'DBI202';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'OSG202';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'CNA201';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'WED201c';
UPDATE Courses SET prerequisites = 'PRO192' WHERE course_code = 'LAB211';
UPDATE Courses SET prerequisites = 'PRO192' WHERE course_code = 'SWE202c';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'IOT102';
UPDATE Courses SET prerequisites = 'PRO192, DBI202' WHERE course_code = 'PRJ301';
UPDATE Courses SET prerequisites = 'SWE202c' WHERE course_code = 'SWR302';
UPDATE Courses SET prerequisites = 'PRJ301, SWE202c, LAB211' WHERE course_code = 'SWP391';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'WDU203c';
UPDATE Courses SET prerequisites = 'PRO192' WHERE course_code = 'PRM393';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'PRP201c';
UPDATE Courses SET prerequisites = 'WED201c' WHERE course_code = 'FER202';
UPDATE Courses SET prerequisites = 'PRJ301' WHERE course_code = 'HSF302';
UPDATE Courses SET prerequisites = 'PRO192' WHERE course_code = 'FGU301';
UPDATE Courses SET prerequisites = 'MAS291' WHERE course_code = 'PDS301m';
UPDATE Courses SET prerequisites = 'PRO192, DBI202' WHERE course_code = 'PRN212';
UPDATE Courses SET prerequisites = 'DBI202' WHERE course_code = 'DSC302';
UPDATE Courses SET prerequisites = 'MAS291, MAE101' WHERE course_code = 'AIL303m';
UPDATE Courses SET prerequisites = 'DBI202, FER202' WHERE course_code = 'SDN302';
UPDATE Courses SET prerequisites = 'FER202' WHERE course_code = 'MAD401';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'ECI101';
UPDATE Courses SET prerequisites = NULL WHERE course_code = 'MAS291';
GO

-- ========================================================
-- 2. CHÈN TÀI LIỆU HỌC TẬP NGOÀI VÀO BẢNG LEARNING_RESOURCES
-- ========================================================

-- Resources cho môn CSI106 (Skill ID: SKL_029)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1001', 'SKL_029', 'CRS_001', N'Computer Science Distilled Guide', 'https://code.energy/computer-science-distilled/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1002', 'SKL_029', 'CRS_001', N'Harvard CS50 Introduction to Computer Science', 'https://pll.harvard.edu/course/cs50-introduction-computer-science');

-- Resources cho môn PRF192 (Skill ID: SKL_006)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1003', 'SKL_006', 'CRS_002', N'W3Schools C Programming Tutorial', 'https://www.w3schools.com/c/index.php');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1004', 'SKL_006', 'CRS_002', N'GeeksforGeeks C Programming Language', 'https://www.geeksforgeeks.org/c-programming-language/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1005', 'SKL_006', 'CRS_002', N'Learn-C.org Interactive Tutorial', 'https://www.learn-c.org/');

-- Resources cho môn MAE101 (Skill ID: SKL_041)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1006', 'SKL_041', 'CRS_003', N'Khan Academy Calculus 1', 'https://www.khanacademy.org/math/calculus-1');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1007', 'SKL_041', 'CRS_003', N'MIT OpenCourseWare Single Variable Calculus', 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/');

-- Resources cho môn MAD101 (Skill ID: SKL_043)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1008', 'SKL_043', 'CRS_004', N'MIT OpenCourseWare Mathematics for Computer Science', 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1009', 'SKL_043', 'CRS_004', N'Discrete Mathematics - GeeksforGeeks', 'https://www.geeksforgeeks.org/discrete-mathematics-tutorials/');

-- Resources cho môn CEA201 (Skill ID: SKL_031)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1010', 'SKL_031', 'CRS_005', N'Computer Organization & Architecture Tutorials', 'https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1011', 'SKL_031', 'CRS_005', N'Berkeley CS61C Computer Architecture Course', 'https://cs61c.org/');

-- Resources cho môn PRO192 (Skill ID: SKL_021)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1012', 'SKL_021', 'CRS_006', N'Oracle Official Java Tutorials', 'https://docs.oracle.com/javase/tutorial/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1013', 'SKL_021', 'CRS_006', N'W3Schools Java Tutorial', 'https://www.w3schools.com/java/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1014', 'SKL_021', 'CRS_006', N'Java OOP Concepts - GeeksforGeeks', 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/');

-- Resources cho môn DBI202 (Skill ID: SKL_008)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1015', 'SKL_008', 'CRS_007', N'W3Schools SQL Tutorial', 'https://www.w3schools.com/sql/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1016', 'SKL_008', 'CRS_007', N'SQLZoo Interactive Exercises', 'https://sqlzoo.net/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1017', 'SKL_008', 'CRS_007', N'Microsoft SQL Server Documentation', 'https://learn.microsoft.com/en-us/sql/sql-server/');

-- Resources cho môn OSG202 (Skill ID: SKL_032)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1018', 'SKL_032', 'CRS_008', N'Learning Resource', 'https://notegpt.io/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1019', 'SKL_032', 'CRS_008', N'Operating Systems Three Easy Pieces Book', 'https://pages.cs.wisc.edu/~remzi/OSTEP/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1020', 'SKL_032', 'CRS_008', N'Linux Command Line Basics', 'https://linuxjourney.com/');

-- Resources cho môn CNA201 (Skill ID: SKL_033)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1021', 'SKL_033', 'CRS_009', N'Computer Networks Guide - GeeksforGeeks', 'https://www.geeksforgeeks.org/computer-network-tutorials/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1022', 'SKL_033', 'CRS_009', N'Introduction to Networking - Coursera', 'https://www.coursera.org/learn/introduction-to-networking');

-- Resources cho môn WED201c (Skill ID: SKL_012)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1023', 'SKL_012', 'CRS_010', N'MDN Web Docs - HTML & CSS', 'https://developer.mozilla.org/en-US/docs/Web/HTML');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1024', 'SKL_012', 'CRS_010', N'W3Schools HTML & CSS Reference', 'https://www.w3schools.com/html/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1025', 'SKL_012', 'CRS_010', N'FreeCodeCamp Responsive Web Design', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/');

-- Resources cho môn LAB211 (Skill ID: SKL_002)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1026', 'SKL_002', 'CRS_011', N'Java Design Patterns - SourceMaking', 'https://sourcemaking.com/design_patterns');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1027', 'SKL_002', 'CRS_011', N'Refactoring.Guru Java Examples', 'https://refactoring.guru/design-patterns/java');

-- Resources cho môn SWE202c (Skill ID: SKL_027)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1028', 'SKL_027', 'CRS_012', N'Learning Resource', 'https://www.coursera.org/learn/generative-ai-in-software-development');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1029', 'SKL_027', 'CRS_012', N'Learning Resource', 'https://www.coursera.org/learn/software-engineering-modeling-software-systems-using-uml');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1030', 'SKL_027', 'CRS_012', N'Learning Resource', 'https://www.coursera.org/learn/software-engineering-implementation-and-testing');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1031', 'SKL_027', 'CRS_012', N'Learning Resource', 'https://www.coursera.org/learn/software-engineering-software-design-and-project-management');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1032', 'SKL_027', 'CRS_012', N'Agile Alliance Scrum Guide', 'https://www.scrumguides.org/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1033', 'SKL_027', 'CRS_012', N'UML Diagramming Tutorial - Lucidchart', 'https://www.lucidchart.com/pages/uml-class-diagram-tutorial');

-- Resources cho môn IOT102 (Skill ID: SKL_048)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1034', 'SKL_048', 'CRS_013', N'Learning Resource', 'https://learning.edx.org/course/course-v1:CurtinX+IOT1x+2T2018/home');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1035', 'SKL_048', 'CRS_013', N'Learning Resource', 'https://learning.edx.org/course/course-v1:CurtinX+IOT2x+2T2018/home');

-- Resources cho môn PRJ301 (Skill ID: SKL_016)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1036', 'SKL_016', 'CRS_014', N'Java Platform Documentation', 'http://docs.oracle.com/javase/tutorial/jdbc/index.html');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1037', 'SKL_016', 'CRS_014', N'Java Platform Documentation', 'https://docs.oracle.com/cd/B14099_19/web.1012/b14017/filters.htm');

-- Resources cho môn SWR302 (Skill ID: SKL_024)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1038', 'SKL_024', 'CRS_015', N'Requirements Engineering Guide', 'https://www.reqview.com/requirements-engineering-process.html');

-- Resources cho môn WDU203c (Skill ID: SKL_047)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1039', 'SKL_047', 'CRS_017', N'Figma Design School Lectures', 'https://www.figma.com/resource-library/design-basics/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1040', 'SKL_047', 'CRS_017', N'Interaction Design Foundation Guides', 'https://www.interaction-design.org/literature');

-- Resources cho môn FER202 (Skill ID: SKL_011)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1041', 'SKL_011', 'CRS_020', N'React.dev Official Documentation', 'https://react.dev/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1042', 'SKL_011', 'CRS_020', N'Scrimba Free React Course', 'https://scrimba.com/learn/learnreact');

-- Resources cho môn HSF302 (Skill ID: SKL_015)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1043', 'SKL_015', 'CRS_021', N'Java Platform Documentation', 'https://www.oracle.com/java/technologies/downloads/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1044', 'SKL_015', 'CRS_021', N'Learning Resource', 'https://www.eclipse.org/downloads/packages/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1045', 'SKL_015', 'CRS_021', N'Learning Resource', 'https://www.jetbrains.com/idea/download/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1046', 'SKL_015', 'CRS_021', N'Spring Framework Reference', 'https://spring.io/tools');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1047', 'SKL_015', 'CRS_021', N'Learning Resource', 'https://gluonhq.com/products/scene-builder/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1048', 'SKL_015', 'CRS_021', N'Spring Framework Reference', 'https://docs.spring.io/spring-data/jpa/reference/jpa.html');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1049', 'SKL_015', 'CRS_021', N'Spring Framework Reference', 'https://docs.spring.io/spring-framework/reference/core.html');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1050', 'SKL_015', 'CRS_021', N'Spring Framework Reference', 'https://docs.spring.io/spring-boot/docs/current/reference/html/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1051', 'SKL_015', 'CRS_021', N'Spring Framework Reference', 'https://docs.spring.io/spring-data/jpa/reference/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1052', 'SKL_015', 'CRS_021', N'Learning Resource', 'https://openjfx.io/openjfx-docs/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1053', 'SKL_015', 'CRS_021', N'React Dev Docs', 'https://react.dev/reference/react');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1054', 'SKL_015', 'CRS_021', N'W3Schools Tutorial', 'https://www.w3schools.com/react/default.asp');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1055', 'SKL_015', 'CRS_021', N'React Dev Docs', 'https://react.dev/reference/react-dom/components');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1056', 'SKL_015', 'CRS_021', N'React Dev Docs', 'https://react.dev/reference/react/components');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1057', 'SKL_015', 'CRS_021', N'Learning Resource', 'https://react-bootstrap.netlify.app/docs/getting-started/why-react-bootstrap');

-- Resources cho môn FGU301 (Skill ID: SKL_051)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1058', 'SKL_051', 'CRS_022', N'Unity Tutorials', 'https://unity.com/resources/design-patterns-solid-ebook');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1059', 'SKL_051', 'CRS_022', N'Unity Tutorials', 'https://unity.com/resources/optimize-your-console-and-pc-game-performance');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1060', 'SKL_051', 'CRS_022', N'Learning Resource', 'https://docs.unity3d.com/Packages/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1061', 'SKL_051', 'CRS_022', N'Learning Resource', 'https://docs.unity3d.com/Packages/com.unity.ai.generators@latest');

-- Resources cho môn PDS301m (Skill ID: SKL_001)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1062', 'SKL_001', 'CRS_023', N'Learning Resource', 'https://www.mit.edu/');

-- Resources cho môn PRN212 (Skill ID: SKL_020)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1063', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/core/introduction');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1064', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1065', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/vi-vn/dotnet/standard/generics/collections');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1066', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/collections');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1067', 'SKL_020', 'CRS_024', N'Learning Resource', 'https://refactoring.guru/design-patterns/csharp');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1068', 'SKL_020', 'CRS_024', N'Learning Resource', 'https://sourcemaking.com/design_patterns/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1069', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1070', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/vi-vn/dotnet/csharp/programming-guide/events/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1071', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1072', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/?view=netdesktop-8.0');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1073', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/windows/?view=netdesktop-8.0');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1074', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/windows/?view=netdesktop-8.1');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1075', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/controls/styles-templates-overview?view=netdesktop-8.0');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1076', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/controls/styles-templates-overview?view=netdesktop-8.1');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1077', 'SKL_020', 'CRS_024', N'Microsoft Net Docs', 'https://learn.microsoft.com/en-us/dotnet/desktop/wpf/controls/styles-templates-overview?view=netdesktop-8.2');

-- Resources cho môn AIL303m (Skill ID: SKL_036)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1078', 'SKL_036', 'CRS_026', N'GitHub Open Source Resource', 'https://github.com/ageron/handson-mlp');

-- Resources cho môn SDN302 (Skill ID: SKL_014)
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1079', 'SKL_014', 'CRS_027', N'Node.js Official Documentation', 'https://nodejs.org/en/docs/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1080', 'SKL_014', 'CRS_027', N'Express.js Web Application Guide', 'https://expressjs.com/');
INSERT INTO Learning_Resources (resource_id, skill_id, course_id, title, [url]) VALUES ('RES_EXT_1081', 'SKL_014', 'CRS_027', N'MongoDB Manual', 'https://www.mongodb.com/docs/manual/');