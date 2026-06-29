import { useState } from "react";
import { saveApiKey } from "../../services/apiKeyApi";
import { parseApiError } from "@/shared/utils/errorHelper";

type ApiKeyModalProps = {
    isOpen: boolean;
    userId: string;
    onClose: () => void;
    onSuccess?: () => void;
};

export function ApiKeyModal({
    isOpen,
    userId,
    onClose,
    onSuccess,
}: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    async function handleSave() {
        const trimmedKey = apiKey.trim();

        if (!trimmedKey) {
            setError("Please enter your Gemini API key.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await saveApiKey(userId, trimmedKey);
            setApiKey("");
            onSuccess?.();
            onClose();
        } catch (err: any) {
            const parsedError = parseApiError(err);
            const message = parsedError.detail || parsedError.message || "Failed to save Gemini API key.";
            setError(message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-[#006b5f]">
                    AI Integration
                </p>

                <h3 className="mt-2 text-xl font-bold text-[#002046]">
                    Gemini API Key Required
                </h3>

                <p className="mt-2 text-sm text-[#44474e]">
                    You need to connect your Gemini API key before using AI Mentor or
                    generating a personalized roadmap.
                </p>

                <div className="mt-5">
                    <label className="text-sm font-semibold text-[#002046]">
                        Gemini API Key
                    </label>

                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your Gemini API key here"
                        className="mt-2 w-full rounded-xl border border-[#c4c6cf] px-4 py-3 outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />

                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl border border-[#c4c6cf] px-5 py-2 text-sm font-semibold text-[#44474e] hover:bg-[#f8fafc] disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving}
                        className="rounded-xl bg-[#006b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00544b] disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save & Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}