import { GraduationCap } from "lucide-react";

export default function AuthIntro() {
  return (
    <section
      className="md:w-[45%] p-6 md:px-10 md:py-8 flex flex-col justify-center text-white relative overflow-hidden shrink-0 transition-colors duration-300 bg-[#0B1528]"
    >
      <div className="relative z-10 flex flex-col my-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap size={28} className="text-[#00E5B5]" />
          <h1 className="text-lg font-bold tracking-tight text-white">
            DevRoadmap
          </h1>
        </div>

        {/* Hero Text */}
        <div className="space-y-2 mb-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Master your career path with AI-driven roadmaps.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#94A3B8] max-w-[420px]">
            Navigate the complexities of the modern tech landscape with a companion tailored to your unique skills and goals.
          </p>
        </div>

        {/* Feature List */}
        <ul className="space-y-3 mb-6">
          {[
            {
              title: "Personalized Pathways",
              desc: "Customized skill progression based on your target roles.",
            },
            {
              title: "Skill Gap Analysis",
              desc: "Identify exactly what you need to learn to land the job.",
            },
            {
              title: "Industry Alignment",
              desc: "Real-time mapping to current job market demands.",
            },
          ].map((item, i) => {
            const icons = [
              <svg key={1} className="w-5 h-5 text-[#00E5B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
              <svg key={2} className="w-5 h-5 text-[#00E5B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
              <svg key={3} className="w-5 h-5 text-[#00E5B5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            ];

            return (
              <li key={item.title} className="flex items-start gap-5">
                <div className="mt-0.5 w-8 h-8 shrink-0 rounded-full bg-[#132B40] flex items-center justify-center border border-[#1E3A5F]">
                   {icons[i]}
                </div>
                <div>
                  <span className="text-[14px] font-semibold text-white block mb-0.5">
                    {item.title}
                  </span>
                  <span className="text-[13px] leading-snug text-[#94A3B8]">
                    {item.desc}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#1E3A5F]">
          <p className="text-[12px] text-[#64748B]">
            Secured enterprise environment. Authorized access only.
          </p>
        </div>
      </div>
    </section>
  );
}