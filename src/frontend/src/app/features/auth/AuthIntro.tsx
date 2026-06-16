import { COLORS } from "../../../shared/constants/colors";
import { GraduationCap, Check } from "lucide-react";
import { BookOpen } from "lucide-react";

export default function AuthIntro() {
  return (
    <section
      className="md:w-1/2 p-10 md:p-16 flex flex-col justify-between text-white relative overflow-hidden"
      style={{ background: COLORS.BLUE_PRIMARY }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgba(27,54,93,1) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(0,107,95,0.3) 0, transparent 50%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <GraduationCap size={36} style={{ color: COLORS.MINT_ACCENT }} />
          <h1 className="text-xl font-semibold tracking-tight">
            Smart Career Roadmap
          </h1>
        </div>

        <div className="space-y-8">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Empowering Your Academic Journey to Professional Success
          </h2>
          <p className="text-lg leading-7 text-white/80 max-w-md">
            Navigate the complexities of the modern job market with an AI-driven
            companion tailored to your unique academic profile.
          </p>

          <ul className="space-y-6 mt-10">
            {[
              {
                title: "Personalized pathways",
                desc: "Customized course suggestions based on your career goals.",
              },
              {
                title: "AI-driven guidance",
                desc: "Virtual mentoring for resume building and interview prep.",
              },
              {
                title: "Job market alignment",
                desc: "Real-time data on industry trends and required skillsets.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <div
                  className="mt-1 rounded-full p-1 flex items-center justify-center"
                  style={{ background: COLORS.TEAL_DARK }}
                >
                  <Check size={16} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <span className="text-sm font-semibold block">
                    {item.title}
                  </span>
                  <span className="text-sm leading-5 text-white/70">
                    {item.desc}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60 font-bold">
            University Portal
          </p>
          <p className="text-sm font-semibold">
            Institutional Career Services
          </p>
        </div>
      </div>
    </section>
  );
}