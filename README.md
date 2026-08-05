# Personal Career Orientation & Learning Roadmap

An intelligent web application designed to support Software Engineering (SE) students in career orientation, analyzing academic profiles, and generating personalized learning roadmaps based on target job roles and missing skills.

---

## About The Project

This application acts as a career development assistant for SE students. By analyzing student academic history, completed courses, and current skills, the system recommends suitable career paths and automatically constructs a personalized, step-by-step learning roadmap to bridge any skill gaps.

### Key Features
*   **Profile & Academic Record Management**: Manage student profiles, track completed courses, grades, and skills.
*   **Intelligent Job Advisement & RAG AI**: Match student academic profiles and current skills with industry-standard job requirements to suggest the best-fitting career roles using Gemini AI & Vector DB (Pinecone).
*   **Personalized Roadmap Generation**: Generate custom learning roadmaps highlighting missing skills, recommending specific university courses, providing extra learning resources, and tracking completion status.
*   **Data Import (Excel)**: Supports bulk importing of academic records, courses, and student profiles using pre-defined Excel templates.

---

## Tech Stack

### Frontend
*   **React** (v18+)
*   **Vite** & **TypeScript**
*   **Tailwind CSS** (for styling)
*   **Lucide React**, **MUI**, **Radix UI**
*   **Axios** (for API communication)

### Backend
*   **ASP.NET Core Web API** (.NET 10 / .NET 8)
*   **Entity Framework Core** (EF Core)
*   **SQL Server** (Database)
*   **Google Gemini AI** & **Pinecone** (Vector Search & AI Recommendation)
*   **EPPlus** (Excel Import Processing)

---

## Getting Started & Installation

### Prerequisites
*   **Node.js**: v18.0 or higher
*   **.NET SDK**: v10.0 (or v8.0)
*   **SQL Server** & **SQL Server Management Studio (SSMS)**
*   **Git**

---

### 1. Database Setup
1.  Open **SQL Server Management Studio (SSMS)** (or your preferred SQL client).
2.  Execute the database schema script:
    `src/Database.sql` (Creates database `SE_Career_Roadmap` and required table structure).
3.  Execute the seed data script to populate initial data:
    `src/SQL.sql` (Inserts initial users, courses, skills, and roadmap templates).
4.  *(Optional)* Bulk import data via Excel templates located at root:
    - `DemoImportStudents.xlsx`
    - `DemoImportCourses.xlsx`
    - `DemoImportAcademicRecords.xlsx`

---

### 2. Backend Setup
1.  Navigate to the API project directory:
    ```bash
    cd src/backend/SWP391_Career_Roadmap_API/CareerSystem.API
    ```
2.  Restore the dependencies:
    ```bash
    dotnet restore
    ```
3.  Configure application settings:
    Edit `appsettings.json` (or set environment variables) with your database connection string and API keys:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=SE_Career_Roadmap;Trusted_Connection=True;TrustServerCertificate=True;"
      },
      "Gemini": {
        "ApiKey": "YOUR_GEMINI_API_KEY"
      },
      "JwtSettings": {
        "Secret": "YOUR_JWT_SECRET_KEY",
        "Issuer": "CareerSystemAPI",
        "Audience": "CareerSystemClient"
      }
    }
    ```
4.  Run the backend:
    ```bash
    dotnet run
    ```
    *   **API URL**: `http://localhost:5087`
    *   **Swagger API Documentation**: `http://localhost:5087/swagger/index.html`

---

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd src/frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in `src/frontend/` (refer to `.env.example`):
    ```env
    VITE_API_BASE_URL=http://localhost:5087/api
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    VITE_GITHUB_REDIRECT_URI=http://localhost:5173/github-callback
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *   **Frontend URL**: `http://localhost:5173`

---

## Screenshots & Demo

### Student Interface
<figure>
<img width="1871" height="976" alt="Screenshot 2026-07-25 093005" src="https://github.com/user-attachments/assets/50d856e8-4129-4d3b-9043-26d18eea2c8a" />
</figure>

<figure>
<img width="1874" height="943" alt="user_dashboard_profile" src="https://github.com/user-attachments/assets/6ad21aeb-0f70-4c04-9512-69353c400745" />
</figure>

<figure>
<img width="1870" height="942" alt="user_ai_mentor" src="https://github.com/user-attachments/assets/6000204a-c72f-4201-ba59-632ccf31c33f" />
</figure>

<figure>
<img width="1874" height="942" alt="user_roadmap" src="https://github.com/user-attachments/assets/0915834a-d4a1-4336-ba77-857181bff07a" />
<img width="1874" height="977" alt="Screenshot 2026-07-25 092952" src="https://github.com/user-attachments/assets/beae5461-e94d-4d0d-9d5c-23b71466f712" />
</figure>

### Staff Interface
<figure>
    <img width="1869" height="941" alt="staff_dashboard" src="https://github.com/user-attachments/assets/304509fc-0c5b-40bc-8d7a-032d3c6bde43" />
</figure>

<figure>
     <img width="1878" height="941" alt="staff_skill_view" src="https://github.com/user-attachments/assets/25f4a6a8-96af-4c31-9ccf-b39fa50c9f1a" />
</figure>

 <figure>
     <img width="1876" height="943" alt="staff_student_view" src="https://github.com/user-attachments/assets/238a8d12-e310-4b32-b3e4-633b7820a499" />
</figure>

<figure>
    <img width="1872" height="943" alt="staff_course_view" src="https://github.com/user-attachments/assets/7548d7c1-abd5-47e9-bab5-068835295e9d" />
</figure>

### Demo Video
https://github.com/user-attachments/assets/4a251eea-adfa-44c3-b970-efc10bc22fc3

---

## Development & Branching Workflow

To maintain a clean repository structure, please adhere to the following workflow:

1.  **Pull the latest changes**:
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Create a new feature/fix branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Naming Conventions**:
    *   `feature/feature-name` (e.g., `feature/profile-management`)
    *   `fix/bug-name` (e.g., `fix/cors-issue`)
    *   `docs/documentation-topic`
4.  **Commit Message Conventions**:
    *   `feat: add login API integration`
    *   `fix: resolve CORS issues`
    *   `refactor: restructure API services`
5.  **Before pushing**: Ensure both frontend and backend build successfully:
    ```bash
    # Check Frontend Build
    cd src/frontend
    npm run build

    # Check Backend Build
    cd ../backend/SWP391_Career_Roadmap_API/CareerSystem.API
    dotnet build
    ```
