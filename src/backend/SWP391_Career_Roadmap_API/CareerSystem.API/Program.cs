
using CareerSystem.API.Data;
using CareerSystem.API.Services.Implementations;
using Microsoft.EntityFrameworkCore;

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

            builder.Services.AddHttpClient<GithubService>();

            // Sử dụng HttpClient mặc định của .NET
            builder.Services.AddHttpClient<CareerSystem.API.Services.Interfaces.IGeminiService,
                CareerSystem.API.Services.Implementations.GeminiService>();

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

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseMiddleware<CareerSystem.API.Middlewares.ApiExceptionMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Tắt HTTPS redirect khi frontend đang gọi http://localhost:5087
            // app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("AllowAll");

            // app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
