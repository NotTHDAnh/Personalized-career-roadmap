import { useState } from "react";

type StudyHoursModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (hours: number) => void;
};

export function StudyHoursModal({
    isOpen,
    onClose,
    onSubmit,
}: StudyHoursModalProps) {
    const [hours, setHours] = useState<string>("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    function handleSave() {
        const parsed = parseFloat(hours);

        if (!hours || isNaN(parsed) || parsed <= 0 || parsed > 24) {
            setError("Please enter a valid number of daily study hours (1-24).");
            return;
        }

        setError("");
        onSubmit(parsed);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-[#006b5f]">
                    Roadmap Settings
                </p>

                <h3 className="mt-2 text-xl font-bold text-[#002046]">
                    Daily Study Hours
                </h3>

                <p className="mt-2 text-sm text-[#44474e]">
                    To generate a personalized roadmap, we need to know how many hours you can dedicate to studying per day.
                </p>

                <div className="mt-5">
                    <label className="text-sm font-semibold text-[#002046]">
                        Hours per day
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="mt-2 w-full rounded-xl border border-[#c4c6cf] px-4 py-3 outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />

                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-[#c4c6cf] px-5 py-2 text-sm font-semibold text-[#44474e] hover:bg-[#f8fafc]"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-xl bg-[#006b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#00544b]"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
