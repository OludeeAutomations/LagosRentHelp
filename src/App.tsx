import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./layout";
import Home from "./page/home/Home";
import Contact from "./page/contact/Contact";
import About from "./page/about/About";
import SearchPage from "./page/searchPage/SearchPage";
import Features from "./page/feature/Features";
import PrivacyPolicy from "./page/privacyPolicy/PrivacyPolicy";
import TermsOfService from "./page/terms/Terms";
import ScrollToTop from "./components/common/ScrollToTop";
import FAQPage from "./page/faq/Faq";
import Register from "./page/register/Register";
import Login from "./page/login/Login";
import PropertyDetails from "./page/propertiesDetails/PropertyDetails";
import ComingSoonPage from "./page/ComingSoonPage";
import UserSettingsPage from "./page/settings/SettingsPage";
import EmailVerificationNotice from "./page/register/EmailVerificationNotice";
import VerifyEmailResult from "./page/register/VerifyEmailResult";
import ForgotPassword from "./page/login/ForgotPassword";
import ResetPassword from "./page/login/ResetPassword";
import { Toaster } from "sonner";
import Favorites from "./page/user/Favorites";
import PropertyManagementPage from "./page/admin/PropertyManagementPage";
import PropertyEditorPage from "./page/admin/PropertyEditorPage";
import AdminAccountsPage from "./page/admin/AdminAccountsPage";


const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />

      <AnimatePresence mode="wait">
        <ScrollToTop />
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <SearchPage />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <UserSettingsPage />
              </Layout>
            }
          />
          <Route
            path="/dashboard/favorites"
            element={
              <Layout>
                <Favorites />
              </Layout>
            }
          />
          <Route
            path="/features"
            element={
              <Layout>
                <Features />
              </Layout>
            }
          />
          <Route
            path="/privacy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />
          <Route
            path="/terms"
            element={
              <Layout>
                <TermsOfService />
              </Layout>
            }
          />
          <Route
            path="/faq"
            element={
              <Layout>
                <FAQPage />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/verify-email"
            element={
              <Layout>
                <EmailVerificationNotice />
              </Layout>
            }
          />
          <Route
            path="/verify-email/:userId/:token"
            element={
              <Layout>
                <VerifyEmailResult />
              </Layout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Layout>
                <ForgotPassword />
              </Layout>
            }
          />
          <Route
            path="/reset-password/:userId/:token"
            element={
              <Layout>
                <ResetPassword />
              </Layout>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <Layout>
                <PropertyDetails />
              </Layout>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <Layout>
                <PropertyManagementPage />
              </Layout>
            }
          />
          <Route
            path="/admin/properties/new"
            element={
              <Layout>
                <PropertyEditorPage />
              </Layout>
            }
          />
          <Route
            path="/admin/properties/:id/edit"
            element={
              <Layout>
                <PropertyEditorPage />
              </Layout>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <Layout>
                <AdminAccountsPage />
              </Layout>
            }
          />
          {/* 404 Page - Keep this at the end */}
          <Route
            path="*"
            element={
              <Layout>
                <ComingSoonPage />
              </Layout>
            }
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
