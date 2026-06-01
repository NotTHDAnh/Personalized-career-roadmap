
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

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IRoadmapService,
                CareerSystem.API.Services.Implementations.RoadmapService>();

            builder.Services.AddScoped<CareerSystem.API.Services.Interfaces.IMentorService,
                CareerSystem.API.Services.Implementations.MentorService>();

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
