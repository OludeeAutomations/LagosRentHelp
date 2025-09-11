import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
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

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

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

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const registrationData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        role: "user",
      };

      await registerUser(registrationData);

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
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
        ease: "easeOut",
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
                        placeholder="Create a password (min. 6 characters)"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="w-full bg-[#129B36] hover:bg-[#41614F] text-white"
              disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
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

      {/* Agent Registration Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-grey text-sm mt-4 p-4 bg-muted rounded-lg">
        <p>
          Want to list properties as an agent?{" "}
          <Link
            to="/agent-signup"
            className="text-[#129B36] hover:text-[#41614F] font-medium underline">
            Apply to become a verified agent
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
