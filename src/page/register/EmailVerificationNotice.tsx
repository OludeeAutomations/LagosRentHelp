import React from "react";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";

const EmailVerificationNotice: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We’ve sent you a verification link"
    >
      <motion.div
        className="text-center space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={containerVariants}>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <MailCheck className="h-8 w-8 text-[#129B36]" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants}>
          <p className="text-grey text-lg">
            We’ve sent a verification link to your email address.  
            Please check your <span className="font-medium text-black">inbox </span> 
            and also your <span className="font-medium text-black">spam/junk folder</span> if you don’t see it.  
          </p>
        </motion.div>

        <motion.div variants={containerVariants}>
          <p className="text-sm text-grey">
            Once verified, you’ll be able to sign in to your account.
          </p>
        </motion.div>

        <motion.div variants={containerVariants}>
          <Button asChild className="w-full bg-[#129B36] hover:bg-[#41614F] text-white">
            <Link to="/login">Back to Login</Link>
          </Button>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default EmailVerificationNotice;
