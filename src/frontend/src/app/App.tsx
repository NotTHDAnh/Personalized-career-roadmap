import { useState } from "react";
import LoginScreen from "./features/auth/LoginScreen";
import StudentDashboard from "../layouts/StudentDashboard";
import StaffPanel from "./features/staff/StaffPanel";

type Screen = "landing" | "student" | "staff";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className="size-full">
      {/* MARKER-MAKE-KIT-INVOKED */}
      {screen === "landing" && (
        <LoginScreen
          onStudentLogin={() => setScreen("student")}
          onStaffLogin={() => setScreen("staff")}
        />
      )}
      {screen === "student" && (
        <StudentDashboard onLogout={() => setScreen("landing")} />
      )}
      {screen === "staff" && (
        <StaffPanel onLogout={() => setScreen("landing")} />
      )}
    </div>
  );
}
