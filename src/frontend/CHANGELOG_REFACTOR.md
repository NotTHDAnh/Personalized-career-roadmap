# Frontend Refactoring Changelog

> Mỗi thay đổi ghi lại: **file**, **dòng code**, **chức năng** và **đoạn code mẫu**

---

## Phase 1: Centralize Types

### File: [src/app/types/auth.ts](file:///d:/Code/swp-project/src/frontend/src/app/types/auth.ts)
- **Dòng code:** 1 - 27
- **Chức năng:** Định nghĩa các kiểu dữ liệu liên quan đến Authentication.
- **Đoạn code:**
```typescript
export type LoginMode = "student" | "staff";
export type LoginRequest = { email: string; password: string; };
export type LoginUser = { userId: string; email: string; fullName: string; role: string; };
export type LoginResponse = { accessToken: string; user: LoginUser; };
export type AppSession = { user: LoginUser; mode: LoginMode; };
```

### File: [src/app/types/roadmap.ts](file:///d:/Code/swp-project/src/frontend/src/app/types/roadmap.ts)
- **Dòng code:** 1 - 35
- **Chức năng:** Định nghĩa kiểu cho các Node trong sơ đồ Roadmap học tập.
- **Đoạn code:**
```typescript
export type NodeState = "done" | "active" | "locked";
export interface CourseNode {
  id: number;
  name: string;
  code: string;
  shortLabel: string;
  state: NodeState;
  zone: 1 | 2 | 3 | 4;
  source: "university" | "external";
  duration: string;
  prerequisite: string;
  skills: string[];
  cx: number;
  cy: number;
}
export interface RoadmapGoal { title: string; subtitle: string; }
```

### File: [src/app/types/mentor.ts](file:///d:/Code/swp-project/src/frontend/src/app/types/mentor.ts)
- **Dòng code:** 1 - 19
- **Chức năng:** Định nghĩa các kiểu phản hồi của AI Mentor.
- **Đoạn code:**
```typescript
export type MentorAskResponse = {
  targetRoleId?: string;
  targetRoleName?: string;
  followUpQuestion?: string;
  answer?: string;
  recommendedCareers?: string[];
  missingSkills?: string[];
};
export type GenerateRoadmapResponse = { message?: string; roadmapId?: string; };
export type RoadmapPreview = Record<string, unknown>;
```

### File: [src/app/types/staff.ts](file:///d:/Code/swp-project/src/frontend/src/app/types/staff.ts)
- **Dòng code:** 1 - 17
- **Chức năng:** Định nghĩa các kiểu dữ liệu dùng cho form của Staff.
- **Đoạn code:**
```typescript
export interface CourseFormData {
  courseName: string;
  courseCode: string;
  duration: string;
  hashtags: string;
}
export interface StaffCourse { code: string; name: string; duration?: string; skills?: string[]; }
```

### File: [src/app/types/index.ts](file:///d:/Code/swp-project/src/frontend/src/app/types/index.ts)
- **Dòng code:** 1 - 60
- **Chức năng:** Tập hợp và re-export toàn bộ kiểu dữ liệu qua barrel file.
- **Đoạn code:**
```typescript
export type Screen = "login" | "dashboard" | "staff";
export type DashTab = "profile" | "roadmap" | "mentor";
export type { LoginMode, LoginRequest, LoginUser, LoginResponse, AppSession } from "./auth";
export type { NodeState, CourseNode, RoadmapGoal, ZoneConfig } from "./roadmap";
export type { MentorAskResponse, GenerateRoadmapResponse, RoadmapPreview } from "./mentor";
export type { CourseFormData, StaffCourse } from "./staff";
```

---

## Phase 2: Design Tokens & Icon System

### File: [src/shared/constants/colors.ts](file:///d:/Code/swp-project/src/frontend/src/shared/constants/colors.ts)
- **Dòng code:** 1 - 60
- **Chức năng:** Hằng số định nghĩa hệ thống màu sắc dùng chung thay thế cho hex rải rác.
- **Đoạn code:**
```typescript
export const COLORS = {
  BLUE_PRIMARY: "#1B365D",
  TEAL_ACCENT: "#0D9488",
  TEAL_DARK: "#006b5f",
  NAVY_HEADING: "#002046",
  TEXT_PRIMARY: "#0b1c30",
  BORDER_LIGHT: "#E2E8F0",
  SURFACE_BG: "#F1F5F9",
  GREEN_DONE: "#22C55E",
  GREEN_DONE_BORDER: "#16A34A",
  LOCKED_BG: "#CBD5E1",
  LOCKED_BORDER: "#94A3B8",
} as const;
```

### File: [index.html](file:///d:/Code/swp-project/src/frontend/index.html)
- **Dòng code:** 10 - 12
- **Chức năng:** Loại bỏ Material Fonts và thêm kết nối tới Inter Font.
- **Đoạn code:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

---

## Phase 3: Auth Context

### File: [src/shared/contexts/AuthContext.tsx](file:///d:/Code/swp-project/src/frontend/src/shared/contexts/AuthContext.tsx)
- **Dòng code:** 1 - 105
- **Chức năng:** Triển khai AuthProvider và hook useAuth để quản lý đăng nhập và phiên đăng nhập.
- **Đoạn code:**
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  
  const login = useCallback((accessToken: string, loginUser: LoginUser, mode: LoginMode) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loginUser));
    setUser(loginUser);
    setToken(accessToken);
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);
...
```

### File: [src/shared/api/apiClient.ts](file:///d:/Code/swp-project/src/frontend/src/shared/api/apiClient.ts)
- **Dòng code:** 20 - 45
- **Chức năng:** Thêm callback logout tự động khi nhận mã lỗi 401 Unauthorized.
- **Đoạn code:**
```typescript
let onUnauthorizedCallback: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) { onUnauthorizedCallback = cb; }

// Trong interceptor/fetch logic:
if (res.status === 401) {
  if (onUnauthorizedCallback) onUnauthorizedCallback();
  throw new Error("Session expired. Please login again.");
}
```

---

## Phase 4: React Router

### File: [src/app/router.tsx](file:///d:/Code/swp-project/src/frontend/src/app/router.tsx)
- **Dòng code:** 1 - 42
- **Chức năng:** Cấu hình React Router định tuyến bằng URL thay thế cho switch-state.
- **Đoạn code:**
```typescript
export const router = createBrowserRouter([
  { path: "/login", element: <LoginScreen /> },
  {
    path: "/dashboard",
    element: <ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="profile" replace /> },
      { path: "profile", element: <ProfileTab /> },
      { path: "roadmap", element: <RoadmapTab /> },
      { path: "mentor", element: <MentorTab /> },
    ]
  },
  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "MENTOR"]}><StaffPanel /></ProtectedRoute>
  }
]);
```

### File: [src/app/components/common/ProtectedRoute.tsx](file:///d:/Code/swp-project/src/frontend/src/app/components/common/ProtectedRoute.tsx)
- **Dòng code:** 1 - 28
- **Chức năng:** Bảo mật route dựa trên trạng thái auth và danh sách vai trò cho phép.
- **Đoạn code:**
```typescript
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
}
```

---

## Phase 5: Cleanup Dead Code

### File: [MentorTab.tsx](file:///d:/Code/swp-project/src/frontend/src/app/features/mentor/MentorTab.tsx)
- **Dòng code:** 140 - 150
- **Chức năng:** Loại bỏ lời gọi `setTargetRole` bị lặp lại vô lý khi xử lý phản hồi từ AI.
- **Đoạn code:**
```typescript
// LOẠI BỎ ĐOẠN TRÙNG LẶP:
// if (mentorResponse.targetRoleName) {
//   setTargetRole({ id: mentorResponse.targetRoleId, name: mentorResponse.targetRoleName });
// }
```

### File: [StatusIcon.tsx](file:///d:/Code/swp-project/src/frontend/src/app/components/common/StatusIcon.tsx)
- **Dòng code:** 1 - 10
- **Chức năng:** Dọn dẹp hơn 20 import Lucide icon dư thừa.
- **Đoạn code:**
```typescript
// Trước refactor: import { GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send, AlertTriangle, Plus... }
// Sau refactor:
import { CheckCircle2, Clock, Circle } from "lucide-react";
```

---

## Phase 6: shadcn/ui Components

### File: [CourseForm.tsx](file:///d:/Code/swp-project/src/frontend/src/app/features/staff/components/CourseForm.tsx)
- **Dòng code:** 1 - 32
- **Chức năng:** Sử dụng `<Input>` và `<Button>` từ shadcn thay cho các phần tử raw HTML.
- **Đoạn code:**
```typescript
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export function CourseForm({ form, setForm, onSubmit }: CourseFormProps) {
  return (
    <form onSubmit={onSubmit}>
       ...
       <Input
         type="text"
         value={form[key as keyof CourseFormData]}
         onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
       />
       ...
       <Button type="submit" className="bg-[#1B365D] hover:bg-[#1B365D]/90">
         Add Course
       </Button>
    </form>
  );
}
```

### File: [SkillTag.tsx](file:///d:/Code/swp-project/src/frontend/src/app/features/profile/components/SkillTag.tsx)
- **Dòng code:** 1 - 15
- **Chức năng:** Chuyển đổi `<span style={...}>` thành `<Badge>` của shadcn.
- **Đoạn code:**
```typescript
import { Badge } from "@/app/components/ui/badge";

export function SkillTag({ label, variant }: { label: string; variant?: "blue" | "green" }) {
  const isGreen = variant === "green";
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-xs border ${
        isGreen ? "bg-green-50 text-green-600 border-green-200" : "bg-blue-50 text-blue-600 border-blue-200"
      }`}
    >
      {label}
    </Badge>
  );
}
```

---

## Phase 7: Loading & Error States

### File: [LoadingSpinner.tsx](file:///d:/Code/swp-project/src/frontend/src/app/components/common/LoadingSpinner.tsx)
- **Dòng code:** 1 - 10
- **Chức năng:** Spinner dùng chung sử dụng icon quay của Lucide.
- **Đoạn code:**
```typescript
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[150px]">
      <Loader2 className={`w-8 h-8 animate-spin text-[#0D9488] ${className ?? ""}`} />
    </div>
  );
}
```

### File: [ErrorAlert.tsx](file:///d:/Code/swp-project/src/frontend/src/app/components/common/ErrorAlert.tsx)
- **Dòng code:** 1 - 32
- **Chức năng:** Khung báo lỗi và thực hiện Retry.
- **Đoạn code:**
```typescript
export function ErrorAlert({ title = "Error", message, onRetry }: ErrorAlertProps) {
  return (
    <div className="p-4 w-full">
      <Alert variant="destructive" className="border-red-200/50 bg-red-50/50 text-red-800">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertTitle className="font-semibold text-red-900">{title}</AlertTitle>
        <AlertDescription className="text-red-700/90 mt-1 flex flex-col items-start gap-3">
          <p>{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="bg-white text-red-800 hover:bg-red-50">
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

### File: [ProfileTab.tsx](file:///d:/Code/swp-project/src/frontend/src/app/features/profile/ProfileTab.tsx)
- **Dòng code:** 45 - 90
- **Chức năng:** Hiển thị `<Skeleton />` động trong khi load dữ liệu giả lập.
- **Đoạn code:**
```typescript
{loading ? (
  <div className="space-y-4">
    <Skeleton className="h-10 w-24" />
    <Skeleton className="h-2 w-full" />
  </div>
) : (
  <div>
    <div className="flex items-baseline gap-2 mb-4">
      <span style={{ fontSize: "2.4rem", fontWeight: 700, color: COLORS.BLUE_PRIMARY }}>36</span>
      <span className="text-sm text-gray-500">Weeks Completed</span>
    </div>
    <Progress value={60} className="h-2 [&>[data-slot=progress-indicator]]:bg-[#0D9488]" />
  </div>
)}
```

---

## Phase 8: Visual Polish & Feedback

### File: [theme.css](file:///d:/Code/swp-project/src/frontend/src/styles/theme.css)
- **Dòng code:** 33
- **Chức năng:** Tinh chỉnh biến `--radius` từ `0.75rem` (12px) xuống `0.5rem` (8px). Biến này điều hướng tất cả các góc bo tròn mặc định của button, input (rounded-md) xuống `6px` thay vì `10px`, giúp nút bấm và ô nhập trông vuông vắn, cứng cáp và chuyên nghiệp hơn.
- **Đoạn code:**
```css
:root {
  --radius: 0.5rem; /* Giảm từ 0.75rem để toàn bộ nút bấm/ô nhập vuông vắn hơn */
}
```

### File: [LoginScreen.tsx](file:///d:/Code/swp-project/src/frontend/src/app/features/auth/LoginScreen.tsx)
- **Dòng code:** 10, 62, 88 - 95, 213 - 223
- **Chức năng:** Tinh chỉnh giao diện đăng nhập: tăng cường đổ bóng đổ (box-shadow) với tông xanh navy sâu để phân tách khối nổi bật trên nền xám nhạt, làm đậm màu thanh switch vai trò (Student/Staff) thành `bg-slate-300/80` để tương phản rõ ràng hơn với nền, và bổ sung checkbox "Remember me on this device" sử dụng component Checkbox của shadcn.
- **Đoạn code:**
```typescript
// Dòng 10: Import component Checkbox từ shadcn ui
import { Checkbox } from "../../components/ui/checkbox";

// Dòng 62: Thay thế shadow-2xl bằng đổ bóng sâu tông Navy Blue sang trọng
<main className="w-full max-w-[1200px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px] shadow-[0_25px_60px_-15px_rgba(27,54,93,0.22),0_15px_30px_-15px_rgba(0,0,0,0.12)] border border-border">

// Dòng 88: Tăng tương phản cho switch Student/Staff bằng màu nền và viền đậm hơn
<TabsList className="w-full bg-slate-300/80 border border-slate-300">
  <TabsTrigger
    value="student"
    className="flex-1 text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm"
  >
    Student Login
  </TabsTrigger>
  <TabsTrigger
    value="staff"
    className="flex-1 text-slate-700 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm"
  >
    Staff Login
  </TabsTrigger>
</TabsList>

// Dòng 213 - 223: Bổ sung checkbox "Remember me on this device"
<div className="flex items-center space-x-2">
  <Checkbox id="remember-me" defaultChecked />
  <label
    htmlFor="remember-me"
    className="text-sm font-medium leading-none cursor-pointer select-none"
    style={{ color: COLORS.TEXT_PRIMARY }}
  >
    Remember me on this device
  </label>
</div>
```
