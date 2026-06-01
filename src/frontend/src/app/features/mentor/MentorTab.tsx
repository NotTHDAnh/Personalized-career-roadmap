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

type GenerateRoadmapResponse = {
  message?: string;
  roadmapId?: string;
};

type RoadmapPreview = Record<string, unknown>; //type cho roadmap review

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

  const [targetRole, setTargetRole] = useState<{
    id?: string;
    name: string;
  } | null>(null);

  const [creatingRoadmap, setCreatingRoadmap] = useState(false);
  const [roadmapPreview, setRoadmapPreview] = useState<RoadmapPreview | null>(null);
  const [showRoadmapPreview, setShowRoadmapPreview] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  const [recommendedCareers, setRecommendedCareers] = useState<string[]>([]);

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

      if (mentorResponse.targetRoleName) {
        setTargetRole({
          id: mentorResponse.targetRoleId,
          name: mentorResponse.targetRoleName,
        });
      }

      if (mentorResponse.recommendedCareers?.length) {
        setRecommendedCareers(mentorResponse.recommendedCareers);
      }

      if (mentorResponse.targetRoleName) {
        setTargetRole({
          id: mentorResponse.targetRoleId,
          name: mentorResponse.targetRoleName,
        });
      }

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

  // async function handleCreateRoadmapClick() {
  //   if (!targetRole || creatingRoadmap) return;

  //   if (!targetRole.id) {
  //     const errorMsg: Message = {
  //       id: Date.now(),
  //       role: "ai",
  //       content:
  //         "I detected your target role, but I could not find its targetRoleId. Please ask AI Mentor with a clearer target career role before creating a roadmap.",
  //     };

  //     setMessages((prev) => [...prev, errorMsg]);
  //     return;
  //   }

  //   setCreatingRoadmap(true);

  //   try {
  //     await apiClient.post("/Roadmap/generate-personalized", {
  //       userId,
  //       targetRoleId: targetRole.id,
  //       dailyStudyHours: 2,
  //     });

  //     const successMsg: Message = {
  //       id: Date.now(),
  //       role: "ai",
  //       content: `Roadmap for ${targetRole.name} has been created successfully.`,
  //     };

  //     setMessages((prev) => [...prev, successMsg]);
  //   } catch {
  //     const errorMsg: Message = {
  //       id: Date.now(),
  //       role: "ai",
  //       content:
  //         "Failed to create roadmap. Please make sure the backend is running and try again.",
  //     };

  //     setMessages((prev) => [...prev, errorMsg]);
  //   } finally {
  //     setCreatingRoadmap(false);
  //   }
  // }

  async function handleCreateRoadmapClick() {
    if (!targetRole || creatingRoadmap) return;

    if (!targetRole.id) {
      const errorMsg: Message = {
        id: Date.now(),
        role: "ai",
        content:
          "I detected your target role, but I could not find its targetRoleId. Please ask AI Mentor with a clearer target career role before creating a roadmap.",
      };

      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setCreatingRoadmap(true);

    try {
      const generatedResult = await apiClient.post<GenerateRoadmapResponse>(
        "/Roadmap/generate-personalized",
        {
          userId,
          targetRoleId: targetRole.id,
          dailyStudyHours: 2,
        }
      );

      if (!generatedResult.roadmapId) {
        throw new Error("Roadmap was created but roadmapId was not returned.");
      }

      const roadmapDetail = await apiClient.get<RoadmapPreview>(
        `/Roadmap/${generatedResult.roadmapId}`
      );

      setRoadmapPreview(roadmapDetail);

      // setRoadmapPreview(generatedRoadmap);
      setShowRoadmapPreview(true);
      setPreviewCollapsed(false);

      const successMsg: Message = {
        id: Date.now(),
        role: "ai",
        content: `I created a roadmap for ${targetRole.name}. Please review the roadmap preview below, then choose Save or Cancel.`,
      };

      setMessages((prev) => [...prev, successMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now(),
        role: "ai",
        content:
          "Failed to create roadmap. Please make sure the backend service is running, then try again.",
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setCreatingRoadmap(false);
    }
  }

  function handleSaveRoadmapClick() {
    const successMsg: Message = {
      id: Date.now(),
      role: "ai",
      content: "Roadmap has been saved successfully.",
    };

    setMessages((prev) => [...prev, successMsg]);
    setShowRoadmapPreview(false);
  }

  function handleCancelRoadmapClick() {
    setShowRoadmapPreview(false);
    setPreviewCollapsed(false);

    const cancelMsg: Message = {
      id: Date.now(),
      role: "ai",
      content: "Roadmap preview has been cancelled.",
    };

    setMessages((prev) => [...prev, cancelMsg]);
  }

  function handleChooseRecommendedCareer(career: string) {
    const confirmPrompt = `I choose ${career} as my target career role. Please confirm this target role and return its targetRoleId for roadmap generation.`;

    void send(confirmPrompt);
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
          {recommendedCareers.length > 0 && (
            <div className="mb-4 rounded-2xl border border-[#c4c6cf] bg-white p-4">
              <p className="text-sm font-semibold text-[#002046]">
                Choose one career to create your roadmap:
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedCareers.map((career) => (
                  <button
                    key={career}
                    type="button"
                    onClick={() => handleChooseRecommendedCareer(career)}
                    disabled={typing}
                    className="rounded-full border border-[#006b5f] px-4 py-2 text-sm font-semibold text-[#006b5f] transition hover:bg-[#f0fffb] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Use {career}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              onClick={() => void handleCreateRoadmapClick()}
              disabled={!targetRole || typing || creatingRoadmap}
              title={
                targetRole
                  ? `Create roadmap for ${targetRole.name}`
                  : "Ask AI Mentor about a target career role first"
              }
              className="rounded-xl border border-[#006b5f] px-5 font-semibold text-[#006b5f] transition hover:bg-[#f0fffb] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creatingRoadmap ? "Creating..." : "Create Roadmap"}
            </button>

            <button
              type="button"
              onClick={() => void send(input)}
              disabled={!input.trim() || typing}
              className="rounded-xl bg-[#006b5f] text-white px-5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {showRoadmapPreview && roadmapPreview && (
            <div className="mt-4 rounded-2xl border border-[#b7d8d2] bg-[#f0fffb] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#006b5f]">
                    Roadmap Preview
                  </p>
                  <h4 className="mt-1 text-base font-bold text-[#002046]">
                    {targetRole ? `Generated roadmap for ${targetRole.name}` : "Generated roadmap"}
                  </h4>
                  <p className="mt-1 text-sm text-[#44474e]">
                    Review the generated roadmap before confirming your choice.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewCollapsed((prev) => !prev)}
                  className="rounded-xl border border-[#006b5f] px-4 py-2 text-sm font-semibold text-[#006b5f] hover:bg-white"
                >
                  {previewCollapsed ? "Show" : "Hide"}
                </button>
              </div>

              {!previewCollapsed && (
                <div className="mt-4 max-h-72 overflow-y-auto rounded-xl bg-white p-4 text-sm text-[#0b1c30]">
                  <pre className="whitespace-pre-wrap break-words font-sans">
                    {JSON.stringify(roadmapPreview, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelRoadmapClick}
                  className="rounded-xl border border-[#c4c6cf] px-5 py-2 text-sm font-semibold text-[#44474e] hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveRoadmapClick}
                  className="rounded-xl bg-[#006b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00544b]"
                >
                  Save Roadmap
                </button>
              </div>
            </div>
          )}
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
