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
import ScrollToTop from "./components/common/ScrollToTop";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";
import {
  AdminRoute,
  AuthenticatedRoute,
  LandlordRoute,
  MfaProtectedRoute,
  SuperAdminRoute,
} from "./components/common/RoleRoute";

const Contact = React.lazy(() => import("./page/contact/Contact"));
const About = React.lazy(() => import("./page/about/About"));
const SearchPage = React.lazy(() => import("./page/searchPage/SearchPage"));
const Features = React.lazy(() => import("./page/feature/Features"));
const PrivacyPolicy = React.lazy(() => import("./page/privacyPolicy/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./page/terms/Terms"));
const FAQPage = React.lazy(() => import("./page/faq/Faq"));
const Register = React.lazy(() => import("./page/register/Register"));
const Login = React.lazy(() => import("./page/login/Login"));
const PropertyDetails = React.lazy(() => import("./page/propertiesDetails/PropertyDetails"));
const ComingSoonPage = React.lazy(() => import("./page/ComingSoonPage"));
const UserSettingsPage = React.lazy(() => import("./page/settings/SettingsPage"));
const EmailVerificationNotice = React.lazy(() => import("./page/register/EmailVerificationNotice"));
const VerifyEmailResult = React.lazy(() => import("./page/register/VerifyEmailResult"));
const ForgotPassword = React.lazy(() => import("./page/login/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./page/login/ResetPassword"));
const Favorites = React.lazy(() => import("./page/user/Favorites"));
const RenterPreferencesPage = React.lazy(() => import("./page/user/RenterPreferencesPage"));
const AuthCallback = React.lazy(() => import("./page/login/AuthCallback"));
const MfaChallenge = React.lazy(() => import("./page/login/MfaChallenge"));
const CompleteProfile = React.lazy(() => import("./page/register/CompleteProfile"));
const AdminAccountsPage = React.lazy(() => import("./page/admin/AdminAccountsPage"));
const LandlordVerificationPage = React.lazy(() => import("./page/admin/LandlordVerificationPage"));
const AdminDashboardLayout = React.lazy(() => import("./page/admin/AdminDashboardLayout"));
const AdminLandlordsPage = React.lazy(() => import("./page/admin/AdminLandlordsPage"));
const SuperAdminDashboardPage = React.lazy(() => import("./page/admin/SuperAdminDashboardPage"));
const LandlordOnboarding = React.lazy(() => import("./page/landlord/LandlordOnboarding"));
const LandlordDashboard = React.lazy(() => import("./page/landlord/LandlordDashboard"));
const LandlordCreateListing = React.lazy(() => import("./page/landlord/LandlordCreateListing"));
const LandlordDashboardLayout = React.lazy(() => import("./page/landlord/LandlordDashboardLayout"));
const LandlordProfile = React.lazy(() => import("./page/landlord/LandlordProfile"));
const LandlordListings = React.lazy(() => import("./page/landlord/LandlordListings"));
const LandlordLeads = React.lazy(() => import("./page/landlord/LandlordLeads"));
const LandlordLogs = React.lazy(() => import("./page/landlord/LandlordLogs"));
const LandlordSubscription = React.lazy(() => import("./page/landlord/LandlordSubscription"));
const DashboardSecuritySettings = React.lazy(() => import("./page/settings/DashboardSecuritySettings"));

const RouteFallback = () => (
  <div className="flex min-h-[45vh] items-center justify-center bg-white" role="status" aria-label="Loading page">
    <span className="h-9 w-9 animate-spin rounded-full border-4 border-green-100 border-t-[#129B36]" />
  </div>
);

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
          <React.Suspense fallback={<RouteFallback />}>
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
              <Route path="/renter/preferences" element={<Layout><RenterPreferencesPage /></Layout>} />
              <Route
                path="/landlord/onboarding"
                element={
                  <Layout>
                    <LandlordOnboarding />
                  </Layout>
                }
              />
              <Route path="/mfa-challenge" element={<MfaChallenge />} />
            </Route>
            <Route element={<LandlordRoute />}>
              <Route element={<MfaProtectedRoute />}>
                <Route element={<LandlordDashboardLayout />}>
                  <Route path="/landlord" element={<LandlordDashboard />} />
                  <Route path="/landlord/listings" element={<LandlordListings />} />
                  <Route path="/landlord/listings/new" element={<LandlordCreateListing />} />
                  <Route path="/landlord/listings/:listingId/edit" element={<LandlordCreateListing />} />
                  <Route path="/landlord/leads" element={<LandlordLeads />} />
                  <Route path="/landlord/logs" element={<LandlordLogs />} />
                  <Route path="/landlord/subscription" element={<LandlordSubscription />} />
                  <Route path="/landlord/profile" element={<LandlordProfile />} />
                  <Route path="/landlord/settings" element={<DashboardSecuritySettings />} />
                </Route>
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
            <Route element={<AdminRoute />}>
              <Route element={<MfaProtectedRoute />}>
                <Route element={<AdminDashboardLayout />}>
                  <Route path="/admin/verifications" element={<LandlordVerificationPage />} />
                  <Route path="/admin/settings" element={<DashboardSecuritySettings />} />
                  <Route element={<SuperAdminRoute />}>
                    <Route path="/admin" element={<SuperAdminDashboardPage />} />
                    <Route path="/admin/landlords" element={<AdminLandlordsPage />} />
                    <Route path="/admin/accounts" element={<AdminAccountsPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>
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
          </React.Suspense>
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
