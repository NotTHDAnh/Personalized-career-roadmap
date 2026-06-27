import React from "react";
import { useNavigate } from "react-router";
import type { RoadmapPreview } from "@/app/types";
import type { ApiKeyStatus } from "@/app/services/apiKeyApi";
import RoadmapTimeline from "./RoadmapTimeline";

interface SidebarProps {
  targetRole: { id?: string; name: string } | null;
  showRoadmapPreview: boolean;
  roadmapPreview: RoadmapPreview | null;
  previewCollapsed: boolean;
  setPreviewCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  typing: boolean;
  setInput: (val: string) => void;
  onCancelRoadmap: () => void;
  onSaveRoadmap: () => void;
  apiKeyStatus: ApiKeyStatus | null;
  onOpenApiKeyModal: () => void;
  onDeleteApiKey: () => void;
}

export default function MentorSidebar({
  targetRole,
  showRoadmapPreview,
  roadmapPreview,
  previewCollapsed,
  setPreviewCollapsed,
  typing,
  setInput,
  onCancelRoadmap,
  onSaveRoadmap,
  apiKeyStatus,
  onOpenApiKeyModal,
  onDeleteApiKey,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm p-6">
        <div className="rounded-2xl border border-[#c4c6cf] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#006b5f]">
                Roadmap Preview
              </p>

              <h4 className="mt-2 text-xl font-bold text-[#002046]">
                {showRoadmapPreview && targetRole
                  ? `Generated roadmap for ${targetRole.name}`
                  : "No roadmap generated yet"}
              </h4>

              <p className="mt-2 text-sm text-[#44474e]">
                {showRoadmapPreview
                  ? "Review the generated roadmap before confirming your choice."
                  : "Ask the AI Mentor about a target career role, then click Create Roadmap."}
              </p>
            </div>

            {showRoadmapPreview && roadmapPreview && (
              <button
                type="button"
                onClick={() => setPreviewCollapsed((prev) => !prev)}
                className="shrink-0 rounded-xl border border-[#006b5f] px-4 py-2 text-sm font-semibold text-[#006b5f] hover:bg-[#f0fffb]"
              >
                {previewCollapsed ? "Show" : "Hide"}
              </button>
            )}
          </div>

          {showRoadmapPreview && roadmapPreview ? (
            <>
              {!previewCollapsed && (
                <div className="mt-5 h-[420px] overflow-y-auto overflow-x-hidden rounded-xl bg-[#f8fafc] p-4 pr-3 text-sm text-[#0b1c30] overscroll-contain [scrollbar-gutter:stable]">
                  {/* <pre className="whitespace-pre-wrap break-words font-sans">
                    {JSON.stringify(roadmapPreview, null, 2)}
                  </pre> */}
                  <RoadmapTimeline roadmap={roadmapPreview} />
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancelRoadmap}
                  className="rounded-xl border border-[#c4c6cf] px-5 py-2 text-sm font-semibold text-[#44474e] hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onSaveRoadmap}
                  className="rounded-xl bg-[#006b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00544b]"
                >
                  Save Roadmap
                </button>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[#c4c6cf] bg-[#f8fafc] p-5 text-sm text-[#74777f]">
              Roadmap preview will appear here after generation.
            </div>
          )}
        </div>

        <h4 className="mt-6 font-bold text-[#002046]">
          Suggested Prompts
        </h4>

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
              className="w-full rounded-xl bg-[#eff4ff] p-4 text-left text-sm text-[#44474e] hover:bg-[#dce9ff]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl shadow-sm p-6 text-white ${apiKeyStatus?.hasKey ? 'bg-[#006b5f]' : 'bg-[#1b365d]'} relative`}>
        <div className="absolute top-6 right-6">
          <button 
            type="button"
            onClick={() => navigate('/dashboard/profile#api-key-guide')}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors font-bold text-xs"
            title="How to get API Key"
          >
            ?
          </button>
        </div>
        <p className="text-xs uppercase tracking-widest text-white/60 font-bold">
          Advisement Status
        </p>

        {!apiKeyStatus?.hasKey ? (
          <>
            <h4 className="text-xl font-bold mt-2">AI Setup Required</h4>
            <p className="text-sm text-white/70 mt-2 mb-4">
              Your academic profile is ready, but you need to connect your Gemini API Key to enable the AI Mentor.
            </p>
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="w-full rounded-xl bg-white text-[#1b365d] px-4 py-2 font-semibold hover:bg-gray-100 transition"
            >
              Connect Gemini API
            </button>
          </>
        ) : (
          <>
            <h4 className="text-xl font-bold mt-2">AI Ready</h4>
            <div className="mt-3 rounded-lg bg-black/20 p-3">
              <p className="text-xs text-white/60 font-medium">Connected Key</p>
              <p className="text-sm font-mono mt-1">{apiKeyStatus.maskedKey}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                className="flex-1 rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
              >
                Update
              </button>
              <button
                type="button"
                onClick={onDeleteApiKey}
                className="flex-1 rounded-xl bg-red-500/20 text-red-100 border border-red-500/30 px-3 py-2 text-sm font-semibold hover:bg-red-500/40 transition"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}