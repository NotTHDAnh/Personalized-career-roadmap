
using CareerSystem.API.Data;
using CareerSystem.API.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using OfficeOpenXml;
using System.Text;

namespace CareerSystem.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Controller
            builder.Services.AddControllers();

            // Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Services
            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IAuthService,
                CareerSystem.API.Services.Implementations.AuthService>();
            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IEmailService,
                CareerSystem.API.Services.Implementations.EmailService>();

            builder.Services.AddHttpClient<GithubService>();

            // Sử dụng HttpClient mặc định của .NET
            builder.Services.AddHttpClient<CareerSystem.API.Services.Interfaces.IGeminiService,
                CareerSystem.API.Services.Implementations.GeminiService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IApiKeyService,
                CareerSystem.API.Services.Implementations.ApiKeyService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IPromptContextService,
                CareerSystem.API.Services.Implementations.PromptContextService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IAiRecommendationService,
                CareerSystem.API.Services.Implementations.AiRecommendationService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IRoadmapService,
                CareerSystem.API.Services.Implementations.RoadmapService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IMentorService,
                CareerSystem.API.Services.Implementations.MentorService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.ICourseService,
                CareerSystem.API.Services.Implementations.CourseService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.ISkillService,
                CareerSystem.API.Services.Implementations.SkillService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IStudentImportService,
                CareerSystem.API.Services.Implementations.StudentImportService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.ICourseImportService,
                CareerSystem.API.Services.Implementations.CourseImportService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IAcademicRecordImportService,
                CareerSystem.API.Services.Implementations.AcademicRecordImportService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IStudentService,
               CareerSystem.API.Services.Implementations.StudentService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IStaffService,
                CareerSystem.API.Services.Implementations.StaffService>();

            builder.Services.AddHttpClient<CareerSystem.API.Services.Interfaces.IGeminiEmbeddingService,
                CareerSystem.API.Services.Implementations.GeminiEmbeddingService>();
            builder.Services.AddHttpClient<CareerSystem.API.Services.Interfaces.IPineconeService,
                CareerSystem.API.Services.Implementations.PineconeService>();
            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IRagService,
                CareerSystem.API.Services.Implementations.RagService>();

            // EPPlus License (NonCommercial cho mục đích học tập)
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            // CORS
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

            // JWT Authentication Configuration
            var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "nevergonnagiveyouupnevergonnaletyoudown";
            var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "CareerSystemAPI";
            var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "CareerSystemClient";
            var key = Encoding.UTF8.GetBytes(jwtSecret);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "CareerSystem API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });
                c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference("Bearer", document),
                        new List<string>()
                    }
                });
            });
            builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

            var app = builder.Build();

            app.UseMiddleware<CareerSystem.API.Middlewares.ApiExceptionMiddleware>();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "CareerSystem API v1");
                c.RoutePrefix = string.Empty; // Đặt Swagger ngay tại trang chủ domain
            });

            // Tắt HTTPS redirect khi frontend đang gọi http://localhost:5087
            // app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
