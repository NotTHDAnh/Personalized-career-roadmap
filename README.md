# SWP Career Orientation App

Dự án web hỗ trợ định hướng nghề nghiệp và tạo lộ trình học tập cá nhân hóa cho sinh viên ngành Software Engineering.

# WARNING: NHỚ CHẠY CẢ 2 CÁI FRONT VỚI BACK LUÔN NHA AE !!!!!!!!!!!!!!!!!

### Cách xài github
https://www.youtube.com/watch?v=wFKu81ZMEcg

## 0. Checklist trước khi code (SET UP XONG ĐỌC CŨNG ĐC)

Trước khi bắt đầu làm task mới:

```bash
git pull origin main
git checkout -b feature/task-name
```
Pull project để update code, checkout để tạo branch mới, không code thẳng vào main nha ae

Trước khi push:

```bash
npm run build
dotnet build
git status
```

## 1. Công nghệ sử dụng

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

### Công cụ cần cài
- Node.js 18 trở lên
- .NET SDK 8 trở lên
- SQL Server
- Visual Studio 2022 hoặc Visual Studio Code
- Git

---

## 2. Các luồng chính của hệ thống

### 2.1 Profile Management
Quản lý hồ sơ người dùng, thông tin học tập, môn học đã hoàn thành, điểm số và kỹ năng hiện có.

### 2.2 Job Advisement
Hệ thống hỗ trợ tư vấn định hướng nghề nghiệp dựa trên hồ sơ học tập, kỹ năng hiện tại và vai trò nghề nghiệp mục tiêu.

### 2.3 Roadmap Generation
Hệ thống tạo lộ trình học tập cá nhân hóa dựa trên kỹ năng còn thiếu, môn học liên quan, tài nguyên học tập và tiến độ hoàn thành.

---

## 3. Cấu trúc thư mục đề xuất

```txt
root/
  backend/
    CareerSystem.API/
      Controllers/
      Data/
      DTOs/
      Models/
      Services/
      Program.cs
      appsettings.json

  frontend/
    src/
      app/
      shared/
    .env.example
    package.json
    vite.config.ts
```

Lưu ý: nếu project thực tế đang đặt tên thư mục khác, thành viên trong nhóm cần sửa lại lệnh `cd` cho đúng.

---

## 4. Cách clone project

```bash
git clone <repo-url>
cd <repo-folder>
```

Ví dụ:

```bash
git clone https://github.com/<owner>/<repo-name>.git
cd <repo-name>
```

clone xong ae chạy file Database.sql(src/Database.sql) trong SSMS là có database nha

---

## 5. Cấu hình Backend

**AE NHỚ CÀI .NET 10 NHA !!!!!**
Link:https://dotnet.microsoft.com/en-us/download/dotnet/10.0
Đi vào thư mục backend:

```bash
cd backend/CareerSystem.API
```

Restore package:

```bash
dotnet restore
```

Mở file `appsettings.json` và kiểm tra connection string:
**AE VÔ FILE NÀY XONG ĐỔI DÒNG NÀY**

```json
 "DefaultConnection": "Server=localhost,1433;Database=SE_Career_Roadmap;User Id=sa;Password=12345;TrustServerCertificate=True;Encrypt=True;"
```
Đổi User Id với password là Login với password trong SSMS của ae
**GIỐNG TRONG PRJ301**
<img width="468" height="450" alt="image" src="https://github.com/user-attachments/assets/10b76864-1334-4a2a-86d1-ea99d15f244c" />


Chạy backend:

```bash
dotnet build
dotnet run
```


Backend thường chạy ở một trong các URL sau:

```txt
http://localhost:5087 (CÁI NÀY MỚI HAY XÀI NHA AE)
https://localhost:7032
```

Mở Swagger để test API(Chạy Code BackEnd xong nó tự mở nha ae):

```txt
http://localhost:5087/swagger
```

---

## 6. Cấu hình Frontend

Đi vào thư mục frontend:

```bash
cd frontend
```

Cài dependencies:

```bash
npm install
```

Tạo file `.env` từ file mẫu:
# Trong thư mục frontend nha 

```bash
cp .env.example .env
```

Nếu dùng Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Hoặc tạo mới file tên ".env" trong thư mục frontend

Nội dung file `.env`:

```env
VITE_API_BASE_URL=http://localhost:5087/api
```

Lưu ý:
- File `.env` phải nằm cùng cấp với `package.json`.
- Sau khi sửa `.env`, phải tắt frontend rồi chạy lại.
- Không commit file `.env` lên GitHub.

Chạy frontend:

```bash
npm run dev
```

Frontend thường chạy ở:

```txt
http://localhost:5173
```

---

## 7. Cấu hình CORS cho Backend
**(CÁI NÀY ĐƯỢC CẤU HÌNH TRƯỚC RỒI KHÔNG CẦN ĐỤNG VÀO)**
Trong `Program.cs`, cần có cấu hình CORS để frontend gọi được API.

Thêm trước `var app = builder.Build();`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
```

Sau `var app = builder.Build();`, đặt middleware đúng thứ tự:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Tạm thời tắt dòng này nếu frontend đang gọi http://localhost:5087
// app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
```

Lỗi thường gặp:
- Tạo policy tên `AllowAll` nhưng lại gọi `app.UseCors("AllowReactApp")`.
- Đặt `app.UseCors(...)` sau `app.MapControllers()`.
- Frontend gọi `http://localhost:5087` nhưng backend tự redirect sang HTTPS.

---

## 8. Tài khoản test

Có thể tạo tài khoản test trong SQL Server như sau:

```sql
USE SE_Career_Roadmap;
GO

INSERT INTO Users (user_id, email, password_hash, full_name, role, oauth_provider)
VALUES
('student-001', 'student@gmail.com', '123456', N'Nguyễn Văn An', 'STUDENT', 'LOCAL'),
('staff-001', 'staff@gmail.com', '123456', N'Admin Staff', 'STAFF', 'LOCAL');
```

Thông tin đăng nhập test:

```txt
Student:
Email: student@gmail.com
Password: 123456

Staff:
Email: staff@gmail.com
Password: 123456
```

Lưu ý: bản demo hiện tại có thể đang so sánh password trực tiếp với cột `password_hash`. Khi làm chính thức cần đổi sang hash password như BCrypt hoặc ASP.NET Identity.

---

## 9. Luồng đăng nhập hiện tại

Frontend gọi API:

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "student@gmail.com",
  "password": "123456"
}
```

Backend trả về:

```json
{
  "accessToken": "demo-token-student-001",
  "user": {
    "userId": "student-001",
    "email": "student@gmail.com",
    "fullName": "Nguyễn Văn An",
    "role": "STUDENT"
  }
}
```

Frontend lưu:
- `accessToken`
- `currentUser`
- `loginMode`

Frontend sẽ kiểm tra:
- Chọn tab Student thì role phải là `STUDENT`
- Chọn tab Staff / Admin thì role phải là `STAFF`, `ADMIN` hoặc `MENTOR`

---

## 10. Quy trình làm việc với Git

Không push trực tiếp lên `main`.

Tạo branch riêng cho từng task:

```bash
git checkout -b feature/profile-management
```

Commit code:

```bash
git add .
git commit -m "feat: add profile management UI"
```

Push branch:

```bash
git push -u origin feature/profile-management
```

Sau đó tạo Pull Request trên GitHub để merge vào `main`.

---

## 11. Quy ước đặt tên branch

```txt
feature/profile-management
feature/job-advisement
feature/roadmap-generation
feature/login-api
fix/cors-issue
fix/login-ui
docs/setup-guide
```

---

## 12. Quy ước commit message

```txt
feat: add login API integration
feat: add roadmap generation page
fix: resolve CORS issue
fix: correct API base URL
docs: add setup guide
refactor: split login component
```

Ý nghĩa:
- `feat`: thêm chức năng mới
- `fix`: sửa lỗi
- `docs`: cập nhật tài liệu
- `refactor`: chỉnh lại code nhưng không đổi behavior
- `chore`: việc phụ như config, format, dependency

---

## 13. File không được commit

Các file và thư mục sau không được push lên GitHub:

```txt
node_modules/
dist/
build/
bin/
obj/
.vs/
.env
.env.local
*.user
*.suo
```

Nên có file `.gitignore` ở root project:

```gitignore
# Frontend
node_modules/
dist/
build/
.env
.env.local
.env.*.local

# Backend .NET
bin/
obj/
.vs/
*.user
*.suo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db
```

---

## 14. Lỗi thường gặp

### 14.1 Frontend báo Failed to fetch

Kiểm tra `.env`:

```env
VITE_API_BASE_URL=http://localhost:5087/api
```

Sau đó restart frontend:

```bash
npm run dev
```

### 14.2 Swagger chạy được nhưng frontend không gọi được API

Thường là lỗi CORS hoặc sai API URL.

Kiểm tra `Program.cs` có:

```csharp
app.UseCors("AllowAll");
```

và dòng này phải nằm trước:

```csharp
app.MapControllers();
```

### 14.3 Request bị gọi sai port

Mở DevTools → Network → xem `Request URL`.

Đúng:

```txt
http://localhost:5087/api/auth/login
```

Sai ví dụ:

```txt
https://localhost:7000/api/auth/login
http://localhost:5087/auth/login
```

### 14.4 Trang trắng sau khi login

Mở DevTools → Console để xem lỗi.

Có thể clear localStorage:

```js
localStorage.clear()
location.reload()
```

### 14.5 Sửa `.env` nhưng frontend vẫn gọi URL cũ

Phải tắt terminal frontend rồi chạy lại:

```bash
npm run dev
```

Vite chỉ đọc `.env` khi start dev server.

---

Nếu build pass thì commit và push.

---

## 15. Ghi chú cho team

- Backend và frontend chạy ở hai terminal riêng.
- Không sửa trực tiếp trên branch `main`.
- Không push `.env`.
- Không push `node_modules`, `bin`, `obj`.
- Mỗi task nên có một branch riêng.
- Code xong tạo Pull Request để cả team review.
