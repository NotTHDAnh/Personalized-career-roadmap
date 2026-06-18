using System;
using System.Collections.Generic;
using CareerSystem.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AcademicRecord> AcademicRecords { get; set; }

    public virtual DbSet<CareerRole> CareerRoles { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseLearningOutcome> CourseLearningOutcomes { get; set; }

    public virtual DbSet<GithubProfile> GithubProfiles { get; set; }

    public virtual DbSet<JobTrend> JobTrends { get; set; }

    public virtual DbSet<LearningResource> LearningResources { get; set; }

    public virtual DbSet<MentorSession> MentorSessions { get; set; }

    public virtual DbSet<Repository> Repositories { get; set; }

    public virtual DbSet<Roadmap> Roadmaps { get; set; }

    public virtual DbSet<RolePrerequisite> RolePrerequisites { get; set; }

    public virtual DbSet<Skill> Skills { get; set; }

    public virtual DbSet<SkillNode> SkillNodes { get; set; }

    public virtual DbSet<StudentSkill> StudentSkills { get; set; }

    public virtual DbSet<User> Users { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseSqlServer("Server=localhost,1433;Database=SE_Career_Roadmap;User Id=sa;Password=12345;TrustServerCertificate=True;Encrypt=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AcademicRecord>(entity =>
        {
            entity.HasKey(e => e.RecordId).HasName("PK__Academic__BFCFB4DD69B8DBAC");

            entity.ToTable("Academic_Records");

            entity.Property(e => e.RecordId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("record_id");
            entity.Property(e => e.CourseId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("course_id");
            entity.Property(e => e.ExamAttempts)
                .HasDefaultValue(1)
                .HasColumnName("exam_attempts");
            entity.Property(e => e.Gpa)
                .HasColumnType("decimal(4, 2)")
                .HasColumnName("gpa");
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");

            entity.HasOne(d => d.Course).WithMany(p => p.AcademicRecords)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Academic___cours__7A672E12");

            entity.HasOne(d => d.User).WithMany(p => p.AcademicRecords)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Academic___user___797309D9");
        });

        modelBuilder.Entity<CareerRole>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Career_R__760965CCA7E0CB42");

            entity.ToTable("Career_Roles");

            entity.Property(e => e.RoleId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("role_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.RoleName)
                .HasMaxLength(150)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__Chat_Mes__0BBF6EE6DF99D28C");

            entity.ToTable("Chat_Messages");

            entity.Property(e => e.MessageId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("message_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.Sender)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("sender");
            entity.Property(e => e.SessionId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("session_id");
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("timestamp");

            entity.HasOne(d => d.Session).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__Chat_Mess__sessi__5DCAEF64");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Courses__8F1EF7AE0BD6C45A");

            entity.HasIndex(e => e.CourseCode, "UQ__Courses__AB6B45F1E157BC6A").IsUnique();

            entity.Property(e => e.CourseId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("course_id");
            entity.Property(e => e.CourseCode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("course_code");
            entity.Property(e => e.CourseName)
                .HasMaxLength(255)
                .HasColumnName("course_name");
            entity.Property(e => e.Credits)
                .HasDefaultValue(3)
                .HasColumnName("credits");
            entity.Property(e => e.TotalStudyHours)
                .HasDefaultValue(0)
                .HasColumnName("total_study_hours");
        });

        modelBuilder.Entity<CourseLearningOutcome>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Course_L__3213E83F8069A00E");

            entity.ToTable("Course_Learning_Outcomes");

            entity.Property(e => e.Id)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("id");
            entity.Property(e => e.CourseId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("course_id");
            entity.Property(e => e.OutcomeDescription)
                .HasMaxLength(500)
                .HasColumnName("outcome_description");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseLearningOutcomes)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Course_Le__cours__74AE54BC");

            entity.HasOne(d => d.Skill).WithMany(p => p.CourseLearningOutcomes)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Course_Le__skill__75A278F5");
        });

        modelBuilder.Entity<GithubProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__Github_P__AEBB701FA24A3CC7");

            entity.ToTable("Github_Profiles");

            entity.HasIndex(e => e.PortfolioUrl, "UQ__Github_P__AAB694DC59FB4741").IsUnique();

            entity.HasIndex(e => e.UserId, "UQ__Github_P__B9BE370E6D9515EF").IsUnique();

            entity.Property(e => e.ProfileId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("profile_id");
            entity.Property(e => e.GithubUsername)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("github_username");
            entity.Property(e => e.PortfolioUrl)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("portfolio_url");
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.GithubProfile)
                .HasForeignKey<GithubProfile>(d => d.UserId)
                .HasConstraintName("FK__Github_Pr__user___4E88ABD4");
        });

        modelBuilder.Entity<JobTrend>(entity =>
        {
            entity.HasKey(e => e.TrendId).HasName("PK__Job_Tren__BCB444455554A1E0");

            entity.ToTable("Job_Trends");

            entity.Property(e => e.TrendId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("trend_id");
            entity.Property(e => e.FrequencyCount)
                .HasDefaultValue(0)
                .HasColumnName("frequency_count");
            entity.Property(e => e.Keyword)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("keyword");
            entity.Property(e => e.ScrapeDate).HasColumnName("scrape_date");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");
            entity.Property(e => e.SourcePlatform)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("source_platform");

            entity.HasOne(d => d.Skill).WithMany(p => p.JobTrends)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Job_Trend__skill__5535A963");
        });

        modelBuilder.Entity<LearningResource>(entity =>
        {
            entity.HasKey(e => e.ResourceId).HasName("PK__Learning__4985FC731F485F44");

            entity.ToTable("Learning_Resources");

            entity.Property(e => e.ResourceId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("resource_id");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.Url)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("url");

            entity.HasOne(d => d.Skill).WithMany(p => p.LearningResources)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Learning___skill__49C3F6B7");
        });

        modelBuilder.Entity<MentorSession>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Mentor_S__69B13FDCCAF26001");

            entity.ToTable("Mentor_Sessions");

            entity.Property(e => e.SessionId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("session_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.MentorSessions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Mentor_Se__user___59063A47");
        });

        modelBuilder.Entity<Repository>(entity =>
        {
            entity.HasKey(e => e.RepoId).HasName("PK__Reposito__E2D3BC80D8C97596");

            entity.Property(e => e.RepoId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("repo_id");
            entity.Property(e => e.AiSummary).HasColumnName("ai_summary");
            entity.Property(e => e.ProfileId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("profile_id");
            entity.Property(e => e.RepoName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("repo_name");
            entity.Property(e => e.RepoUrl)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("repo_url");
            entity.Property(e => e.TechStack).HasColumnName("tech_stack");

            entity.HasOne(d => d.Profile).WithMany(p => p.Repositories)
                .HasForeignKey(d => d.ProfileId)
                .HasConstraintName("FK__Repositor__profi__5165187F");
        });

        modelBuilder.Entity<Roadmap>(entity =>
        {
            entity.HasKey(e => e.RoadmapId).HasName("PK__Roadmaps__038C3F1F15E65BAB");

            entity.Property(e => e.RoadmapId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("roadmap_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DailyStudyHours)
                .HasDefaultValue(2.00m)
                .HasColumnType("decimal(4, 2)")
                .HasColumnName("daily_study_hours");
            entity.Property(e => e.ProgressPercent)
                .HasDefaultValue(0.00m)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("progress_percent");
            entity.Property(e => e.TargetRoleId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("target_role_id");
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");

            entity.HasOne(d => d.TargetRole).WithMany(p => p.Roadmaps)
                .HasForeignKey(d => d.TargetRoleId)
                .HasConstraintName("FK__Roadmaps__target__403A8C7D");

            entity.HasOne(d => d.User).WithMany(p => p.Roadmaps)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Roadmaps__user_i__3F466844");
        });

        modelBuilder.Entity<RolePrerequisite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Role_Pre__3213E83F7A66314D");

            entity.ToTable("Role_Prerequisites");

            entity.Property(e => e.Id)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("id");
            entity.Property(e => e.RoleId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("role_id");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePrerequisites)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Role_Prer__role___398D8EEE");

            entity.HasOne(d => d.Skill).WithMany(p => p.RolePrerequisites)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Role_Prer__skill__3A81B327");
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.SkillId).HasName("PK__Skills__FBBA8379B35C66FD");

            entity.HasIndex(e => e.SkillName, "UQ__Skills__73C038AD2B91E4DE").IsUnique();

            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");
            entity.Property(e => e.Category)
                .HasMaxLength(100)
                .HasColumnName("category");
            entity.Property(e => e.SkillName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("skill_name");
        });

        modelBuilder.Entity<SkillNode>(entity =>
        {
            entity.HasKey(e => e.NodeId).HasName("PK__Skill_No__5F19EF16A85D836C");

            entity.ToTable("Skill_Nodes");

            entity.Property(e => e.NodeId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("node_id");
            entity.Property(e => e.CourseId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("course_id");
            entity.Property(e => e.AcademicLevel)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("academic_level");
            entity.Property(e => e.Deadline).HasColumnName("deadline");
            entity.Property(e => e.ParentNodeId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("parent_node_id");
            entity.Property(e => e.RoadmapId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("roadmap_id");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("PENDING")
                .HasColumnName("status");

            entity.HasOne(d => d.Course).WithMany(p => p.SkillNodes)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_SkillNodes_Courses");

            entity.HasOne(d => d.ParentNode).WithMany(p => p.InverseParentNode)
                .HasForeignKey(d => d.ParentNodeId)
                .HasConstraintName("FK__Skill_Nod__paren__46E78A0C");

            entity.HasOne(d => d.Roadmap).WithMany(p => p.SkillNodes)
                .HasForeignKey(d => d.RoadmapId)
                .HasConstraintName("FK__Skill_Nod__roadm__44FF419A");

            entity.HasOne(d => d.Skill).WithMany(p => p.SkillNodes)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Skill_Nod__skill__45F365D3");
        });

        modelBuilder.Entity<StudentSkill>(entity =>
        {
            entity.HasKey(e => e.StudentSkillId).HasName("PK__Student___B6A46F0A13A3AA0D");

            entity.ToTable("Student_Skills");

            entity.Property(e => e.StudentSkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("student_skill_id");
            entity.Property(e => e.SkillId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("skill_id");
            entity.Property(e => e.Source)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("MANUAL")
                .HasColumnName("source");
            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");

            entity.HasOne(d => d.Skill).WithMany(p => p.StudentSkills)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__Student_S__skill__34C8D9D1");

            entity.HasOne(d => d.User).WithMany(p => p.StudentSkills)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Student_S__user___33D4B598");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370F9F071F7C");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E616484D86A8C").IsUnique();

            entity.Property(e => e.UserId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.OauthId)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("oauth_id");
            entity.Property(e => e.OauthProvider)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("LOCAL")
                .HasColumnName("oauth_provider");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("STUDENT")
                .HasColumnName("role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
