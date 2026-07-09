import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import { useAuth } from "../../shared/contexts/AuthContext";
import {
  BookOpen,
  Map,
  MessageCircle,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    to: "/dashboard/profile",
    label: "Profile",
    icon: <BookOpen size={20} />,
  },
  {
    to: "/dashboard/roadmap",
    label: "My Roadmap",
    icon: <Map size={20} />,
  },
  {
    to: "/dashboard/mentor",
    label: "AI Mentor",
    icon: <MessageCircle size={20} />,
  },
];

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const displayName = user?.fullName || "Student";
  const initial = displayName.trim().split(/\s+/).at(-1)?.[0]?.toUpperCase() ?? "S";

  const currentNav = navItems.find((item) =>
    location.pathname.startsWith(item.to),
  );

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isSidebarOpen ? "ml-[260px] w-[calc(100vw-260px)]" : "ml-[80px] w-[calc(100vw-80px)]"
      } bg-[#F4F7F9]`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-screen text-[#0F172A] flex flex-col z-[100] transition-all duration-300 bg-[#EFF4FF] border-r border-[#E2E8F0] shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
          isSidebarOpen ? "w-[260px]" : "w-[80px]"
        }`}
      >
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-8 right-[-14px] flex items-center justify-center w-7 h-7 bg-white border border-[#E2E8F0] rounded-full shadow-sm text-[#64748B] hover:text-[#3B28CC] hover:border-[#3B28CC] transition-colors z-[999]"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo */}
        <div className="p-6 flex items-center overflow-hidden h-[80px]">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#3B28CC]">
            <GraduationCap size={28} />
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "max-w-[200px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}>
            <h1 className="text-[18px] font-bold text-[#3B28CC] tracking-tight">DevRoadmap</h1>
            <p className="text-[11px] text-[#64748B] font-medium">Attainable Mastery</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center px-[14px] py-3 rounded-xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-[#DCFCE7] text-[#16A34A] font-bold shadow-sm"
                    : "text-[#64748B] hover:bg-white hover:text-[#0F172A] font-semibold"
                }`
              }
              title={!isSidebarOpen ? item.label : undefined}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-5">{item.icon}</div>
              <span className={`text-[13px] whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? "max-w-[150px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 mt-auto border-t border-[#E2E8F0]">
          {/* User Info */}
          <div className="flex items-center px-1 mb-4 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white text-[#3B28CC] flex items-center justify-center font-bold text-[14px] flex-shrink-0 shadow-sm border border-[#C7D2FE]">
              {initial}
            </div>
            <div className={`flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "max-w-[150px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}>
              <span className="text-[13px] font-bold text-[#0F172A] truncate">
                {displayName}
              </span>
              <span className="text-[11px] font-semibold text-[#16A34A]">
                Student
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center px-[15px] py-2.5 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444] transition-all duration-300 overflow-hidden"
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-[18px]"><LogOut size={18} /></div>
            <span className={`text-[13px] font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarOpen ? "max-w-[150px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 w-full flex flex-col h-screen overflow-hidden bg-[#F4F7F9] transition-colors duration-300">
        {/* Header */}
        <header
          className="h-[68px] bg-[#F8F9FF] px-6 md:px-8 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] border-b border-[#E2E8F0] z-50 transition-colors duration-300"
        >
          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A]">
              {currentNav?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#3B28CC] flex items-center justify-center font-bold text-[13px] shadow-sm border border-[#C7D2FE]">
              {initial}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}