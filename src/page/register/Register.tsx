import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Phone, Lock, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RegisterData } from "@/services/authService";

// Enhanced password validation schema
const passwordRequirements = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: passwordRequirements,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// Password requirement checker
const checkPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { register: registerUser, setError } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const passwordChecks = checkPasswordRequirements(passwordValue);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      console.log("Submitting registration form...");

      const formData: RegisterData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "user",
      };

      const result = await registerUser(formData);

      if (result.success) {
        toast.success(
          "Registration successful! Please check your email for verification."
        );
        navigate("/verify-email");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed animation variants with proper TypeScript types
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const fadeInVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of users finding their perfect home">
      <Form {...form}>
        <motion.form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          {/* Name */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Full Name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-grey" />
                      <Input
                        placeholder="Enter your full name"
                        className="pl-10 border-grey/30 focus:border-[#129B36] focus:ring-[#129B36]"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Email Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-grey" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 border-grey/30 focus:border-[#129B36] focus:ring-[#129B36]"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Phone */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Phone Number *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-grey" />
                      <Input
                        placeholder="+234 123 456 7890"
                        className="pl-10 border-grey/30 focus:border-[#129B36] focus:ring-[#129B36]"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-grey" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 border-grey/30 focus:border-[#129B36] focus:ring-[#129B36]"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-grey hover:text-black"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}>
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Requirements */}
            {passwordValue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Password must contain:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {passwordChecks.length ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        passwordChecks.length
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.uppercase ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        passwordChecks.uppercase
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      One uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.lowercase ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        passwordChecks.lowercase
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      One lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.number ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        passwordChecks.number
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      One number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.special ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={
                        passwordChecks.special
                          ? "text-green-600"
                          : "text-red-600"
                      }>
                      One special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    Confirm Password *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-grey" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 border-grey/30 focus:border-[#129B36] focus:ring-[#129B36]"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-grey hover:text-black"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}>
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  {/* Password Match Indicator */}
                  {confirmPasswordValue && passwordValue && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-1">
                      {confirmPasswordValue === passwordValue ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 text-sm">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-red-600 text-sm">
                            Passwords do not match
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit Button with Enhanced Loader */}
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full bg-[#129B36] hover:bg-[#41614F] text-white relative"
              disabled={isLoading}
              size="lg">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </motion.div>

          {/* Login Link */}
          <motion.div variants={itemVariants}>
            <p className="text-center text-grey">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#129B36] hover:text-[#41614F] font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </Form>

      {/* Terms Notice */}
      <motion.div
        variants={fadeInVariant}
        initial="hidden"
        animate="visible"
        className="text-center text-grey text-sm mt-6">
        <p>
          By creating an account, you agree to our{" "}
          <Link
            to="/terms"
            className="text-[#129B36] hover:text-[#41614F] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="text-[#129B36] hover:text-[#41614F] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
