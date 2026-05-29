Act as an expert UI/UX Designer and Frontend Engineer. Create a modern, clean, and professional enterprise web application interface for an internal university portal named "Smart Career Roadmap". 

Since this is a strictly internal system, there is NO registration/sign-up flow. Student accounts and courses are pre-imported or manually managed by Staff. 

Please generate the following 3 specific screens based on the detailed layout structure below:

### SCREEN 1: PORTAL LANDING PAGE & LOGIN (The Welcome Gateway with Role Selection)
A clean, welcoming page that introduces the platform's core values, combined with a secure login form that supports dual user roles.
- **Hero Section (Left Side)**: Bold title "Smart Career & Learning Roadmap" with core value bullet points.
- **Login Section (Right Side or Prominent Card)**: Role Selector (Tabs for "Student Login" / "Staff Login"). Includes "Sign in with University Google Account" button, a divider, and traditional Gmail/Password inputs. No registration links.

---

### SCREEN 2: STUDENT DASHBOARD (The Core Content with Sidebar Navigation)
A highly structured dashboard layout for authenticated students with a persistent navigation layout:

- **PERSISTENT COLORED LEFT SIDEBAR (STRICT WHITELIST & HEAD FREEZE LAW)**: 
  * **PERSISTENT BACKGROUND COLOR RULE**: This sidebar MUST always maintain a solid, fully-colored dark background using the primary Deep University Blue (#1B365D) across all tab views. It must NEVER render with a white, light gray, or transparent background.
  * **Foreground Styling**: All text and icons inside this sidebar must be styled in high-contrast crisp white or silver.
  * **STRICT SIDEBAR HEAD ABSOLUTE LOCK (ANTI-MUTATION LAW):** The very top (Header) of this sidebar must be 100% static and identical across all tab views. It is ONLY permitted to contain exactly one (1) plain text branding title: **"Smart Career Roadmap"** written in bold, crisp white typography. 
  * **ABSOLUTE SIDEBAR HEAD BLACKLIST:** Inside or directly below this top header text, do NOT generate any user profile shortcuts, student avatars, user names, role labels, notifications counters, collapsible arrows, hamburger menu icons, search input boxes, or quick settings icons. It must be a pure, unchangeable text header.
  * **STRICT STRUCTURAL LIMITATION (NO EXTRA FUNCTIONS LAW):** This sidebar is an absolute static container that is ONLY permitted to contain exactly 5 elements vertically stacked: The fixed Text Branding Title at the very top, and exactly Four (4) standard navigation items underneath it.
  * **The 4 Allowed Navigation Tabs (And Nothing Else)**:
    1. "Profile & Transcripts" (Icon: Graduation Cap)
    2. "AI Virtual Mentor" (Icon: Chat/Robot)
    3. "My Roadmaps" (Icon: Route/Map)
    4. "Job Market Trends" (Icon: Chart/Line)

- **Tab 1 Content: Profile & Transcript Management Workspace (Strict 3-Tier Vertical Layout Grid)**:
  * **CRITICAL UI RULES FOR THIS TAB (STRICT BLACKLIST):** - Absolutely NO roadmap timelines, future schedules, line charts, or course recommendation cards.
    - **TERMINOLOGY BAN:** Do NOT generate the words "Credit", "Credit Hours", "Rank", "Ranking", "Academic Standing", "Class Rank", "Target GPA", "Expected GPA", or "Cumulative GPA" anywhere on this screen. 
    - **NO IMAGES RULE:** Absolutely NO user avatars, profile picture placeholders, or image frames inside the student profile card. It must be 100% text-based information.
    - **MANDATORY LABELING RULE:** The score column in both tables and the score card in the summary tier MUST be strictly and exclusively labeled as **"GPA"**. No prefixes, no suffixes.
  * **THE ENTIRE WORKSPACE IS DIVIDED INTO EXACTLY 3 CHRONOLOGICAL VERTICAL TIERS (TOP, MIDDLE, BOTTOM):**

  #### 1. TOP TIER (The Academic Summary Section - Strict 3-Column Horizontal Layout Grid)
  - This tier is a single horizontal block split cleanly into 3 distinct columns:
    * **Left Column (Student Personal Profile Card - 35% Width)**: A clean, structured card displaying the student's text info only: Full Name and Student ID. No avatar images or picture placeholders allowed.
    * **Center Column (Academic Metrics Tracker - 30% Width)**: Strictly formatted as a vertical stack of **TWO completely separate, independent container cards** separated by clear layout spacing:
      - **Top Frame/Card**: An isolated container displaying a clean KPI tracker for "Total Learning Time Completed" (e.g., "36 Weeks Completed" using strictly time/weeks, no credit hours).
      - **Bottom Frame/Card**: A completely separate isolated container displaying a distinct KPI tracker officially labeled strictly as **"GPA"**.
    * **Right Column (Acquired Skill Hashtags Bank - 35% Width)**: A visually clean, dedicated container holding all skill hashtags the student has successfully unlocked from completed courses. *CRITICAL OVERFLOW RULE:* If the list of hashtags exceeds the physical boundary of the card container, it must truncate neatly and append a simple text label **"...more"** at the absolute end, and nothing else.

  #### 2. MIDDLE TIER (The Active Academic Tracker - Full-Width Layout)
  - Placed directly below the Top Tier, spanning 100% of the canvas width:
    * **In-Progress Courses Table**: A dedicated table listing subjects currently being taken in the active semester. 
    * **STRICT HARDCODED COLUMNS RULE**: This table MUST contain exactly these 6 columns in this exact horizontal order: `Course Name` | `Course Code` | `Standard Duration (Weeks)` | `Learning Outcomes (Skill Hashtags)` | `GPA` | `Status`.
    * **Mandatory Row Render**: Render exactly two rows with this strict data cell matching to guarantee all columns are visible:
      - Row 1: "Advanced Java Programming" | "JA301" | "8 Weeks" | [#OOP, #Backend] rendered as tags | [Empty Blank Input Box Placeholder] | "In Progress" (with a red warning badge `⚠️ Prerequisite Missing`)
      - Row 2: "Database Management Systems" | "DB202" | "6 Weeks" | [#SQL, #Schema] rendered as tags | [Empty Blank Input Box Placeholder] | "In Progress"

  #### 3. BOTTOM TIER (The Historical Academic Record - Full-Width Layout)
  - Placed directly at the bottom of the workspace, spanning 100% of the canvas width:
    * **Completed Courses Table**: Located directly below the In-Progress table. 
    * **STRICT HARDCODED COLUMNS RULE**: This table MUST contain the exact same 6 columns in this exact horizontal order: `Course Name` | `Course Code` | `Standard Duration (Weeks)` | `Learning Outcomes (Skill Hashtags)` | `GPA` | `Status`.
    * **Mandatory Row Render**: Render exactly two rows with this strict data cell matching to guarantee all columns are visible:
      - Row 1: "Introduction to Programming" | "PR101" | "8 Weeks" | [#Logic, #Syntax] rendered as tags | [Interactive Input Box displaying "3.8"] | "Done"
      - Row 2: "Web Foundations (External)" | "Coursera" | "4 Weeks" | [#HTML, #CSS] rendered as tags | [Interactive Input Box displaying "4.0"] | "Done"

- **Tab 2 Content: AI Virtual Career Mentor Workspace (Pure Chat Consultation Only)**:
  * **STRICT FUNCTIONAL LIMITATION**: This workspace is exclusively a basic, clean text-based conversational chatbot screen layout. 
  * **CRITICAL FEATURES BLACKLIST**: Do NOT generate any components, sidebar cards, recommendations, tips, or layout sections for "Pro Tips", "Resume Feedback", "CV Analysis", "View Curriculum Gap Analysis", or "Skill Alignment Metrics". 
  * **Allowed Elements**: A standard header "AI Academic & Career Tutor", a scrolling chat history area showing text-based question and answer bubbles (focused strictly on helping students ask questions to build their learning roadmaps), and a bottom text input bar with a send button.

- **Tab 3 Content: My Roadmaps Workspace (DUOLINGO-STYLE MAP WITH CHRONOLOGICAL TIMELINE)**:
  * **CRITICAL ROADMAP PURGE & FREEZE LAW (STRICT BLACKLIST):** 
    - Absolutely DO NOT generate any extra sections, cards, text widgets, or features containing: "Average Salary", "Expected Salary", "Job Openings", "Company Logos", "Hiring Partners", "Mentor Notes", "Interview Preparation", "Project Portfolios", "Recommended Electives", "AI Career Tips", or "Market Insights".
    - Absolutely NO configuration panels, input setup forms, dropdown parameters, or study hour selection fields.
  * **EXACTLY THREE (3) LAYOUT SECTIONS ALLOWED ON THIS CANVAS (TOP, MIDDLE, BOTTOM ONLY):**
    1. **CONSOLIDATED MANAGEMENT HEADER (TOP)**: This horizontal block contains a "Select Active Roadmap" Dropdown Selector, an integrated horizontal Actions Group ("Edit", "Save", "Delete"), and a "Remaining Study Time" Widget.
    2. **DUOLINGO PROGRESSION TRACK CONTAINER (MIDDLE - THE GAMIFIED MAP)**:
       - **Visual Architecture (The Monthly Boundaries)**: Render a large horizontal container canvas divided visually into exactly three (3) consecutive bounding blocks, separated by clean vertical layout lines or subtle shading differences. Each bounding block is explicitly labeled at its top edge as: **"ZONE: MONTH 1"**, **"ZONE: MONTH 2"**, and **"ZONE: MONTH 3"**.
       - **The Gamified Linear Rail**: Running unbroken across all three Zones from left to right is a continuous wavy/zigzag SVG track vector line. On top of this line, individual courses are mapped exclusively as large, circular Duolingo-style milestone nodes (Chained Learning Nodes):
         * **Inside ZONE: MONTH 1**: The rail hosts exactly two sequential nodes: Node 1 (Introduction to Computer Science - CS101) rendered in solid green with a checkmark, and Node 2 (Web Foundations - Coursera) rendered in solid green.
         * **Inside ZONE: MONTH 2**: The rail connects smoothly into this zone, hosting Node 3 (Data Structures & Algorithms - DSA201) rendered with an active glowing pulse border, and Node 4 (Database Systems - DB202) rendered as active.
         * **Inside ZONE: MONTH 3**: The rail transitions into a dashed slate line, entering the final zone to host Node 5 (Advanced Java Programming - JA301) rendered in a gray, locked inactive state.
    3. **CHRONOLOGICAL WORKLOAD TIMELINE (BOTTOM - THE TIMELINE GRID)**:
       - **Layout Structure**: Located directly beneath the Duolingo map container, spanning 100% canvas width. This is a horizontal gantt-style or linear grid track displaying the exact duration timeline of the actual study workload to keep layout neatness.
       - **Strict Vertical Drop Alignment Law**: To maintain crisp scannability, the detailed structural course card elements are cleanly grouped and stacked vertically **strictly underneath the timeline indicators corresponding to their active months**:
         * **Vertical Stack 1 (Under Month 1 Timeline)**: Displays a vertical list holding the full descriptive card for "Introduction to Computer Science (CS101)" and "Web Foundations (Coursera)".
         * **Vertical Stack 2 (Under Month 2 Timeline)**: Displays a vertical list holding the full descriptive card for "Data Structures & Algorithms (DSA201)" and "Database Systems (DB202)".
         * **Vertical Stack 3 (Under Month 3 Timeline)**: Displays a vertical list holding the full descriptive card for "Advanced Java Programming (JA301)".
       - **MANDATORY INLINE CARD COMPONENTS (STRICT VISUAL LAW):** Each individual course card inside the bottom vertical stacks must hold EXACTLY these elements:
         1. **Huy hiệu bắt buộc**: A prominent star badge labeled strictly as `⭐ Required` at the top right corner.
         2. **Nhãn phân loại nguồn gốc**: High-contrast label specifying `🏫 University Course` or `🌐 External Platform`.
         3. **Thông tin định danh và Nguồn cấp**: Subjects must display their code or external platform in parentheses: e.g., "Introduction to Computer Science (CS101)" or "Web Foundations (Coursera)".
         4. **Huy hiệu thời gian**: A clean duration tracker badge `⏱️ 8 Weeks`.
         5. **Nhãn điều kiện**: An embedded text label `🔗 Prerequisite`.
         6. **Hashtags kỹ năng**: Target skill hashtags array.

- **Tab 4 Content: Job Market Trends Workspace (STRICT PASSIVE DATA VIEWER - NO FOOTER ALLOWED)**:
  * **CRITICAL TREND TAB PURGE LAW (STRICT TERMINOLOGY BLACKLIST):** - Absolutely DO NOT generate any sections, headings, cards, text metrics, labels, or badges containing the words or concepts: "Prediction", "Predictive Analytics", "Future Forecast", "Your Alignment", "Skill Alignment", "Match Score", "Bridge the Gap", "Gap Analysis", "Skill Shortage", "Personal Recommendations", or "Compare to My Profile".
  * **LAYOUT STRUCTURE & FOOTER BAN**: This page must be a horizontal 50/50 split layout grid. Left side is a visual chart container for Tech Domains, right side is a pure text data table container for detailed Hashtags. Both sides must render exactly 10 comprehensive rows to optimize layout height. 
  * **ABSOLUTE TERMINATION RULE:** The page canvas ends abruptly at the bottom edge of these two containers. Absolutely NO footer panels, no secondary summaries, no legend texts, no notes, and no white space buffers are allowed below this 50/50 split grid.
  * **Left Component: Visual Horizontal Bar Chart (In-Demand Tech Domains)**: Displays exactly 10 sequential rows of broad industry sectors. Each row features a domain label text, a visible colored horizontal progress bar component, and the raw vacancy posting count text:
    1. `Cloud Computing & Infra` — [Horizontal Progress Bar Component - 95% Filled] — 2,450 Postings
    2. `Agentic AI & Orchestration` — [Horizontal Progress Bar Component - 88% Filled] — 2,120 Postings
    3. `Full-Stack Web Development` — [Horizontal Progress Bar Component - 82% Filled] — 1,980 Postings
    4. `Cybersecurity & Net Defense` — [Horizontal Progress Bar Component - 75% Filled] — 1,650 Postings
    5. `Data Engineering & Pipelines` — [Horizontal Progress Bar Component - 68% Filled] — 1,410 Postings
    6. `DevOps & Infrastructure as Code` — [Horizontal Progress Bar Component - 60% Filled] — 1,220 Postings
    7. `Mobile App Architectures` — [Horizontal Progress Bar Component - 52% Filled] — 980 Postings
    8. `Enterprise ERP Systems` — [Horizontal Progress Bar Component - 45% Filled] — 810 Postings
    9. `UI/UX & Spatial Design` — [Horizontal Progress Bar Component - 38% Filled] — 640 Postings
    10. `Blockchain & FinTech Sec` — [Horizontal Progress Bar Component - 30% Filled] — 450 Postings
  * **Right Component: Clean Data Table (Trending Hot Hashtags)**: Positioned directly next to the chart. A structured 2-column text table displaying exactly 10 high-frequency skill keywords. Columns: "Trending Hashtag" | "Frequency Rating".
    1. `#Microservices` | High
    2. `#AWS_Cloud` | High
    3. `#RESTful_API` | High
    4. `#CICD_Pipelines` | Medium
    5. `#Kubernetes` | Medium
    6. `#DataAnalytics` | Medium
    7. `#DockerContainers` | Medium
    8. `#AgileScrum` | Medium
    9. `#MachineLearning` | Low
    10. `#Serverless` | Low

---

### SCREEN 3: STAFF MANAGEMENT INTERFACE (The Raw Data Ingestion Utility Panel)
* **STRICT SYSTEM BLACKLIST (CRITICAL UI LAWS):** Do NOT generate any metrics, widgets, charts, or text containing: "System Health", "Server Status", "Pending Verification", "User Approval", "Total Roadmap Sync", "Active Users", "Sync Status", "Database Uptime", or any analytical data. These are out of scope.
* **EXPLICITLY PROHIBITED ELEMENTS:** Do NOT generate any navigation sidebars, tab selections, interactive menus, search inputs, user profile shortcuts, or system notification logs.
* **COHESIVE UTILITY CANVAS & DESIGN SYSTEM:** To ensure frontend consistency with Screen 2, the UI must apply the exact same Deep University Blue accent colors, slate-gray container backgrounds, typography, and clean drop-shadow card components.

* **THE LAYOUT CULMINATES INTO A TOP BAR HEADER AND 4 FUNCTIONAL BLOCKS ONLY:**

#### 0. MINIMAL TOP BAR HEADER (Staff Identity Recognition Label)
- Positioned strictly at the absolute top of the screen canvas, spanning 100% full width.
- A clean, thin horizontal header block featuring the system branding color accent, displaying a single prominent static text heading: **"Staff Administration Panel - Data Entry Only"**. No sub-menus, no buttons, no logout indicators.

#### 1. Student Account Upload Card
- A clean card container layout positioned right below the header. Features a single central drag-and-drop zone with a sleek dashed border accent, a clean "Cloud Upload" icon, and bold typography text: *"Upload Student List (.CSV / .XLSX)"*.

#### 2. Course Batch Import Card
- A matching card container layout positioned parallel to the student upload block. Features an identical dashed border file-drop area with a clean icon, and text: *"Import Master Curriculum & Courses via File (.CSV / .XLSX)"*.

#### 3. Manual Course Setup Form
- A clean input card component containing exactly 4 empty field states: "Course Name", "Course Code", "Standard Duration (Weeks)", and "Associated Skill Hashtags". Contains a single primary blue action button labeled "Add Course". No other buttons allowed.

#### 4. Master Verification Table
- A simple, static grid table positioned at the bottom of the canvas displaying active school master data for alignment checking. 
- **STRICT COLUMN & ROW HARDCODING**: Columns: `Course Name` | `Course Code` | `Standard Duration (Weeks)` | `Associated Skill Hashtags`. 
- **Mandatory Row Render**: Render exactly two sample rows:
  1. "Advanced Java Programming" | "JA301" | "8 Weeks" | [#OOP, #Backend]
  2. "Database Management Systems" | "DB202" | "6 Weeks" | [#SQL, #Schema]

---

### DESIGN SYSTEM & VIBE
- **Style**: Modern corporate internal tool, highly structured, clean white and slate gray backgrounds.
- **Colors**: Deep University Blue (#1B365D) as primary, Slate Gray for dashboard containers, and Vibrant Teal or Amber Orange for interactive action buttons. External platform cards use subtle brand accents (e.g., Coursera Blue) just for their logos.
- **Components**: Use proper auto-layout, crisp borders, and subtle drop shadows for cards to create a professional look.