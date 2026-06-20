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
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { key: "courseName", label: "Course Name", placeholder: "e.g. Introduction to AI" },
          { key: "courseCode", label: "Course Code", placeholder: "e.g. AI401" },
          { key: "duration", label: "Standard Duration (Weeks)", placeholder: "e.g. 8" },
          { key: "hashtags", label: "Associated Skill Hashtags", placeholder: "#ML, #Python" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
            <Input
              type="text"
              value={form[key as keyof CourseFormData]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="bg-[#1B365D] hover:bg-[#1B365D]/90 text-white font-medium rounded-xl">
        Add Course
      </Button>
    </form>
  );
}