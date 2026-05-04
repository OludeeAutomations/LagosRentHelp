// components/LoginModal.tsx
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLoginModalStore } from "@/stores/modalStore";
import { Eye, EyeOff, ArrowRight, Info } from "lucide-react";

export const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const { isOpen, message, closeLoginModal, executeRetry } =
    useLoginModalStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      closeLoginModal();
      try {
        await executeRetry();
      } catch (retryError) {
        console.error("Retry failed", retryError);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Login failed. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[420px] overflow-hidden border border-gray-100 shadow-2xl">
        {/* Header */}
        <div className="bg-[#129B36] px-7 pt-7 pb-6 flex flex-col items-center gap-3.5">
          {/* Replace the svg below with your actual logo */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/35 flex items-center justify-center">
            <img
              src="/icon.png"
              alt="LagosRentHelp Logo"
              className="w-10 sm:w-12 lg:w-14"
            />
          </div>
          <div className="text-center">
            <span className="text-base sm:text-lg lg:text-xl font-bold text-[#FFFFFF] hidden sm:inline">
              LagosRentHelp
            </span>

            <p className="text-white/75 text-[13px] mt-0.5">
              Please sign in to continue
            </p>
          </div>
          <span className="bg-white/20 text-white/90 text-xs px-3 py-1 rounded-full border border-white/25">
            Session expired
          </span>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-7">
          {/* Info notice */}
          <div className="bg-[#f0faf3] border border-[#a8dfb8] rounded-[10px] px-3.5 py-2.5 flex items-start gap-2 mb-5">
            <Info size={15} className="text-[#129B36] flex-shrink-0 mt-0.5" />
            <p className="text-[#0e6b28] text-[13px]">{message}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-gray-500 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[42px] px-3.5 rounded-[10px] border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#129B36] focus:ring-[3px] focus:ring-[#129B36]/12 focus:bg-white"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[42px] px-3.5 pr-10 rounded-[10px] border border-gray-200 bg-gray-50 text-[14px] text-gray-900 outline-none transition focus:border-[#129B36] focus:ring-[3px] focus:ring-[#129B36]/12 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-2">
              <a
                href="#"
                className="text-[12px] text-[#129B36] hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-3.5 py-2.5 rounded-[8px]">
                {error}
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={closeLoginModal}
                className="h-[42px] px-5 rounded-[10px] border border-gray-200 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-[42px] rounded-[10px] bg-[#129B36] text-white text-[14px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#0f8a2f] transition disabled:opacity-55 disabled:cursor-not-allowed">
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
