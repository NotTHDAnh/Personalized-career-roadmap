import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

const BLUE = "#1B365D";
const TEAL = "#0D9488";

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Hello! I'm your AI Academic & Career Tutor. I can help you plan your learning roadmap, identify skill gaps based on your academic progress, and answer questions about career paths in technology. How can I assist you today?",
  },
  {
    id: 2,
    role: "user",
    text: "I'm currently taking Advanced Java Programming and Database Management Systems. What should I focus on next to become a backend developer?",
  },
  {
    id: 3,
    role: "ai",
    text: "Great foundation choices! For a backend development career path, here's what I'd recommend after your current courses:\n\n1. **Data Structures & Algorithms (DSA201)** — Essential for technical interviews and writing efficient code. This pairs directly with your Java skills.\n\n2. **API Design & REST Principles** — Once you have strong Java and database knowledge, learning to build RESTful services is a natural next step.\n\n3. **Cloud Fundamentals** — AWS or Azure basics are in very high demand right now (2,450 job postings in Cloud Computing).\n\nWould you like me to help you map out a specific timeline for these courses on your roadmap?",
  },
  {
    id: 4,
    role: "user",
    text: "Yes, can you suggest a month-by-month plan?",
  },
  {
    id: 5,
    role: "ai",
    text: "Absolutely! Based on your current progress (36 weeks completed, GPA 3.85), here's a suggested 3-month plan:\n\n**Month 1** — Complete Advanced Java Programming (JA301). Focus on OOP design patterns and multithreading.\n\n**Month 2** — Take Data Structures & Algorithms (DSA201). Apply Java to implement core data structures. Simultaneously continue Database Management Systems (DB202).\n\n**Month 3** — Begin a Cloud Fundamentals module (recommend AWS Cloud Practitioner as a starting point). This slots in naturally after your backend core.\n\nThis plan aligns well with the job market trends showing #Microservices and #AWS_Cloud as the highest-frequency skills. Shall I break down any of these months in more detail?",
  },
];

const AI_RESPONSES = [
  "That's a great question. Based on your academic profile, I'd suggest prioritising courses that build on your existing #OOP and #SQL skills. Data Structures & Algorithms is a strong next step.",
  "Looking at the current job market trends, #Microservices and #AWS_Cloud are rated 'High' frequency. Courses that introduce cloud infrastructure would significantly strengthen your profile.",
  "Your GPA of 3.85 is excellent. I'd recommend maintaining that momentum by pacing yourself — taking no more than two intensive courses simultaneously.",
  "For career preparation, I'd suggest your roadmap includes at least one external platform course (like Coursera or edX) to supplement university courses with industry-recognised certifications.",
];

export default function AIMentor() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiText = AI_RESPONSES[responseIndex.current % AI_RESPONSES.length];
      responseIndex.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: aiText },
      ]);
      setIsTyping(false);
    }, 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#F1F5F9" }}>
      {/* Header */}
      <div
        className="px-8 py-5 border-b border-gray-200 flex items-center gap-4"
        style={{ background: "#fff" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: BLUE }}
        >
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900" style={{ fontWeight: 600, fontSize: "1rem" }}>
            AI Academic &amp; Career Tutor
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-xs text-gray-400">Active · Personalised to your academic profile</p>
          </div>
        </div>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            {msg.role === "ai" ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end"
                style={{ background: BLUE }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end text-white text-xs"
                style={{ background: TEAL, fontWeight: 600 }}
              >
                N
              </div>
            )}

            {/* Bubble */}
            <div
              className="max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "ai"
                  ? {
                      background: "#fff",
                      color: "#1E293B",
                      border: "1px solid #E2E8F0",
                      borderBottomLeftRadius: "4px",
                      whiteSpace: "pre-wrap",
                    }
                  : {
                      background: BLUE,
                      color: "#fff",
                      borderBottomRightRadius: "4px",
                    }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end"
              style={{ background: BLUE }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderBottomLeftRadius: "4px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    background: "#94A3B8",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-8 py-4 border-t border-gray-200"
        style={{ background: "#fff" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: "#CBD5E1", background: "#F8FAFC" }}
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your learning roadmap, career path, or skill development…"
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ background: BLUE }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
