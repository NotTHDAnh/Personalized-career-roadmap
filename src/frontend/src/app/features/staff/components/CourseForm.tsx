import * as React from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import type { CourseFormData } from "@/app/types";

interface CourseFormProps {
  form: CourseFormData;
  setForm: React.Dispatch<React.SetStateAction<CourseFormData>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function CourseForm({ form, setForm, onSubmit }: CourseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {[
        { key: "courseName", label: "Course Name", placeholder: "e.g. Introduction to AI" },
        { key: "courseCode", label: "Course Code", placeholder: "e.g. AI401" },
        { key: "credits", label: "Credits", placeholder: "e.g. 3" },
        { key: "totalStudyHours", label: "Total Study Hours", placeholder: "e.g. 45" },
        { key: "hashtags", label: "Associated Skills (comma separated)", placeholder: "e.g. Python, Machine Learning" },
        { key: "outcomes", label: "Learning Outcomes", placeholder: "e.g. Understand basic ML algorithms" },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">{label}</label>
          <Input
            type="text"
            value={form[key as keyof CourseFormData]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full text-[13px] bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B28CC]"
          />
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="isFoundationalCourse"
          checked={form.isFoundationalCourse}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, isFoundationalCourse: e.target.checked }))}
          className="w-4 h-4 text-[#3B28CC] border-[#E2E8F0] rounded focus:ring-[#3B28CC]"
        />
        <label htmlFor="isFoundationalCourse" className="text-[13px] font-medium text-[#0F172A] cursor-pointer">
          Is Foundational Course?
        </label>
      </div>
      <Button type="submit" className="w-full bg-[#3B28CC] hover:bg-[#3B28CC]/90 text-white font-medium rounded-lg mt-2 h-10">
        Add Course
      </Button>
    </form>
  );
}