import { createBrowserRouter, Navigate, Outlet } from "react-router";
import LoginScreen from "./features/auth/LoginScreen";
import GithubCallbackScreen from "./features/auth/GithubCallbackScreen";
import { StudentDashboard } from "./layouts/StudentDashboard";
import StaffPanel from "./features/staff/StaffPanel";
import { StaffLayout } from "./layouts/StaffLayout";
import { StaffStudentsView } from "./features/staff/StaffStudentsView";
import { StaffCoursesView } from "./features/staff/StaffCoursesView";
import { StaffSkillsView } from "./features/staff/StaffSkillsView";
import ProfileTab from "./features/profile/ProfileTab";
import RoadmapTab from "./features/roadmap/RoadmapTab";
import { MentorTab } from "./features/mentor/MentorTab";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { NotificationProvider } from "../shared/contexts/NotificationContext";

export const router = createBrowserRouter([
  {
    element: (
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    ),
    children: [
      {
        path: "/login",
        element: <LoginScreen />,
      },
      {
        path: "/github-callback",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <GithubCallbackScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <ProfileTab /> },
          { path: "roadmap", element: <RoadmapTab /> },
          { path: "mentor", element: <MentorTab /> },
        ],
      },
      {
        path: "/staff",
        element: (
          <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "MENTOR"]}>
            <StaffLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <StaffPanel /> },
          { path: "students", element: <StaffStudentsView /> },
          { path: "courses", element: <StaffCoursesView /> },
          { path: "skills", element: <StaffSkillsView /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);