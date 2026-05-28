import { useState } from "react";

type CourseRecord = {
  code: string;
  name: string;
  grade: string;
  status: "Completed" | "In Progress";
};

const initialCourses: CourseRecord[] = [
  { code: "PRN212", name: "Basic Cross-Platform Application Programming", grade: "8.4", status: "Completed" },
  { code: "SWP391", name: "Application Development Project", grade: "In progress", status: "In Progress" },
  { code: "SWR302", name: "Software Requirements", grade: "8.0", status: "Completed" },
];

export default function ProfileTab() {
  const [courses, setCourses] = useState<CourseRecord[]>(initialCourses);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(["C#", "React", "SQL Server", "Requirement Analysis"]);

  function addSkill() {
    const value = skillInput.trim();

    if (!value || skills.includes(value)) {
      return;
    }

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((item) => item !== skill));
  }

  function addDemoCourse() {
    setCourses((prev) => [
      ...prev,
      {
        code: "EXE101",
        name: "Startup Project",
        grade: "In progress",
        status: "In Progress",
      },
    ]);
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1b365d] to-[#006b5f]" />

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-10">
            <div className="w-24 h-24 rounded-2xl bg-[#006b5f] text-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold">
              S
            </div>

            <div className="flex-1 pt-2 md:pt-10">
              <h3 className="text-2xl font-bold text-[#002046]">
                Student Profile
              </h3>
              <p className="text-[#44474e]">
                Software Engineering · Year 2 · FPT University
              </p>
            </div>

            <button className="px-5 py-3 rounded-xl bg-[#006b5f] text-white text-sm font-semibold hover:opacity-90">
              Edit Profile
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {[
              ["Current GPA", "8.2"],
              ["Completed Courses", "24"],
              ["Tracked Skills", String(skills.length)],
              ["Roadmap Progress", "41%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#eff4ff] p-4">
                <p className="text-xs uppercase tracking-widest text-[#74777f] font-bold">
                  {label}
                </p>
                <p className="text-2xl font-bold text-[#002046] mt-2">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-8">
        <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm">
          <div className="p-6 border-b border-[#c4c6cf] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#002046]">
                Academic Transcript
              </h3>
              <p className="text-sm text-[#44474e]">
                Manage courses and academic records.
              </p>
            </div>

            <button
              type="button"
              onClick={addDemoCourse}
              className="px-4 py-2 rounded-xl bg-[#006b5f] text-white text-sm font-semibold"
            >
              Add Course
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#eff4ff] text-[#44474e]">
                <tr>
                  <th className="text-left px-6 py-4">Code</th>
                  <th className="text-left px-6 py-4">Course</th>
                  <th className="text-left px-6 py-4">Grade</th>
                  <th className="text-left px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={`${course.code}-${course.name}`} className="border-t border-[#eef2f7]">
                    <td className="px-6 py-4 font-semibold text-[#002046]">
                      {course.code}
                    </td>
                    <td className="px-6 py-4 text-[#44474e]">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#002046]">
                      {course.grade}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          course.status === "Completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#002046]">Current Skills</h3>
          <p className="text-sm text-[#44474e] mt-1">
            Add skills manually before generating advisement.
          </p>

          <div className="flex gap-2 mt-5">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addSkill();
                }
              }}
              placeholder="Add skill"
              className="flex-1 rounded-xl border border-[#c4c6cf] px-4 py-3 outline-none focus:ring-2 focus:ring-[#006b5f]"
            />

            <button
              type="button"
              onClick={addSkill}
              className="rounded-xl bg-[#006b5f] text-white px-4 font-semibold"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => removeSkill(skill)}
                className="px-3 py-2 rounded-full bg-[#eff4ff] text-[#002046] text-sm font-semibold hover:bg-red-50 hover:text-red-700"
              >
                {skill} ×
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}