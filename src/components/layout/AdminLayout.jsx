import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, ShoppingCart, Tag,
  LifeBuoy, Settings, BarChart3, Bell, Star, Menu, LogOut,
  Package, FileText, Gift, IdCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppLogo from '@/components/common/AppLogo';

const adminLinks = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Services', path: '/admin/services', icon: Package },
  { label: 'Verified Profiles', path: '/admin/verified-profiles', icon: IdCard },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Deposits', path: '/admin/deposits', icon: CreditCard },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: Star },
  { label: 'Tickets', path: '/admin/tickets', icon: LifeBuoy },
  { label: 'Reviews', path: '/admin/reviews', icon: FileText },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

function AdminSidebar({ onClose, onLogout }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <AppLogo size={32} />
          <div>
            <span className="text-sm font-bold tracking-tight">ToolStack</span>
            <span className="text-xs text-muted-foreground ml-1.5">Admin</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <LayoutDashboard className="w-4 h-4" /> User Dashboard
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isLoading && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-60 bg-card border-r border-border flex-col fixed inset-y-0">
        <AdminSidebar onClose={() => {}} onLogout={logout} />
      </aside>
      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <AdminSidebar onClose={() => setMobileOpen(false)} onLogout={logout} />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-sm">Admin Panel</span>
            <div />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}