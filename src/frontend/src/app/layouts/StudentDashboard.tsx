import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import { useAuth } from "../../shared/contexts/AuthContext";
import { COLORS } from "../../shared/constants/colors";
import {
  BookOpen,
  Map,
  MessageCircle,
  LogOut,
  Bell,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
};

const navItems: NavItem[] = [
  {
    to: "/dashboard/profile",
    label: "Profile & Transcripts",
    icon: <BookOpen size={17} />,
    desc: "GPA · Courses · Status",
  },
  {
    to: "/dashboard/roadmap",
    label: "My Career Roadmap",
    icon: <Map size={17} />,
    desc: "Skill trees · Paths",
  },
  {
    to: "/dashboard/mentor",
    label: "AI Virtual Mentor",
    icon: <MessageCircle size={17} />,
    desc: "Chat · Guidance",
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
        isSidebarOpen ? "ml-[280px] w-[calc(100vw-280px)]" : "ml-0 w-full"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] text-white flex flex-col z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: COLORS.BLUE_PRIMARY }}
      >
        {/* ── CHI TIẾT THAY ĐỔI: Cái "Bookmark" handle nằm ở đây ── */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-r-xl transition-all duration-300 shadow-md text-white hover:brightness-110"
          style={{
            right: "-24px",         // Đẩy nó thò ra ngoài sidebar 24px
            width: "24px",          // Chiều rộng hình chữ nhật đứng (bookmark)
            height: "50px",         // Chiều dài dọc theo sidebar
            background: COLORS.BLUE_PRIMARY, // Trùng màu nền để nhìn liền mạch với sidebar
          }}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <GraduationCap size={28} style={{ color: COLORS.MINT_ACCENT }} />
            <div>
              <h1 className="font-bold leading-tight">Smart Career Roadmap</h1>
              <p className="text-xs text-white/60">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#006b5f] text-white shadow"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold"
              style={{ background: COLORS.TEAL_DARK }}
            >
              {initial}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">
                {displayName}
              </span>
              <span
                className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: COLORS.MINT_LIGHT }}
              >
                {user?.role || "None"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={logout}
            className="mt-4 w-full justify-start gap-3 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </Button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 w-full">
        <header
          className="h-20 bg-white px-6 md:px-10 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${COLORS.BORDER_DEFAULT}` }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: COLORS.TEXT_MUTED }}
            >
              Student Dashboard
            </p>
            <h2
              className="text-xl font-bold"
              style={{ color: COLORS.NAVY_HEADING }}
            >
              {currentNav?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: COLORS.SURFACE_BLUE_LIGHT }}
            >
              <Bell size={18} style={{ color: COLORS.NAVY_HEADING }} />
            </button>
            <div
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold"
              style={{ background: COLORS.TEAL_DARK }}
            >
              {initial}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}