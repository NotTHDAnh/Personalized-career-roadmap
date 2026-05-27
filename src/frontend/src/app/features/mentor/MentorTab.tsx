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
    <div className="flex gap-5 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Suggested prompts sidebar */}
      <div className="w-52 shrink-0 hidden xl:flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Suggested Questions
        </p>
        {AI_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => send(p.text)}
            className="text-left p-3 rounded-xl border border-slate-100 bg-white text-xs text-slate-600 font-medium hover:border-teal-300 hover:bg-teal-50/40 hover:text-teal-700 transition-all shadow-sm leading-relaxed"
          >
            <span className="block text-base mb-1">{p.emoji}</span>
            {p.text}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#1B365D" }}
          >
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold" style={{ color: "#1B365D" }}>
              AI Virtual Mentor
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] text-slate-400 font-medium">Online · Analyzing your profile</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "ai" ? "text-white" : "text-white"
                }`}
                style={{ backgroundColor: msg.role === "ai" ? "#1B365D" : "#0D9488" }}
              >
                {msg.role === "ai" ? <Bot size={13} /> : "NA"}
              </div>
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium whitespace-pre-line ${
                  msg.role === "user"
                    ? "text-white rounded-tr-sm"
                    : "text-slate-700 border border-slate-100 rounded-tl-sm"
                }`}
                style={{
                  backgroundColor: msg.role === "user" ? "#0D9488" : "#F8FAFC",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "#1B365D" }}
              >
                <Bot size={13} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Prompt suggestions (mobile) */}
        <div className="xl:hidden flex gap-2 px-5 py-2 overflow-x-auto border-t border-slate-50">
          {AI_PROMPTS.slice(0, 4).map((p, i) => (
            <button
              key={i}
              onClick={() => send(p.text)}
              className="shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all whitespace-nowrap"
            >
              {p.emoji} {p.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI mentor anything about courses, careers, or study strategies…"
              rows={1}
              className="flex-1 resize-none text-xs rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder:text-slate-300 leading-relaxed bg-slate-50"
              style={{ maxHeight: 100 }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
              style={{ backgroundColor: "#0D9488" }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-slate-300 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: STUDENT DASHBOARD ─────────────────────────────────────────────
