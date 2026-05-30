import React, { useState, useRef, useEffect } from "react";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import type { Message } from "../../types";
import { AI_PROMPTS } from "../../data/mockData";
import { getAIResponse } from "../../services/mockAi";

export function MentorTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content:
        "Hello, Nguyen Van An 👋 I am your AI Academic Mentor. I have reviewed your transcript and career goals. Ask me anything about your courses, career path, or study strategies — I am here to help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: getAIResponse(text),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1100);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
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
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-[#006b5f] text-white rounded-br-sm"
                    : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
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
              onClick={() => send(input)}
              className="rounded-xl bg-[#006b5f] text-white px-5 font-semibold"
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
