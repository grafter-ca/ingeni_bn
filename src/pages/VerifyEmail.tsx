// frontend/src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authClient } from "../libs/auth-client";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      const { error } = await authClient.verifyEmail({
        query: { token }
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Verification failed. The link may have expired.");
      } else {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-8 bg-white border rounded-xl shadow-sm text-center">
        {status === "loading" && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4" />}
        <h1 className="text-2xl font-bold mb-2">
          {status === "success" ? "✅ Verified!" : status === "error" ? "❌ Error" : "Verifying..."}
        </h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
