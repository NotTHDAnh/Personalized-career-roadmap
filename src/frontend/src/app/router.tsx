import { createBrowserRouter, Navigate, Outlet } from "react-router";
import LoginScreen from "./features/auth/LoginScreen";
import { StudentDashboard } from "./layouts/StudentDashboard";
import StaffPanel from "./features/staff/StaffPanel";
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
            <StaffPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);