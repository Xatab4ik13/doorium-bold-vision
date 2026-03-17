import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContactsPage from "./pages/ContactsPage";
import CareersPage from "./pages/CareersPage";
import PartnerPage from "./pages/PartnerPage";
import ArticlePage from "./pages/ArticlePage";
import NotFound from "./pages/NotFound";

// CRM pages (lazy loaded)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminAccounts = lazy(() => import("./pages/admin/AdminAccounts"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const AdminEstimates = lazy(() => import("./pages/admin/AdminEstimates"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));

// Manager
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManagerAssign = lazy(() => import("./pages/manager/ManagerAssign"));
const ManagerFiles = lazy(() => import("./pages/manager/ManagerFiles"));
const ManagerEstimates = lazy(() => import("./pages/manager/ManagerEstimates"));
const ManagerCalendar = lazy(() => import("./pages/manager/ManagerCalendar"));

// Measurer
const MeasurerDashboard = lazy(() => import("./pages/measurer/MeasurerDashboard"));
const MeasurerHistory = lazy(() => import("./pages/measurer/MeasurerHistory"));
const MeasurerCalendar = lazy(() => import("./pages/measurer/MeasurerCalendar"));

// Installer
const InstallerDashboard = lazy(() => import("./pages/installer/InstallerDashboard"));
const InstallerHistory = lazy(() => import("./pages/installer/InstallerHistory"));
const InstallerEstimates = lazy(() => import("./pages/installer/InstallerEstimates"));
const InstallerCalendar = lazy(() => import("./pages/installer/InstallerCalendar"));

// Partner
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard"));
const PartnerNewRequest = lazy(() => import("./pages/partner/PartnerNewRequest"));
const PartnerHistory = lazy(() => import("./pages/partner/PartnerHistory"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public site */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/partner" element={<PartnerPage />} />

              {/* CRM Login & Register */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRequests /></ProtectedRoute>} />
              <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAccounts /></ProtectedRoute>} />
              <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCalendar /></ProtectedRoute>} />
              <Route path="/admin/estimates" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEstimates /></ProtectedRoute>} />
              <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPartners /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNews /></ProtectedRoute>} />

              {/* Manager */}
              <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="/manager/assign" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerAssign /></ProtectedRoute>} />
              <Route path="/manager/files" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerFiles /></ProtectedRoute>} />
              <Route path="/manager/estimates" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerEstimates /></ProtectedRoute>} />
              <Route path="/manager/calendar" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerCalendar /></ProtectedRoute>} />

              {/* Measurer */}
              <Route path="/measurer" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerDashboard /></ProtectedRoute>} />
              <Route path="/measurer/history" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerHistory /></ProtectedRoute>} />
              <Route path="/measurer/calendar" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerCalendar /></ProtectedRoute>} />

              {/* Installer */}
              <Route path="/installer" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerDashboard /></ProtectedRoute>} />
              <Route path="/installer/history" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerHistory /></ProtectedRoute>} />
              <Route path="/installer/estimates" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerEstimates /></ProtectedRoute>} />
              <Route path="/installer/calendar" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerCalendar /></ProtectedRoute>} />

              {/* Partner */}
              <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/partner/new" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerNewRequest /></ProtectedRoute>} />
              <Route path="/partner/history" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerHistory /></ProtectedRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
