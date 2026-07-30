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
import { useNavigate } from "react-router";
import type { KeyboardEvent } from "react";
import type { Message, MentorAskResponse, GenerateRoadmapResponse, RoadmapPreview, ChatMessageDto, CursorPagedResponse } from "@/app/types";
import { apiClient } from "@/shared/api/apiClient";
import { ApiKeyModal } from "@/app/components/common/ApiKeyModal";
import { StudyHoursModal } from "@/app/components/common/StudyHoursModal";
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
import { parseApiError, isApiKeyError, isApiKeyExpiredOrOutOfQuota } from "@/shared/utils/errorHelper";

function formatMentorResponse(response: any) {
  const answer = response.answer || response.Answer;
  const targetRoleName = response.targetRoleName || response.TargetRoleName;
  const recommendedCareers = response.recommendedCareers || response.RecommendedCareers;
  const missingSkills = response.missingSkills || response.MissingSkills;
  const followUpQuestion = response.followUpQuestion || response.FollowUpQuestion;

  return [
    answer || "The AI Mentor couldn't find an appropriate answer. Please try asking your question more clearly.",

    response.targetRoleName
      ? `**Target Role:** ${response.targetRoleName}`
      : "",

    response.recommendedCareers?.length
      ? `**Recommended Careers:** ${response.recommendedCareers.join(", ")}`
      : "",

    response.missingSkills?.length
      ? `**Missing Skills:** ${response.missingSkills.join(", ")}`
      : "",

    response.followUpQuestion
      ? `**Follow-up Question:** ${response.followUpQuestion}`
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

const DEFAULT_DAILY_STUDY_HOURS = 2;

export function MentorTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openNotification } = useNotification();
  const studentName = user?.fullName || "student";
  const userId = user?.userId || "student-001";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content: `Hello, ${studentName} 👋 I am your AI Academic Mentor. I can help you analyze your career goals, identify missing skills, and build a personalized learning roadmap based on your academic profile.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [lastUserPrompt, setLastUserPrompt] = useState("");

  const [targetRole, setTargetRole] = useState<{
    id?: string;
    name: string;
  } | null>(null);

  const [targetRoadmapStatus, setTargetRoadmapStatus] = useState<"checking" | "create" | "update">("create");
  const [oldRoadmapId, setOldRoadmapId] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<RoadmapPreview | null>(null);

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
        const historyData = await apiClient.get<CursorPagedResponse<ChatMessageDto> | ChatMessageDto[]>(`/mentor/history/${userId}`);

        const historyItems: ChatMessageDto[] = Array.isArray(historyData)
          ? historyData
          : (historyData?.items || historyData?.Items || []);

        if (historyItems && historyItems.length > 0) {
          let lastAiResponse: any = null;

          const formattedMessages: Message[] = historyItems.map((msg: any) => {
            const senderStr = msg.sender || msg.Sender || "";
            const isUser = senderStr.toUpperCase() === "USER";
            const rawContent = msg.content || msg.Content || "";
            let displayContent = rawContent;

            if (!isUser) {
              try {
                // AI response is stored as JSON string representing MentorAskResponse
                const parsedJson = JSON.parse(rawContent);

                // Keep track of the last valid target role
                if (parsedJson.targetRoleName || parsedJson.TargetRoleName) {
                  lastAiResponse = parsedJson;
                }

                displayContent = formatMentorResponse(parsedJson);
              } catch {
                // Fallback to raw text if not JSON
                displayContent = rawContent;
              }
            }

            return {
              id: msg.messageId || msg.MessageId || Date.now() + Math.random(),
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
  const [isStudyHoursModalOpen, setIsStudyHoursModalOpen] = useState(false);
  const [dailyStudyHours, setDailyStudyHours] = useState<number | null>(null);
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

  useEffect(() => {
    async function checkTargetRoleStatus() {
      if (!targetRole || !targetRole.name) {
        setTargetRoadmapStatus("create");
        setOldRoadmapId(null);
        setDraftPreview(null);
        return;
      }

      setTargetRoadmapStatus("checking");
      setDraftPreview(null);
      try {
        const userRoadmaps = await apiClient.get<any[]>(`/Roadmap/user/${userId}`);
        const existingRoadmap = userRoadmaps.find(r => r.targetRoleId === targetRole.id);

        if (!existingRoadmap) {
          setTargetRoadmapStatus("create");
          setOldRoadmapId(null);
          return;
        }

        setOldRoadmapId(existingRoadmap.roadmapId);

        const existingDetails = await apiClient.get<any>(`/Roadmap/${existingRoadmap.roadmapId}`);
        const existingCourseCount = existingDetails.phases?.flatMap((p: any) => p.nodes)?.length || 0;

        const previewResult = await apiClient.post<any>("/Roadmap/generate-preview", {
          userId,
          targetRoleId: targetRole.id || existingRoadmap.targetRoleId,
          dailyStudyHours: dailyStudyHours || DEFAULT_DAILY_STUDY_HOURS
        });

        const previewCourseCount = previewResult.phases?.flatMap((p: any) => p.nodes)?.length || 0;

        if (previewCourseCount === 0 && existingDetails) {
          // If AI fails or returns 0 courses, use the existing roadmap instead of an empty one!
          setDraftPreview(existingDetails);
        } else {
          setDraftPreview(previewResult);
        }

        if (previewCourseCount !== existingCourseCount) {
          setTargetRoadmapStatus("update");
        } else {
          setTargetRoadmapStatus("update");
        }
      } catch (error) {
        console.error("Failed to check roadmap status", error);
        setTargetRoadmapStatus("create");
      }
    }

    void checkTargetRoleStatus();
  }, [targetRole, userId, dailyStudyHours]);

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
      //lay targetRoleName roi gan cho targetRole
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
      const parsedError = parseApiError(error);
      if (isApiKeyError(parsedError)) {
        if (isApiKeyExpiredOrOutOfQuota(parsedError)) {
          openNotification(
            "error",
            "Your Gemini API Key is invalid, expired, or out of quota. Please configure a new one."
          );
          setApiKeyStatus(prev => prev ? { ...prev, isExpired: true } : { hasKey: true, isExpired: true });
        } else {
          openNotification(
            "warning",
            "Please configure your Gemini API Key to use this feature."
          );
        }
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
    setLastUserPrompt(trimmedText);

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

  async function performCreateRoadmap(hoursToUse?: number) {
    const activeRoleId = targetRole?.id;
    const finalHours = hoursToUse || dailyStudyHours || DEFAULT_DAILY_STUDY_HOURS;
    if (!activeRoleId || creatingRoadmap) return;

    setCreatingRoadmap(true);

    try {
      const generatedResult = await apiClient.post<any>(
        "/Roadmap/generate-preview",
        {
          userId,
          targetRoleId: activeRoleId,
          dailyStudyHours: finalHours,
        }
      );

      setRoadmapPreview(generatedResult);

      setShowRoadmapPreview(true);
      setPreviewCollapsed(false);

      openNotification("success", "Roadmap preview generated successfully!");
    } catch (error: any) {
      const parsedError = parseApiError(error);
      if (isApiKeyError(parsedError)) {
        if (isApiKeyExpiredOrOutOfQuota(parsedError)) {
          openNotification(
            "error",
            "Your Gemini API Key is invalid, expired, or out of quota. Please configure a new one."
          );
          setApiKeyStatus(prev => prev ? { ...prev, isExpired: true } : { hasKey: true, isExpired: true });
        } else {
          openNotification(
            "warning",
            "Please configure your Gemini API Key to use this feature."
          );
        }
        setPendingAction(() => () => void performCreateRoadmap(hoursToUse));
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
    if (!targetRole || creatingRoadmap) return;
    if (!targetRole.id) {
      openNotification("warning", "Please clarify your target career role first.");
      return;
    }

    if (draftPreview && targetRoadmapStatus === "update") {
      setRoadmapPreview(draftPreview);
      setShowRoadmapPreview(true);
      setPreviewCollapsed(false);
      openNotification("success", "Roadmap preview ready for update!");
      return;
    }

    if (dailyStudyHours === null) {
      setIsStudyHoursModalOpen(true);
    } else {
      await performCreateRoadmap(dailyStudyHours);
    }
  }

  async function handleSaveRoadmapClick() {
    if (!roadmapPreview || !targetRole) return;

    try {
      // If the preview is actually the existing roadmap (fallback), skip deleting and saving to preserve progress!
      if (targetRoadmapStatus === "update" && oldRoadmapId && (roadmapPreview as any).roadmapId === oldRoadmapId) {
        openNotification("success", "Roadmap updated successfully!");
        setShowRoadmapPreview(false);
        setRoadmapPreview(null);
        setTargetRoadmapStatus("update");
        setLastUserPrompt("");
        navigate("/dashboard/roadmap");
        return;
      }

      if (targetRoadmapStatus === "update" && oldRoadmapId) {
        // Tuân thủ 1 Role - 1 Roadmap: xóa roadmap cũ trước khi lưu bản update
        await apiClient.delete(`/Roadmap/${oldRoadmapId}`);
      }

      await apiClient.post("/Roadmap/save", {
        userId,
        targetRoleId: targetRole.id,
        dailyStudyHours: roadmapPreview.dailyStudyHours,
        phases: roadmapPreview.phases,
      });

      openNotification("success", targetRoadmapStatus === "update" ? "Roadmap updated successfully!" : "Roadmap saved successfully.");
      setShowRoadmapPreview(false);
      setRoadmapPreview(null);
      setTargetRoadmapStatus("update");
      setLastUserPrompt("");

      // Chuyển hướng sang tab Roadmap để xem kết quả
      navigate("/dashboard/roadmap");
    } catch {
      openNotification("error", "Failed to save roadmap.");
    }
  }

  function handleCancelRoadmapClick() {
    setShowRoadmapPreview(false);
    setPreviewCollapsed(false);
    setLastUserPrompt("");

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
          content: `Hello, ${studentName} 👋 I am your AI Academic Mentor. I can help you analyze your career goals, identify missing skills, and build a personalized learning roadmap based on your academic profile.`,
        },
      ]);
      setTargetRole(null);
      setRecommendedCareers([]);
      openNotification("success", "Chat history deleted successfully.");
    } catch {
      openNotification("error", "Failed to delete chat history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  const isUpdateIntent = /(update|cập nhật|làm mới|đồng bộ|tạo lại|đổi|refresh|sửa|cap nhat|lam moi|dong bo|sua|tao lai)/i.test(lastUserPrompt);
  const effectiveRoadmapStatus = targetRoadmapStatus === "checking"
    ? "checking"
    : (targetRoadmapStatus === "update" && !isUpdateIntent) 
      ? "update_locked" 
      : targetRoadmapStatus;

  return (
    // <div className="grid xl:grid-cols-[0.72fr_0.28fr] gap-8">
    //   <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm min-h-[680px] flex flex-col">
    <div className="grid min-h-0 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col gap-6 h-[calc(100vh-100px)] min-h-[750px]">
        <MentorChatSection
          messages={messages}
          input={input}
          setInput={setInput}
          typing={typing}
          creatingRoadmap={creatingRoadmap}
          targetRole={targetRole}
          recommendedCareers={recommendedCareers}
          messagesContainerRef={messagesContainerRef}
          onSend={performAskMentor}
          onKeyDown={handleKeyDown}
          onCreateRoadmap={handleCreateRoadmapClick}
          onClearHistory={handleClearHistory}
          loadingHistory={loadingHistory}
          hasActivePreview={showRoadmapPreview}
          targetRoadmapStatus={effectiveRoadmapStatus as "checking" | "create" | "update" | "update_locked"}
        />

        {recommendedCareers.length > 0 && (
          <div className="shrink-0 rounded-2xl border border-[#c4c6cf] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#002046]">
              Choose one career to create your roadmap:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {recommendedCareers.map((career) => (
                <button
                  key={career}
                  type="button"
                  onClick={() => handleChooseRecommendedCareer(career)}
                  disabled={typing || showRoadmapPreview}
                  className="rounded-full border border-[#006b5f] px-4 py-2 text-sm font-semibold text-[#006b5f] transition hover:bg-[#f0fffb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Use {career}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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

      <StudyHoursModal
        isOpen={isStudyHoursModalOpen}
        onClose={() => setIsStudyHoursModalOpen(false)}
        onSubmit={(hours) => {
          setDailyStudyHours(hours);
          setIsStudyHoursModalOpen(false);
          void performCreateRoadmap(hours);
        }}
      />
    </div>
  );
}