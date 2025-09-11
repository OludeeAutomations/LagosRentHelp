// src/layouts/AuthLayout.tsx
import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-[#129B36] rounded-xl flex items-center justify-center">
                <img src="/icon.png" alt="" className=" w-14" />
              </div>
              <span className="text-xl font-bold text-black">
                LagosRentHelp
              </span>
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-black mb-2">
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-grey">
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="p-8 bg-white border-grey/20">{children}</Card>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Illustration/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-[#129B36] to-[#41614F]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white px-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="mb-8">
                <Heart className="h-16 w-16 text-white mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-4">
                  Find Your Perfect Home
                </h2>
                <p className="text-xl opacity-90">
                  Join thousands of happy tenants and agents in Lagos
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="grid grid-cols-3 gap-6 mt-16">
                {[
                  { number: "500+", label: "Properties" },
                  { number: "100+", label: "Agents" },
                  { number: "1000+", label: "Happy Users" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
