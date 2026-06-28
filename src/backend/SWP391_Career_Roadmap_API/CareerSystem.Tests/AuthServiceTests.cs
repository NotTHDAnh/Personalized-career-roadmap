using System;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Implementations;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;

namespace CareerSystem.Tests
{
    public class AuthServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IMentorService> _mockMentorService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly AuthService _service;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockConfig = new Mock<IConfiguration>();
            _mockMentorService = new Mock<IMentorService>();
            _mockEmailService = new Mock<IEmailService>();

            // Setup default configuration values
            _mockConfig.Setup(c => c["JwtSettings:Secret"]).Returns("nevergonnagiveyouupnevergonnaletyoudown");
            _mockConfig.Setup(c => c["JwtSettings:Issuer"]).Returns("CareerSystemAPI");
            _mockConfig.Setup(c => c["JwtSettings:Audience"]).Returns("CareerSystemClient");
            _mockConfig.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("15");
            _mockConfig.Setup(c => c["JwtSettings:RefreshExpiryInDays"]).Returns("7");

            _service = new AuthService(_context, _mockConfig.Object, _mockMentorService.Object, _mockEmailService.Object);

            SeedData();
        }

        private void SeedData()
        {
            // Seed a student
            _context.Users.Add(new User
            {
                UserId = "user-student-id",
                FullName = "Student Name",
                Email = "student@pcr.com",
                Role = "Student",
                PasswordHash = PassHashValidation.HashPassword("ValidPass123")
            });

            // Seed an admin
            _context.Users.Add(new User
            {
                UserId = "user-admin-id",
                FullName = "Admin Name",
                Email = "admin@pcr.com",
                Role = "Admin",
                PasswordHash = PassHashValidation.HashPassword("ValidPass123")
            });

            // Seed a user with null password hash
            _context.Users.Add(new User
            {
                UserId = "user-null-hash-id",
                FullName = "No Password User",
                Email = "no-pass@pcr.com",
                Role = "Student",
                PasswordHash = null
            });

            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // UTCID01: Normal Login (Student)
        [Fact]
        public void Login_ValidStudentCredentials_ReturnsSuccessMessage()
        {
            var request = new LoginRequest { Email = "student@pcr.com", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Contains("Đăng nhập thành công!", result);
            Assert.Contains("Student Name", result);
            Assert.Contains("Student", result);
        }

        // UTCID02: Normal Login (Admin)
        [Fact]
        public void Login_ValidAdminCredentials_ReturnsSuccessMessage()
        {
            var request = new LoginRequest { Email = "admin@pcr.com", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Contains("Đăng nhập thành công!", result);
            Assert.Contains("Admin Name", result);
            Assert.Contains("Admin", result);
        }

        // UTCID03: Abnormal Login - Non-existent email
        [Fact]
        public void Login_NonExistentEmail_ReturnsUserNotFound()
        {
            var request = new LoginRequest { Email = "nonexistent@pcr.com", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Equal("Tài khoản không tồn tại!", result);
        }

        // UTCID04: Abnormal Login - Incorrect password
        [Fact]
        public void Login_WrongPassword_ReturnsIncorrectPassword()
        {
            var request = new LoginRequest { Email = "student@pcr.com", Password = "WrongPass" };
            var result = _service.Login(request);
            Assert.Equal("Mật khẩu không chính xác!", result);
        }

        // UTCID05: Abnormal Login - Empty email
        [Fact]
        public void Login_EmptyEmail_ReturnsUserNotFound()
        {
            var request = new LoginRequest { Email = "", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Equal("Tài khoản không tồn tại!", result);
        }

        // UTCID06: Abnormal Login - Null email
        [Fact]
        public void Login_NullEmail_ReturnsUserNotFound()
        {
            var request = new LoginRequest { Email = null!, Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Equal("Tài khoản không tồn tại!", result);
        }

        // UTCID07: Abnormal Login - Empty password
        [Fact]
        public void Login_EmptyPassword_ReturnsIncorrectPassword()
        {
            var request = new LoginRequest { Email = "student@pcr.com", Password = "" };
            var result = _service.Login(request);
            Assert.Equal("Mật khẩu không chính xác!", result);
        }

        // UTCID08: Abnormal Login - Null password
        [Fact]
        public void Login_NullPassword_ReturnsIncorrectPassword()
        {
            var request = new LoginRequest { Email = "student@pcr.com", Password = null! };
            var result = _service.Login(request);
            Assert.Equal("Mật khẩu không chính xác!", result);
        }

        // UTCID09: Abnormal Login - Null password hash in DB
        [Fact]
        public void Login_NullPasswordHashInDb_ReturnsIncorrectPassword()
        {
            var request = new LoginRequest { Email = "no-pass@pcr.com", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Equal("Mật khẩu không chính xác!", result);
        }

        // UTCID13: Normal Login - Case insensitive email
        [Fact]
        public void Login_CaseInsensitiveEmail_ReturnsSuccessMessage()
        {
            var request = new LoginRequest { Email = "STUDENT@PCR.COM", Password = "ValidPass123" };
            var result = _service.Login(request);
            Assert.Contains("Đăng nhập thành công!", result);
        }
    }
}
