import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { connectGithub, getGithubProfile } from "../../services/githubApi";
import { useNotification } from "../../../shared/contexts/NotificationContext";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function GithubCallbackScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openNotification, updateNotification } = useNotification();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("GitHub authentication code not found.");
      return;
    }

    const notifId = openNotification("loading", "Connecting and syncing your GitHub account...");

    connectGithub(code)
      .then(async (res) => {
        try {
          const profile = await getGithubProfile();
          if (profile.avatarUrl) {
            updateUser({ avatarUrl: profile.avatarUrl });
          }
        } catch (e) {
          console.error("Failed to fetch github profile after connect:", e);
        }
        
        setStatus("success");
        updateNotification(notifId, "success", res.message || "GitHub connected successfully!");
        setTimeout(() => {
          navigate("/dashboard/profile");
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        const errMsg = err?.response?.data?.message || err?.message || "Sync failed. Please try again.";
        setErrorMessage(errMsg);
        updateNotification(notifId, "error", errMsg);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-slate-100 text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Processing connection</h2>
            <p className="text-slate-500 text-sm">
              Please do not close the browser. We are exchanging tokens and syncing your projects from GitHub.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Connection successful!</h2>
            <p className="text-slate-500 text-sm">
              Your GitHub account has been linked successfully. Redirecting you to your profile...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Connection Error</h2>
            <p className="text-rose-600 font-medium text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
            >
              Back to profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
