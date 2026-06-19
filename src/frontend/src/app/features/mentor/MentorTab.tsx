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

import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Message, MentorAskResponse, GenerateRoadmapResponse, RoadmapPreview } from "@/app/types";
import { apiClient } from "@/shared/api/apiClient";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useNotification } from "@/shared/contexts/NotificationContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Loader2 } from "lucide-react";
import RoadmapTimeline from "./components/RoadmapTimeline";
import MentorChatSection from "./components/MentorChatSection";
import MentorSidebar from "./components/MentorSidebar";

function formatMentorResponse(response: MentorAskResponse) {
  return [
    response.answer || "The AI Mentor couldn't find an appropriate answer. Please try asking your question more clearly.",

    response.targetRoleName
      ? `**Target Role:**\n${response.targetRoleName}`
      : "",

    response.recommendedCareers?.length
      ? `**Recommended Careers:**\n- ${response.recommendedCareers.join("\n- ")}`
      : "",

    response.missingSkills?.length
      ? `**Missing Skills:**\n- ${response.missingSkills.join("\n- ")}`
      : "",

    response.followUpQuestion
      ? `**Follow-up Question:**\n${response.followUpQuestion}`
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
  const { user } = useAuth();
  const { openNotification } = useNotification();
  const studentName = user?.fullName || "student";
  const userId = user?.userId || "student-001";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content: `Xin chào, ${studentName} 👋 Tôi là Cố vấn Học tập AI của bạn. Tôi có thể giúp bạn phân tích định hướng nghề nghiệp, xác định những kỹ năng còn thiếu và xây dựng lộ trình học tập cá nhân hóa dựa trên hồ sơ học tập của bạn.`,
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, typing]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
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

      // INTERCEPT SYSTEM ERROR: Stop backend Vietnamese fallbacks from executing into a message bubble
      if (mentorResponse.answer?.includes("Hệ thống cố vấn") || !mentorResponse.answer) {
        openNotification("error", "AI Mentor is currently unavailable.");
        setTyping(false);
        return;
      }

      if (mentorResponse.targetRoleName) {
        setTargetRole({
          id: mentorResponse.targetRoleId,
          name: mentorResponse.targetRoleName,
        });
      }

      if (mentorResponse.recommendedCareers?.length) {
        setRecommendedCareers(mentorResponse.recommendedCareers);
      }

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: formatMentorResponse(mentorResponse),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      openNotification(
        "error",
        "AI Mentor is currently unavailable."
      );
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

  async function handleCreateRoadmapClick() {
    if (!targetRole || creatingRoadmap) return;

    if (!targetRole.id) {
      openNotification(
        "warning",
        "Please clarify your target career role first."
      );
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

      // THÊM: Hiện thông báo thành công ngắn gọn như trong ảnh mẫu bạn gửi
      openNotification("success", "Roadmap generated successfully!");
    } catch {
      openNotification(
        "error",
        "Failed to create roadmap."
      );
    } finally {
      setCreatingRoadmap(false);
    }
  }

  function handleSaveRoadmapClick() {
    openNotification("success", "Saved successfully.");
    setShowRoadmapPreview(false);
  }

  function handleCancelRoadmapClick() {
    setShowRoadmapPreview(false);
    setPreviewCollapsed(false);

    openNotification("info", "Preview cancelled.");
  }

  function handleChooseRecommendedCareer(career: string) {
    const confirmPrompt = `I choose ${career} as my target career role. Please confirm this target role and return its targetRoleId for roadmap generation.`;

    void send(confirmPrompt);
  }

  return (
    // <div className="grid xl:grid-cols-[0.72fr_0.28fr] gap-8">
    //   <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm min-h-[680px] flex flex-col">
    <div className="grid min-h-0 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <MentorChatSection
        messages={messages}
        input={input}
        setInput={setInput}
        typing={typing}
        creatingRoadmap={creatingRoadmap}
        targetRole={targetRole}
        recommendedCareers={recommendedCareers}
        messagesContainerRef={messagesContainerRef}
        onSend={send}
        onKeyDown={handleKeyDown}
        onCreateRoadmap={handleCreateRoadmapClick}
        onChooseCareer={handleChooseRecommendedCareer}
      />

      <MentorSidebar
        targetRole={targetRole}
        showRoadmapPreview={showRoadmapPreview}
        roadmapPreview={roadmapPreview}
        previewCollapsed={previewCollapsed}
        setPreviewCollapsed={setPreviewCollapsed}
        typing={typing}
        setInput={setInput}
        onCancelRoadmap={handleCancelRoadmapClick}
        onSaveRoadmap={handleSaveRoadmapClick}
      />
    </div>
  );
}