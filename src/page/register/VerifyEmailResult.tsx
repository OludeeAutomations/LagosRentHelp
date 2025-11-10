import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const VerifyEmailResult: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const { verifyEmail } = useAuthStore();

  const calledRef = React.useRef(false);

  useEffect(() => {
    if (calledRef.current || !userId || !token) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        console.log("🔄 Verifying email...");
        const response = await verifyEmail(userId, token);

        console.log("✅ Verification response:", response);

        // ✅ Your backend returns { success: true, message: "..." }
        if (response && response.success === true) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(
            response?.error || response?.message || "Verification failed."
          );
        }
      } catch (error: any) {
        console.log("❌ Verification error:", error);
        setStatus("error");
        setMessage(error.message || "Something went wrong.");
      }
    };

    verify();
  }, [userId, token, verifyEmail]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <AuthLayout
      title={
        status === "loading"
          ? "Verifying Email..."
          : status === "success"
          ? "Email Verified 🎉"
          : "Verification Failed"
      }
      subtitle={
        status === "loading" ? "Please wait while we verify your email..." : ""
      }>
      <motion.div
        className="text-center space-y-6"
        variants={variants}
        initial="hidden"
        animate="visible">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-[#129B36] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-lg text-grey">
              Checking your verification link...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#129B36]" />
              </div>
            </div>
            <p className="text-lg text-grey">{message}</p>
            <Button
              asChild
              className="w-full bg-[#129B36] hover:bg-[#41614F] text-white">
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <p className="text-lg text-grey">{message}</p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-[#129B36] hover:bg-[#41614F] text-white">
                <Link to="/register">Back to Register</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/resend-verification">Resend Verification Email</Link>
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default VerifyEmailResult;
