# SE Career Roadmap - Personalized Career Orientation & Learning Roadmap System

An intelligent web application designed to support Software Engineering (SE) students in career orientation, analyzing academic profiles, and generating personalized learning roadmaps based on target job roles and missing skills.

---

## 🚀 About The Project

This application acts as a career development assistant for SE students. By analyzing student academic history, completed courses, and current skills, the system recommends suitable career paths and automatically constructs a personalized, step-by-step learning roadmap to bridge any skill gaps.

### Key Features
*   **Profile & Academic Record Management**: Manage student profiles, track completed courses, grades, and skills.
*   **Intelligent Job Advisement**: Match student academic profiles and current skills with industry-standard job requirements to suggest the best-fitting career roles.
*   **Personalized Roadmap Generation**: Generate custom learning roadmaps highlighting missing skills, recommending specific university courses, providing extra learning resources, and tracking completion status.
*   **Data Import (Excel)**: Supports bulk importing of academic records, courses, and student profiles using pre-defined Excel templates.

---

## 🛠️ Tech Stack

### Frontend
*   **React** (v18+)
*   **Vite**
*   **TypeScript**
*   **Tailwind CSS** (for styling)
*   **Axios** (for API communication)

### Backend
*   **ASP.NET Core Web API** (using .NET 10/8)
*   **Entity Framework Core** (EF Core)
*   **SQL Server** (Database)

---

## 💻 Getting Started & Installation

### Prerequisites
*   **Node.js** (v18 or higher)
*   **.NET SDK** (v10 or v8)
*   **SQL Server & SQL Server Management Studio (SSMS)**
*   **Git**

### 1. Database Setup
1.  Open **SQL Server Management Studio (SSMS)**.
2.  Open and execute the database script located at `src/Database.sql` (or import using the demo Excel files `DemoImport*.xlsx`).

### 2. Backend Setup
1.  Navigate to the backend project directory:
    ```bash
    cd backend/CareerSystem.API
    ```
2.  Restore the dependencies:
    ```bash
    dotnet restore
    ```
3.  Configure the database connection string:
    Open `appsettings.json` and update the `DefaultConnection` string with your SQL Server server name, login, and password:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost,1433;Database=SE_Career_Roadmap;User Id=your_username;Password=your_password;TrustServerCertificate=True;Encrypt=True;"
    }
    ```
4.  Run the backend:
    ```bash
    dotnet build
    dotnet run
    ```
    *   The API server will run on `http://localhost:5087`.
    *   Access the **Swagger API Documentation** at: `http://localhost:5087/swagger/index.html`.

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the environment variables:
    Create a `.env` file in the root of the `frontend` folder (parallel to `package.json`):
    ```env
    VITE_API_BASE_URL=http://localhost:5087/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *   The frontend will run on `http://localhost:5173`.

---

## 🔑 Demo Credentials

Use the following accounts to sign in and test the application flows:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@gmail.com` | `123456` |
| **Staff / Admin** | `staff@gmail.com` | `123456` |

---

## 🔄 Development & Branching Workflow

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
5.  **Before pushing**: Ensure both frontend and backend build successfully.
    ```bash
    # Frontend
    npm run build
    # Backend
    dotnet build
    ```
