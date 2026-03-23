import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public pages
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Support = lazy(() => import('@/pages/Support'));
const DatingGuide = lazy(() => import('@/pages/guides/DatingGuide'));
const Auth = lazy(() => import('@/pages/Auth'));

// Dashboard pages
const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview'));
const DashboardOrders = lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardWallet = lazy(() => import('@/pages/dashboard/DashboardWallet'));
const DashboardDeposits = lazy(() => import('@/pages/dashboard/DashboardDeposits'));
const DashboardSubscriptions = lazy(() => import('@/pages/dashboard/DashboardSubscriptions'));
const DashboardSupport = lazy(() => import('@/pages/dashboard/DashboardSupport'));
const DashboardNotifications = lazy(() => import('@/pages/dashboard/DashboardNotifications'));
const DashboardHistory = lazy(() => import('@/pages/dashboard/DashboardHistory'));
const DashboardSettings = lazy(() => import('@/pages/dashboard/DashboardSettings'));
const DashboardOrderWorkspace = lazy(() => import('@/pages/dashboard/DashboardOrderWorkspace'));

// Admin pages
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminServices = lazy(() => import('@/pages/admin/AdminServices'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminDeposits = lazy(() => import('@/pages/admin/AdminDeposits'));
const AdminTickets = lazy(() => import('@/pages/admin/AdminTickets'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/AdminSubscriptions'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminVerifiedProfiles = lazy(() => import('@/pages/admin/AdminVerifiedProfiles'));

const AuthenticatedApp = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/support" element={<Support />} />
          <Route path="/guides/dating" element={<DatingGuide />} />
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* Dashboard routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/orders" element={<DashboardOrders />} />
          <Route path="/dashboard/orders/:orderId" element={<DashboardOrderWorkspace />} />
          <Route path="/dashboard/wallet" element={<DashboardWallet />} />
          <Route path="/dashboard/deposits" element={<DashboardDeposits />} />
          <Route path="/dashboard/subscriptions" element={<DashboardSubscriptions />} />
          <Route path="/dashboard/support" element={<DashboardSupport />} />
          <Route path="/dashboard/notifications" element={<DashboardNotifications />} />
          <Route path="/dashboard/history" element={<DashboardHistory />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/verified-profiles" element={<AdminVerifiedProfiles />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/deposits" element={<AdminDeposits />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App