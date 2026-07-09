import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { connectGithub } from "../../services/githubApi";
import { useNotification } from "../../../shared/contexts/NotificationContext";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function GithubCallbackScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openNotification, updateNotification } = useNotification();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực (code) từ GitHub.");
      return;
    }

    const notifId = openNotification("loading", "Đang kết nối và đồng bộ tài khoản GitHub của bạn...");

    connectGithub(code)
      .then((res) => {
        setStatus("success");
        updateNotification(notifId, "success", res.message || "Kết nối GitHub thành công!");
        setTimeout(() => {
          navigate("/dashboard/profile");
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        const errMsg = err?.response?.data?.message || err?.message || "Đồng bộ thất bại. Vui lòng thử lại.";
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
            <h2 className="text-xl font-bold text-slate-800">Đang xử lý kết nối</h2>
            <p className="text-slate-500 text-sm">
              Vui lòng không đóng trình duyệt. Chúng tôi đang trao đổi token và đồng bộ danh sách dự án của bạn từ GitHub.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Kết nối thành công!</h2>
            <p className="text-slate-500 text-sm">
              Tài khoản GitHub của bạn đã được liên kết thành công. Hệ thống đang chuyển hướng bạn quay lại trang cá nhân...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Lỗi kết nối</h2>
            <p className="text-rose-600 font-medium text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
            >
              Quay lại trang cá nhân
            </button>
          </>
        )}
      </div>
    </div>
  );
}
