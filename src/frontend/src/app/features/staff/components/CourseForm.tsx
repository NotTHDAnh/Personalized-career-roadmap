export function CourseForm({ form, setForm, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { key: "courseName", label: "Course Name", placeholder: "e.g. Introduction to AI" },
          { key: "courseCode", label: "Course Code", placeholder: "e.g. AI401" },
          { key: "duration", label: "Standard Duration (Weeks)", placeholder: "e.g. 8" },
          { key: "hashtags", label: "Associated Skill Hashtags", placeholder: "#ML, #Python" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
            <input
              type="text"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 rounded-lg border text-sm text-gray-800 focus:outline-none focus:ring-1"
              style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
            />
          </div>
        ))}
      </div>
      <button type="submit" className="px-6 py-2.5 rounded-xl text-white text-sm transition-opacity hover:opacity-90" style={{ background: "#1B365D", fontWeight: 500 }}>
        Add Course
      </button>
    </form>
  );
}