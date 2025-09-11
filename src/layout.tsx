// src/layouts/Layout.tsx
import React from "react";
import { motion } from "motion/react";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Don't show header/footer on auth pages
  const isAuthPage = [
    "/login",
    "/register",
    "/agent-signup",
    "/agent-dashboard",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-grow">
        {children}
      </motion.main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;
