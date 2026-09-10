import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./layout";
import { ModalProvider } from "./provider/ModalProvider";
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
import AuthCallback from "./page/login/AuthCallback";
import { useAuthStore } from "./stores/authStore";
import { AuthenticatedRoute, LandlordRoute } from "./components/common/RoleRoute";
import LandlordOnboarding from "./page/landlord/LandlordOnboarding";
import LandlordDashboard from "./page/landlord/LandlordDashboard";
import LandlordCreateListing from "./page/landlord/LandlordCreateListing";
import CompleteProfile from "./page/register/CompleteProfile";
import LandlordDashboardLayout from "./page/landlord/LandlordDashboardLayout";
import LandlordProfile from "./page/landlord/LandlordProfile";
import LandlordListings from "./page/landlord/LandlordListings";

const AppContent: React.FC = () => {
  const location = useLocation();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  React.useEffect(() => initializeAuth(), [initializeAuth]);

  return (
    <>
      <Toaster position="top-right" />

      <AnimatePresence mode="wait">
        <ScrollToTop key="scroll-to-top" />
        <div key={location.pathname}>
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
              path="/reset-password"
              element={
                <Layout>
                  <ResetPassword />
                </Layout>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<AuthenticatedRoute />}>
              <Route
                path="/complete-profile"
                element={
                  <Layout>
                    <CompleteProfile />
                  </Layout>
                }
              />
              <Route
                path="/landlord/onboarding"
                element={
                  <Layout>
                    <LandlordOnboarding />
                  </Layout>
                }
              />
            </Route>
            <Route element={<LandlordRoute />}>
              <Route element={<LandlordDashboardLayout />}>
                <Route path="/landlord" element={<LandlordDashboard />} />
                <Route path="/landlord/listings" element={<LandlordListings />} />
                <Route path="/landlord/listings/new" element={<LandlordCreateListing />} />
                <Route path="/landlord/profile" element={<LandlordProfile />} />
              </Route>
            </Route>
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
        </div>
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </Router>
  );
};

export default App;
