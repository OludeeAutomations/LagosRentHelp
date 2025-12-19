import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner"; // Assuming you use sonner for toasts

const VerifyEmailResult: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Assuming verifyEmail and resendVerificationEmail exist in authStore
  const { verifyEmail, resendVerificationEmail } = useAuthStore();

  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current || !userId || !token) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        console.log("🔄 Verifying email...");
        const response = await verifyEmail(userId, token);

        console.log("✅ Verification response:", response);

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

  const handleResendEmail = async () => {
    if (!userId) return;
    setIsResending(true);
    try {
      // ✅ Call the auth store action to resend email
      // If you don't have this action yet, you'll need to add it to authStore
      if (resendVerificationEmail) {
        await resendVerificationEmail(userId);
        toast.success("Verification email resent successfully!");
      } else {
        console.warn("resendVerificationEmail action is missing in authStore");
        toast.error("Functionality not available");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

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
                <Loader2 className="h-8 w-8 text-[#129B36] animate-spin" />
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

              {/* ✅ Updated Resend Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending}>
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default VerifyEmailResult;
