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
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ServiceDetail from '@/pages/ServiceDetail';
import Pricing from '@/pages/Pricing';
import Support from '@/pages/Support';
import DatingGuide from '@/pages/guides/DatingGuide';

// Dashboard pages
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardWallet from '@/pages/dashboard/DashboardWallet';
import DashboardDeposits from '@/pages/dashboard/DashboardDeposits';
import DashboardSubscriptions from '@/pages/dashboard/DashboardSubscriptions';
import DashboardSupport from '@/pages/dashboard/DashboardSupport';
import DashboardNotifications from '@/pages/dashboard/DashboardNotifications';
import DashboardHistory from '@/pages/dashboard/DashboardHistory';
import DashboardSettings from '@/pages/dashboard/DashboardSettings';

// Admin pages
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminServices from '@/pages/admin/AdminServices';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminDeposits from '@/pages/admin/AdminDeposits';
import AdminTickets from '@/pages/admin/AdminTickets';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminSettings from '@/pages/admin/AdminSettings';

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
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/guides/dating" element={<DatingGuide />} />
      </Route>

      {/* Dashboard routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/dashboard/orders" element={<DashboardOrders />} />
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
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/deposits" element={<AdminDeposits />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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