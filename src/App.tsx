import React, { useEffect } from "react";
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
import AgentDashboard from "./page/agents/dashboard/AgentDashboard";
import AgentOnboarding from "./page/agents/Auth/AgentOnboarding";
import CreateListing from "./page/agents/dashboard/CreatList";
import AgentDashboardLayout from "./page/agents/dashboard/DashboardLayout";
import PropertyDetails from "./page/propertiesDetails/PropertyDetails";
import AgentProfile from "./page/agents/AgentContact";
import ComingSoonPage from "./page/ComingSoonPage";
import MyListingsPage from "./page/agents/dashboard/MyListingsPage";
import LeadsPage from "./page/agents/dashboard/LeadsPage";
import SettingsPage from "./page/agents/dashboard/SettingsPage";
import UserSettingsPage from "./page/settings/SettingsPage";
import NotificationsPage from "./page/agents/dashboard/NotificationsPage";
import EmailVerificationNotice from "./page/register/EmailVerificationNotice";
import VerifyEmailResult from "./page/register/VerifyEmailResult";
import ForgotPassword from "./page/login/ForgotPassword";
import ResetPassword from "./page/login/ResetPassword";
import { Toaster } from "sonner";
import Favorites from "./page/user/Favorites";
import { useAuthStore } from "./stores/authStore";
import EditListing from "./page/agents/dashboard/EditListing";
//import AgentListings from "./page/agents/dashboard/AgentListings";
//import AgentLeads from "./page/agents/dashboard/AgentLeads";
//import AgentMessages from "./page/agents/dashboard/AgentMessages";
//import AgentAnalytics from "./page/agents/dashboard/AgentAnalytics";
//import AgentSettings from "./page/agents/dashboard/AgentSettings";
//import AgentAppointments from "./page/agents/dashboard/AgentAppointments";
//import AgentCommissions from "./page/agents/dashboard/AgentCommissions";


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
            path="/agents/:agentId"
            element={
              <Layout>
                <AgentProfile />
              </Layout>
            }
          />
          <Route
            path="/agent-signup"
            element={
              <Layout>
                <AgentOnboarding />
              </Layout>
            }
          />
          {/* Agent Dashboard Routes with Agent Layout */}
          <Route
            path="/agent-dashboard"
            element={
              <AgentDashboardLayout title="Dashboard">
                <AgentDashboard />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/listings"
            element={
              <AgentDashboardLayout title="My Listings">
                <MyListingsPage />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/leads"
            element={
              <AgentDashboardLayout title="Leads">
                <LeadsPage />
              </AgentDashboardLayout>
            }
          />
          {/*  <Route
            path="/agent-dashboard/messages"
            element={
              <AgentDashboardLayout title="Messages">
                <AgentMessages />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/analytics"
            element={
              <AgentDashboardLayout title="Analytics">
                <AgentAnalytics />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/appointments"
            element={
              <AgentDashboardLayout title="Appointments">
                <AgentAppointments />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/commissions"
            element={
              <AgentDashboardLayout title="Commissions">
                <AgentCommissions />
              </AgentDashboardLayout>
            }
          />*/}
          <Route
            path="/agent-dashboard/settings"
            element={
              <AgentDashboardLayout title="Settings">
                <SettingsPage />
              </AgentDashboardLayout>
            }
          />
          <Route
            path="/agent-dashboard/notifications"
            element={
              <AgentDashboardLayout title="notifications">
                <NotificationsPage />
              </AgentDashboardLayout>
            }
          />
          {/* Create Listing - This could be in either layout depending on your design */}
          <Route
            path="/create-listing"
            element={
              <AgentDashboardLayout title="Create Listing">
                <CreateListing />
              </AgentDashboardLayout>
            }
          />
          // In your App.tsx or routing file
          <Route
            path="/edit-listing/:id"
            element={
              <AgentDashboardLayout title="Edit Listing">
                <EditListing />{" "}
              </AgentDashboardLayout>
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
