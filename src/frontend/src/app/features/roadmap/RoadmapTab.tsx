import { useMemo, useState } from "react";

type CourseStatus = "completed" | "active" | "locked";

type CourseCard = {
  id: string;
  type: "University Course" | "External Platform";
  title: string;
  duration: string;
  subtitle?: string;
  tags: string[];
  required?: boolean;
  status: CourseStatus;
};

type MonthStack = {
  id: string;
  label: string;
  caption: string;
  status: CourseStatus;
  cards: CourseCard[];
};

const initialMonths: MonthStack[] = [
  {
    id: "month-1",
    label: "Month 01",
    caption: "COMPLETED",
    status: "completed",
    cards: [
      {
        id: "cs101",
        type: "University Course",
        title: "Intro to Computer Science (CS101)",
        duration: "8 Weeks",
        subtitle: "Core Prerequisite",
        tags: ["logic", "python"],
        required: true,
        status: "completed",
      },
      {
        id: "web-foundations",
        type: "External Platform",
        title: "Web Foundations (Coursera)",
        duration: "4 Weeks",
        tags: ["html-css", "javascript"],
        status: "completed",
      },
    ],
  },
  {
    id: "month-2",
    label: "Month 02",
    caption: "CURRENT PHASE",
    status: "active",
    cards: [
      {
        id: "dsa201",
        type: "University Course",
        title: "Data Structures (DSA201)",
        duration: "12 Weeks",
        subtitle: "In Progress",
        tags: ["algorithms", "complexity"],
        required: true,
        status: "active",
      },
      {
        id: "db202",
        type: "University Course",
        title: "DBMS (DB202)",
        duration: "10 Weeks",
        tags: ["sql", "normalization"],
        status: "active",
      },
    ],
  },
  {
    id: "month-3",
    label: "Month 03",
    caption: "UPCOMING",
    status: "locked",
    cards: [
      {
        id: "ja301",
        type: "University Course",
        title: "Advanced Java (JA301)",
        duration: "8 Weeks",
        subtitle: "Requires CS101...",
        tags: ["oop", "multi-threading"],
        status: "locked",
      },
    ],
  },
];

export default function RoadmapTab() {
  const [selectedTrack, setSelectedTrack] = useState("Fullstack Developer Track");
  const [isEditing, setIsEditing] = useState(false);
  const [months, setMonths] = useState<MonthStack[]>(initialMonths);

  const allCards = useMemo(
    () => months.flatMap((month) => month.cards),
    [months]
  );

  const completedCards = useMemo(
    () => allCards.filter((card) => card.status === "completed").length,
    [allCards]
  );

  function markCardCompleted(cardId: string) {
    setMonths((prev) =>
      prev.map((month) => ({
        ...month,
        cards: month.cards.map((card) =>
          card.id === cardId ? { ...card, status: "completed" } : card
        ),
      }))
    );
  }

  function handleSave() {
    setIsEditing(false);
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete this roadmap draft?");

    if (!confirmed) {
      return;
    }

    setMonths(initialMonths);
    setIsEditing(false);
  }

  return (
    <div className="w-full space-y-6 bg-[#f8f9ff] text-[#0b1c30]">
      <style>{`
        .roadmap-track-container {
          position: relative;
          width: 100%;
          height: 60px;
          overflow: visible;
        }

        .node-glowing {
          box-shadow: 0 0 15px rgba(0, 107, 95, 0.4);
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0px rgba(0, 107, 95, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 107, 95, 0); }
          100% { box-shadow: 0 0 0 0px rgba(0, 107, 95, 0); }
        }
      `}</style>

      <section className="rounded-xl border border-[#c4c6cf] bg-[#f8f9ff] px-6 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[14px] font-bold leading-5 text-[#002046]">
              Staff Administration Panel - Data Entry Only
            </h1>
            <p className="mt-1 text-[12px] text-[#44474e]">
              Review and maintain the generated career learning roadmap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex items-center gap-2 rounded-lg border border-[#c4c6cf]/70 bg-[#eff4ff] px-4 py-2">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="appearance-none border-0 bg-transparent pr-8 text-[14px] font-semibold leading-5 text-[#0b1c30] outline-none focus:ring-0"
              >
                <option>Fullstack Developer Track</option>
                <option>Backend Developer Track</option>
                <option>Frontend Developer Track</option>
                <option>Data Engineer Track</option>
              </select>

              <span className="material-symbols-outlined pointer-events-none absolute right-3 text-[#44474e]">
                expand_more
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-[#c4c6cf] bg-[#eff4ff] px-4 py-2 text-[14px] font-semibold leading-5 text-[#002046] transition-all hover:bg-[#e5eeff]"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              {isEditing ? "Editing" : "Edit"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-[#006b5f] px-4 py-2 text-[14px] font-semibold leading-5 text-white transition-all hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg p-2 text-[#ba1a1a] transition-all hover:bg-[#ffdad6]/40"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] xl:col-span-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold leading-7 text-[#002046]">
                Learning Velocity
              </h2>
              <p className="text-[14px] leading-5 text-[#44474e]">
                AI Projection vs. Actual Progress (Weeks 1-12)
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#006b5f]" />
                <span className="text-[12px] font-bold uppercase text-[#44474e]">
                  Actual
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="text-[12px] font-bold uppercase text-[#44474e]">
                  AI Target
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-[200px] w-full pt-4">
            <svg
              className="h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 800 200"
            >
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="40" y2="40" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="80" y2="80" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="120" y2="120" />
              <line stroke="#F1F5F9" strokeWidth="1" x1="0" x2="800" y1="160" y2="160" />

              <path
                d="M 0 160 L 100 145 L 200 130 L 300 110 L 400 90 L 500 75 L 600 55 L 700 40 L 800 20"
                fill="none"
                stroke="#1B365D"
                strokeDasharray="4 4"
                strokeOpacity="0.3"
                strokeWidth="2"
              />

              <path
                d="M 0 160 L 100 150 L 200 135 L 300 115 L 400 85 L 450 85"
                fill="none"
                stroke="#006B5F"
                strokeLinecap="round"
                strokeWidth="3"
              />

              <circle cx="450" cy="85" fill="#006B5F" r="4" />
            </svg>

            <div className="mt-2 flex justify-between text-[12px] font-bold leading-4 text-[#44474e]/50">
              <span>Wk 1</span>
              <span>Wk 4</span>
              <span>Wk 8</span>
              <span>Wk 12</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#1b365d] p-6 text-white xl:col-span-4">
          <div className="relative z-10">
            <h3 className="mb-1 text-[14px] font-semibold uppercase leading-5 tracking-widest text-[#6df5e1]">
              Remaining Time
            </h3>

            <div className="flex items-baseline gap-2">
              <span className="text-[56px] font-bold tracking-tighter">42</span>
              <span className="text-xl opacity-60">Days Left</span>
            </div>

            <p className="mt-4 text-[14px] leading-5 text-[#87a0cd]">
              Accelerate now to reach your Q3 milestone target of "Backend Mastery".
            </p>
          </div>

          <div className="relative z-10 mt-6 flex items-center gap-4 rounded-lg bg-white/10 p-4">
            <div className="rounded-full bg-[#006b5f] p-2">
              <span className="material-symbols-outlined text-white">timer</span>
            </div>

            <div>
              <p className="text-[12px] font-bold">Next Session</p>
              <p className="text-[14px] font-semibold leading-5">
                System Design @ 2:00 PM
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[16px] border-white/5" />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] xl:p-12">
        <div className="roadmap-track-container mb-16">
          <svg
            className="w-full"
            height="60"
            preserveAspectRatio="none"
            viewBox="0 0 1000 60"
          >
            <path
              d="M 50 30 L 950 30"
              stroke="#F1F5F9"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M 50 30 L 500 30"
              stroke="#006B5F"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M 500 30 L 950 30"
              stroke="#94A3B8"
              strokeDasharray="8 8"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>

          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full justify-between px-[42px]">
            {months.map((month) => (
              <MilestoneNode key={month.id} month={month} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-16">
          {months.map((month) => (
            <div
              key={month.id}
              className={`space-y-4 ${month.status === "locked" ? "opacity-50" : ""}`}
            >
              {month.cards.map((card) => (
                <RoadmapCourseCard
                  key={card.id}
                  card={card}
                  editable={isEditing}
                  onMarkCompleted={markCardCompleted}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-[#c4c6cf]/30 py-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#006b5f]" />
            <span className="text-[12px] font-bold leading-4 text-[#44474e]">
              Completed Path
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-400" />
            <span className="text-[12px] font-bold leading-4 text-[#44474e]">
              Future Roadmap
            </span>
          </div>
        </div>

        <p className="text-[12px] font-bold italic leading-4 text-[#44474e]">
          Roadmap last optimized by AI Virtual Mentor 2 hours ago. Progress:{" "}
          {completedCards}/{allCards.length} items completed.
        </p>
      </footer>
    </div>
  );
}

function MilestoneNode({ month }: { month: MonthStack }) {
  if (month.status === "completed") {
    return (
      <div className="pointer-events-auto flex flex-col items-center">
        <div className="flex h-14 w-14 transform items-center justify-center rounded-full border-4 border-white bg-[#006b5f] shadow-lg transition hover:scale-110">
          <span className="material-symbols-outlined font-bold text-white">check</span>
        </div>

        <span className="mt-4 text-[14px] font-semibold leading-5 text-[#006b5f]">
          {month.label}
        </span>

        <span className="text-[10px] font-bold uppercase text-[#44474e]">
          {month.caption}
        </span>
      </div>
    );
  }

  if (month.status === "active") {
    return (
      <div className="pointer-events-auto relative flex flex-col items-center">
        <div className="node-glowing flex h-14 w-14 transform items-center justify-center rounded-full border-[3px] border-[#006b5f] bg-white shadow-lg transition hover:scale-110">
          <div className="h-3 w-3 rounded-full bg-[#006b5f]" />
        </div>

        <span className="mt-4 text-[14px] font-semibold leading-5 text-[#002046]">
          {month.label}
        </span>

        <span className="text-[10px] font-bold uppercase text-[#006b5f]">
          {month.caption}
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-dashed border-slate-300 bg-white opacity-60 shadow-sm">
        <span className="material-symbols-outlined text-slate-400">lock</span>
      </div>

      <span className="mt-4 text-[14px] font-semibold leading-5 text-[#44474e] opacity-60">
        {month.label}
      </span>

      <span className="text-[10px] font-bold uppercase text-[#44474e]/40">
        {month.caption}
      </span>
    </div>
  );
}

function RoadmapCourseCard({
  card,
  editable,
  onMarkCompleted,
}: {
  card: CourseCard;
  editable: boolean;
  onMarkCompleted: (id: string) => void;
}) {
  const isLocked = card.status === "locked";
  const isActive = card.status === "active";
  const isCompleted = card.status === "completed";

  if (isLocked) {
    return (
      <div className="group relative rounded-xl border border-dashed border-[#c4c6cf] bg-[#eff4ff] p-5 grayscale">
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded bg-[#002046]/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-white">
            {card.type}
          </span>

          <span className="flex items-center gap-1 text-[12px] font-bold leading-4 text-[#44474e]">
            <span className="material-symbols-outlined text-sm">lock</span>
            Locked
          </span>
        </div>

        <h4 className="mb-1 text-[14px] font-semibold leading-5 text-[#002046]">
          {card.title}
        </h4>

        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-[#dce9ff] px-2 py-0.5 text-[12px] font-bold leading-4 text-[#44474e]">
            {card.duration}
          </span>

          {card.subtitle && (
            <span className="text-[12px] text-[#44474e]/60">
              {card.subtitle}
            </span>
          )}
        </div>

        <TagList tags={card.tags} locked />
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
        isActive
          ? "border-2 border-[#006b5f] bg-white shadow-lg"
          : "border border-[#c4c6cf]/40 bg-[#eff4ff] hover:bg-white hover:shadow-lg"
      }`}
    >
      {isActive && (
        <div className="absolute right-0 top-0 p-2">
          <span className="flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#006b5f] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006b5f]" />
          </span>
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${
            card.type === "University Course"
              ? "bg-[#002046] text-white"
              : "border border-[#ffb95f] text-[#dd8d00]"
          }`}
        >
          {card.type}
        </span>

        {card.required && (
          <span className="flex items-center gap-1 text-[12px] font-bold leading-4 text-[#4e2f00]">
            <span
              className="material-symbols-outlined text-sm"
              style={{
                fontVariationSettings:
                  "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}
            >
              star
            </span>
            Required
          </span>
        )}

        {isCompleted && !card.required && (
          <span className="flex items-center gap-1 text-[12px] font-bold leading-4 text-[#006b5f]">
            <span className="material-symbols-outlined text-sm">check</span>
            Done
          </span>
        )}
      </div>

      <h4 className="mb-1 truncate text-[14px] font-semibold leading-5 text-[#002046]">
        {card.title}
      </h4>

      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-[12px] font-bold leading-4 ${
            isActive
              ? "bg-[#6df5e1] text-[#006f64]"
              : "bg-[#dce9ff] text-[#44474e]"
          }`}
        >
          {card.duration}
        </span>

        {card.subtitle && (
          <span
            className={`text-[12px] ${
              isActive ? "font-bold text-[#006b5f]" : "text-[#44474e]/60"
            }`}
          >
            {card.subtitle}
          </span>
        )}
      </div>

      <TagList tags={card.tags} />

      {editable && !isCompleted && (
        <button
          type="button"
          onClick={() => onMarkCompleted(card.id)}
          className="mt-4 rounded-lg border border-[#006b5f] px-3 py-2 text-[12px] font-bold text-[#006b5f] transition hover:bg-[#006b5f] hover:text-white"
        >
          Mark Completed
        </button>
      )}
    </div>
  );
}

function TagList({
  tags,
  locked = false,
}: {
  tags: string[];
  locked?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`text-[11px] font-bold ${
            locked ? "text-[#44474e]/40" : "text-[#005048]"
          }`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
