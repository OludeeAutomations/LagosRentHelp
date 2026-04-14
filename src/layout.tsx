// src/layouts/Layout.tsx
import React from "react";
import { motion } from "framer-motion";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Don't show header/footer on auth pages or maintenance mode
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  //const isMaintenanceMode = location.pathname === "/";
  //add && !isMaintenanceMode to the condition above when maintenance mode is implemented
  return (
    <div className="min-h-screen flex flex-col">
      {/* add && !isMaintenanceMode to the condition above when maintenance mode
      is implemented */}
      {!isAuthPage && <Header />}
      {isAuthPage ? (
        children
      ) : (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-grow">
          {children}
        </motion.main>
      )}
      {/* add && !isMaintenanceMode to the condition above when maintenance mode
      is implemented */}
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;
