import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import type { Message } from "@/app/types";

interface ChatSectionProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  typing: boolean;
  creatingRoadmap: boolean;
  targetRole: { id?: string; name: string } | null;
  recommendedCareers: string[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  onSend: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCreateRoadmap: () => void;
  hasActivePreview: boolean;
}


const MessageItem = React.memo(({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-6 whitespace-pre-line ${
          isUser
            ? "bg-[#006b5f] text-white rounded-br-sm"
            : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-sm"
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default function MentorChatSection({
  messages,
  input,
  setInput,
  typing,
  creatingRoadmap,
  targetRole,
  recommendedCareers,
  messagesContainerRef,
  onSend,
  onKeyDown,
  onCreateRoadmap,
  hasActivePreview,
}: ChatSectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* <div className="p-6 border-b border-[#c4c6cf]"> */}
      <div className="shrink-0 p-6 border-b border-[#c4c6cf] flex items-start justify-between">
        <div>
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
        {/* <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClearHistory}
          disabled={messages.length <= 1 || loadingHistory || typing}
          title="Clear chat history"
          className="text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#410002] rounded-xl shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </Button> */}
      </div>

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 pr-3"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-6 whitespace-pre-line ${message.role === "user"
                  ? "bg-[#006b5f] text-white rounded-br-sm"
                  : "bg-[#eff4ff] text-[#0b1c30] rounded-bl-sm"
                }`}
            >
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#eff4ff] px-5 py-4 text-sm text-[#0b1c30]">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f] [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006b5f] [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        )}

        {/* <div ref={bottomRef} /> */}
      </div>

      {/* <div className="p-6 border-t border-[#c4c6cf]"> */}
      <div className="shrink-0 border-t border-[#c4c6cf] p-6">
        {hasActivePreview && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              You have an unsaved roadmap preview. Please <strong>Save</strong> or <strong>Cancel</strong> it before continuing.
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              onKeyDown(e);
            }}
            disabled={typing || hasActivePreview}
            placeholder={hasActivePreview ? "Please Save or Cancel the roadmap preview first..." : "Ask about career direction..."}
            className="flex-1 rounded-xl disabled:bg-gray-50"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => void onCreateRoadmap()}
            disabled={!targetRole || typing || creatingRoadmap || hasActivePreview}
            title={
              targetRole
                ? `Create roadmap for ${targetRole.name}`
                : "Ask AI Mentor about a target career role first"
            }
            className="rounded-xl border-[#006b5f] text-[#006b5f] hover:bg-[#f0fffb] hover:text-[#00544b]"
          >
            {creatingRoadmap && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Roadmap
          </Button>

          <Button
            type="button"
            onClick={() => void onSend(input)}
            disabled={!input.trim() || typing || hasActivePreview}
            className="rounded-xl bg-[#006b5f] text-white px-5 hover:bg-[#00544b]"
          >
            Send
          </Button>
        </div>

        {/* {showRoadmapPreview && roadmapPreview && (
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
        )} */}
      </div>
    </section>
  );
}