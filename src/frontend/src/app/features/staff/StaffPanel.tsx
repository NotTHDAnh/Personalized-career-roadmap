import { useState } from "react";

type StaffPanelProps = {
  onLogout?: () => void;
};

type StaffTab = "courses" | "skills" | "roles";

export default function StaffPanel({ onLogout }: StaffPanelProps) {
  const [activeTab, setActiveTab] = useState<StaffTab>("courses");
  const [courseName, setCourseName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [roleName, setRoleName] = useState("");

  const [courses, setCourses] = useState(["SWP391 - Application Development Project", "PRN212 - Cross-Platform Programming"]);
  const [skills, setSkills] = useState(["React", "ASP.NET Core", "SQL Server"]);
  const [roles, setRoles] = useState(["Backend Developer", "Frontend Developer", "Fullstack Developer"]);

  function addCourse() {
    const value = courseName.trim();

    if (!value) {
      return;
    }

    setCourses((prev) => [...prev, value]);
    setCourseName("");
  }

  function addSkill() {
    const value = skillName.trim();

    if (!value) {
      return;
    }

    setSkills((prev) => [...prev, value]);
    setSkillName("");
  }

  function addRole() {
    const value = roleName.trim();

    if (!value) {
      return;
    }

    setRoles((prev) => [...prev, value]);
    setRoleName("");
  }

  const tabs: Array<{ key: StaffTab; label: string; icon: string }> = [
    { key: "courses", label: "Courses", icon: "menu_book" },
    { key: "skills", label: "Skills", icon: "psychology" },
    { key: "roles", label: "Career Roles", icon: "work" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="bg-[#1b365d] text-white px-6 md:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#71f8e4] text-3xl">
            admin_panel_settings
          </span>
          <div>
            <h1 className="text-xl font-bold">Staff Administration Panel</h1>
            <p className="text-sm text-white/60">Data Entry Only</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold"
        >
          Logout
        </button>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#74777f]">
            System Data Management
          </p>
          <h2 className="text-3xl font-bold text-[#002046] mt-2">
            Manage Academic and Career Data
          </h2>
          <p className="text-[#44474e] mt-2 max-w-2xl">
            Maintain course list, skill taxonomy, and career role prerequisites.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-[#006b5f] text-white"
                    : "bg-[#eff4ff] text-[#002046]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 bg-white rounded-2xl border border-[#c4c6cf] shadow-sm p-6">
          {activeTab === "courses" && (
            <DataEntrySection
              title="Course Management"
              description="Add and review courses used for profile and roadmap generation."
              inputValue={courseName}
              setInputValue={setCourseName}
              placeholder="Example: SWR302 - Software Requirements"
              onAdd={addCourse}
              items={courses}
            />
          )}

          {activeTab === "skills" && (
            <DataEntrySection
              title="Skill Taxonomy"
              description="Add technical skills mapped to courses and career roles."
              inputValue={skillName}
              setInputValue={setSkillName}
              placeholder="Example: Entity Framework Core"
              onAdd={addSkill}
              items={skills}
            />
          )}

          {activeTab === "roles" && (
            <DataEntrySection
              title="Career Role Management"
              description="Add career targets available for job advisement and roadmap generation."
              inputValue={roleName}
              setInputValue={setRoleName}
              placeholder="Example: DevOps Engineer"
              onAdd={addRole}
              items={roles}
            />
          )}
        </section>
      </main>
    </div>
  );
}

type DataEntrySectionProps = {
  title: string;
  description: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  placeholder: string;
  onAdd: () => void;
  items: string[];
};

function DataEntrySection({
  title,
  description,
  inputValue,
  setInputValue,
  placeholder,
  onAdd,
  items,
}: DataEntrySectionProps) {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h3 className="text-xl font-bold text-[#002046]">{title}</h3>
          <p className="text-sm text-[#44474e] mt-1">{description}</p>
        </div>

        <div className="flex gap-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAdd();
              }
            }}
            placeholder={placeholder}
            className="w-72 max-w-full rounded-xl border border-[#c4c6cf] px-4 py-3 outline-none focus:ring-2 focus:ring-[#006b5f]"
          />

          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-[#006b5f] text-white px-5 py-3 text-sm font-semibold"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#c4c6cf] overflow-hidden">
        {items.map((item) => (
          <div
            key={item}
            className="px-5 py-4 border-b last:border-b-0 border-[#eef2f7] flex items-center justify-between"
          >
            <span className="font-semibold text-[#002046]">{item}</span>
            <button className="text-sm font-semibold text-[#006b5f]">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
