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
import { ApiKeyModal } from "@/app/components/common/ApiKeyModal";
import { deleteApiKey, getApiKeyStatus } from "@/app/services/apiKeyApi";
import type { ApiKeyStatus } from "@/app/services/apiKeyApi";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useNotification } from "@/shared/contexts/NotificationContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Loader2 } from "lucide-react";
import RoadmapTimeline from "./components/RoadmapTimeline";
import MentorChatSection from "./components/MentorChatSection";
import MentorSidebar from "./components/MentorSidebar";

function formatMentorResponse(response: any) {
  const answer = response.answer || response.Answer;
  const targetRoleName = response.targetRoleName || response.TargetRoleName;
  const recommendedCareers = response.recommendedCareers || response.RecommendedCareers;
  const missingSkills = response.missingSkills || response.MissingSkills;
  const followUpQuestion = response.followUpQuestion || response.FollowUpQuestion;

  return [
    answer || "The AI Mentor couldn't find an appropriate answer. Please try asking your question more clearly.",

    targetRoleName
      ? `**Target Role:**\n${targetRoleName}`
      : "",

    recommendedCareers?.length
      ? `**Recommended Careers:**\n- ${recommendedCareers.join("\n- ")}`
      : "",

    missingSkills?.length
      ? `**Missing Skills:**\n- ${missingSkills.join("\n- ")}`
      : "",

    followUpQuestion
      ? `**Follow-up Question:**\n${followUpQuestion}`
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
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChatHistory() {
      if (!userId) {
        setLoadingHistory(false);
        return;
      }
      try {
        setLoadingHistory(true);
        const historyData = await apiClient.get<any[]>(`/mentor/history/${userId}`);
        
        if (historyData && historyData.length > 0) {
          let lastAiResponse: any = null;

          const formattedMessages: Message[] = historyData.map((msg) => {
            const isUser = msg.sender.toUpperCase() === "USER";
            let displayContent = msg.content;

            if (!isUser) {
              try {
                // AI response is stored as JSON string representing MentorAskResponse
                const parsedJson = JSON.parse(msg.content);
                lastAiResponse = parsedJson;
                displayContent = formatMentorResponse(parsedJson);
              } catch {
                // Fallback to raw text if not JSON
                displayContent = msg.content;
              }
            }

            return {
              id: msg.messageId || Date.now() + Math.random(),
              role: isUser ? "user" : "ai",
              content: displayContent,
            };
          });

          setMessages(formattedMessages);

          // Restore target role and recommended careers from the latest AI response in history
          if (lastAiResponse) {
            const targetRoleName = lastAiResponse.targetRoleName || lastAiResponse.TargetRoleName;
            const targetRoleId = lastAiResponse.targetRoleId || lastAiResponse.TargetRoleId;
            const recommended = lastAiResponse.recommendedCareers || lastAiResponse.RecommendedCareers;

            if (targetRoleName) {
              setTargetRole({
                id: targetRoleId,
                name: targetRoleName,
              });
            }
            if (recommended && recommended.length > 0) {
              setRecommendedCareers(recommended);
            }
          }
        }
      } catch (error) {
        openNotification("error", "Cannot load chat history.");
      } finally {
        setLoadingHistory(false);
      }
    }

    void loadChatHistory();
  }, [userId]);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);

  async function fetchKeyStatus() {
    try {
      const status = await getApiKeyStatus(userId);
      setApiKeyStatus(status);
    } catch {
      setApiKeyStatus({ hasKey: false });
    }
  }

  useEffect(() => {
    void fetchKeyStatus();
  }, [userId]);

  async function handleDeleteKey() {
    try {
      await deleteApiKey(userId);
      await fetchKeyStatus();
    } catch {
      // handle error silently for now
    }
  }

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, typing]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, typing]);

  async function performAskMentor(text: string) {
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
      const mentorResponse = await askMentor(text, userId);

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
    } catch (error: any) {
      if (error.message?.includes("Gemini API Key")) {
        setPendingAction(() => () => void performAskMentor(text));
        setIsApiKeyModalOpen(true);
      } else {
        openNotification(
          "error",
          "AI Mentor is currently unavailable."
        );
      }
    } finally {
      setTyping(false);
    }
  }

  async function send(text: string) {
    const trimmedText = text.trim();

    if (!trimmedText || typing) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    await performAskMentor(trimmedText);
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

  async function performCreateRoadmap() {
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
      const generatedResult = await apiClient.post<any>(
        "/Roadmap/generate-preview",
        {
          userId,
          targetRoleId: targetRole.id,
          dailyStudyHours: 2,
        }
      );

      setRoadmapPreview(generatedResult);

      setShowRoadmapPreview(true);
      setPreviewCollapsed(false);

      openNotification("success", "Roadmap preview generated successfully!");
    } catch (error: any) {
      if (error.message?.includes("Gemini API Key")) {
        setPendingAction(() => () => void performCreateRoadmap());
        setIsApiKeyModalOpen(true);
      } else {
        openNotification(
          "error",
          "Failed to create roadmap."
        );
      }
    } finally {
      setCreatingRoadmap(false);
    }
  }

  async function handleCreateRoadmapClick() {
    await performCreateRoadmap();
  }

  async function handleSaveRoadmapClick() {
    if (!roadmapPreview || !targetRole) return;

    try {
      await apiClient.post("/Roadmap/save", {
        userId,
        targetRoleId: targetRole.id,
        dailyStudyHours: roadmapPreview.dailyStudyHours,
        phases: roadmapPreview.phases,
      });

      openNotification("success", "Lộ trình đã được lưu thành công.");
      setShowRoadmapPreview(false);
      setRoadmapPreview(null);
    } catch {
      openNotification("error", "Lưu lộ trình thất bại.");
    }
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

  async function handleClearHistory() {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?");
    if (!confirmed) return;

    try {
      setLoadingHistory(true);
      await apiClient.delete(`/mentor/history/${userId}`);
      
      // Reset state to default greeting message
      setMessages([
        {
          id: 0,
          role: "ai",
          content: `Xin chào, ${studentName} 👋 Tôi là Cố vấn Học tập AI của bạn. Tôi có thể giúp bạn phân tích định hướng nghề nghiệp, xác định những kỹ năng còn thiếu và xây dựng lộ trình học tập cá nhân hóa dựa trên hồ sơ học tập của bạn.`,
        },
      ]);
      setTargetRole(null);
      setRecommendedCareers([]);
      openNotification("success", "Đã xóa lịch sử trò chuyện thành công.");
    } catch {
      openNotification("error", "Không thể xóa lịch sử trò chuyện.");
    } finally {
      setLoadingHistory(false);
    }
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
        loadingHistory={loadingHistory}
        onClearHistory={handleClearHistory}
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
        apiKeyStatus={apiKeyStatus}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onDeleteApiKey={() => void handleDeleteKey()}
      />

      <ApiKeyModal
        userId={userId}
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          void fetchKeyStatus();
          if (pendingAction) {
            void pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
}