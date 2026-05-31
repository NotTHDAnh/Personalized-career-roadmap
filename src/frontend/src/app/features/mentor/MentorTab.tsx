// import React, { useState, useRef, useEffect } from "react";
// import {
//   GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
//   AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
//   CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
//   Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
//   FileText, ChevronRight, User, Settings, Star
// } from "lucide-react";
// import type { Message } from "../../types";
// import { AI_PROMPTS } from "../../data/mockData";
// import { getAIResponse } from "../../services/mockAi";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Message } from "../../types";
import { apiClient } from "../../../shared/api/apiClient";

type CurrentUser = {
  userId?: string;
  email?: string;
  fullName?: string;
  role?: string;
};

type MentorAskResponse = {
  targetRoleId?: string;
  targetRoleName?: string;
  followUpQuestion?: string;
  answer?: string;
  recommendedCareers?: string[];
  missingSkills?: string[];
};

function getCurrentUser(): CurrentUser | null {
  try {
    const rawUser = localStorage.getItem("currentUser");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser) as CurrentUser;
  } catch {
    return null;
  }
}

function formatMentorResponse(response: MentorAskResponse) {
  return [
    response.answer || "The AI Mentor couldn't find an appropriate answer. Please try asking your question more clearly.",

    response.targetRoleName
      ? `Target Role:\n${response.targetRoleName}`
      : "",

    response.recommendedCareers?.length
      ? `Recommended Careers:\n- ${response.recommendedCareers.join("\n- ")}`
      : "",

    response.missingSkills?.length
      ? `Missing Skills:\n- ${response.missingSkills.join("\n- ")}`
      : "",

    response.followUpQuestion
      ? `Follow-up Question:\n${response.followUpQuestion}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function askMentor(message: string, userId: string): Promise<MentorAskResponse> {
  const response = await apiClient.post<MentorAskResponse>("/mentor/ask", {
    userId,
    question: message,
    message,
  });

  return response;
}

// export function MentorTab() {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 0,
//       role: "ai",
//       content:
//         "Hello, Nguyen Van An 👋 I am your AI Academic Mentor. I have reviewed your transcript and career goals. Ask me anything about your courses, career path, or study strategies — I am here to help.",
//     },
//   ]);

export function MentorTab() {
  const currentUser = getCurrentUser();
  const studentName = currentUser?.fullName || "student";
  const userId = currentUser?.userId || "student-001";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content: `Hello, ${studentName} 👋 I am your AI Academic Mentor. I can help you analyze career direction, skill gaps, and personalized learning roadmap based on your academic profile.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // function send(text: string) {
  async function send(text: string) {
    // if (!text.trim()) return;
    // const userMsg: Message = { id: Date.now(), role: "user", content: text.trim() };
    // setMessages((prev) => [...prev, userMsg]);
    // setInput("");
    // setTyping(true);
    const trimmedText = text.trim();

    if (!trimmedText || typing) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    //   setTimeout(() => {
    //     const aiMsg: Message = {
    //       id: Date.now() + 1,
    //       role: "ai",
    //       content: getAIResponse(text),
    //     };
    //     setMessages((prev) => [...prev, aiMsg]);
    //     setTyping(false);
    //   }, 1100);
    // }

    try {
      const mentorResponse = await askMentor(trimmedText, userId);

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: formatMentorResponse(mentorResponse),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content:
          "AI Mentor is currently unavailable. Please make sure the backend service is running, then try again.",
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setTyping(false);
    }
  }

  // function handleKeyDown(e: React.KeyboardEvent) {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     send(input);
  //   }
  // }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="grid xl:grid-cols-[0.72fr_0.28fr] gap-8">
      <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm min-h-[680px] flex flex-col">
        <div className="p-6 border-b border-[#c4c6cf]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#74777f]">
            AI Virtual Mentor
          </p>
          <h3 className="text-2xl font-bold text-[#002046] mt-2">
            Career Advisement Chat
          </h3>
          <p className="text-sm text-[#44474e] mt-1">
            Ask questions about your career direction, skill gaps and learning path.
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-6 whitespace-pre-line ${message.role === "user"
                  ? "bg-[#006b5f] text-white rounded-br-sm"
                  : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-sm"
                  }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-[#eff4ff] px-5 py-4 text-sm text-[#0b1c30]">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f] [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f] [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-6 border-t border-[#c4c6cf]">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e);
              }}
              placeholder="Ask about career direction..."
              className="flex-1 rounded-xl border border-[#c4c6cf] px-4 py-3 outline-none focus:ring-2 focus:ring-[#006b5f]"
            />

            <button
              type="button"
              onClick={() => void send(input)}
              disabled={!input.trim() || typing}
              className="rounded-xl bg-[#006b5f] text-white px-5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm p-6">
          <h4 className="font-bold text-[#002046]">Suggested Prompts</h4>

          <div className="mt-4 space-y-3">
            {[
              "Which career path fits my profile?",
              "What skills am I missing for Backend Developer?",
              "Generate a study plan for next semester.",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                disabled={typing}
                className="w-full text-left rounded-xl bg-[#eff4ff] p-4 text-sm text-[#44474e] hover:bg-[#dce9ff]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1b365d] rounded-2xl shadow-sm p-6 text-white">
          <p className="text-xs uppercase tracking-widest text-white/60 font-bold">
            Advisement Status
          </p>
          <h4 className="text-xl font-bold mt-2">Profile Ready</h4>
          <p className="text-sm text-white/70 mt-2">
            Your academic profile is ready for basic AI advisement.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ─── SCREEN 2: STUDENT DASHBOARD ─────────────────────────────────────────────
