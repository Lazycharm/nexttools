import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, ShoppingCart, Wallet, CreditCard, LifeBuoy,
  Settings, Bell, History, Star, Menu, LogOut, Store, Tags
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppLogo from '@/components/common/AppLogo';

const sidebarLinks = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Browse Services', path: '/catalog', icon: Store },
  { label: 'Pricing Plans', path: '/pricing', icon: Tags },
  { label: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
  { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: Star },
  { label: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
  { label: 'Deposits', path: '/dashboard/deposits', icon: CreditCard },
  { label: 'Support', path: '/dashboard/support', icon: LifeBuoy },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { label: 'History', path: '/dashboard/history', icon: History },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

function SidebarContent({ user, onClose, onLogout }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <AppLogo size={32} />
          <span className="text-lg font-bold tracking-tight">ToolStack</span>
        </Link>
      </div>
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {(user?.full_name || 'U').charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {sidebarLinks.map((link) => {
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
        <div className="px-3 py-2 rounded-lg bg-primary/5 mb-2">
          <p className="text-xs text-muted-foreground">Wallet Balance</p>
          <p className="text-lg font-bold text-primary">${(user?.wallet_balance || 0).toFixed(2)}</p>
        </div>
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

export default function DashboardLayout() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col fixed inset-y-0">
        <SidebarContent user={user} onClose={() => {}} onLogout={logout} />
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent user={user} onClose={() => setMobileOpen(false)} onLogout={logout} />
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <AppLogo size={28} rounded="rounded-md" />
              <span className="font-bold">ToolStack</span>
            </Link>
            <Link to="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Wallet className="w-3.5 h-3.5" />
                ${(user?.wallet_balance || 0).toFixed(2)}
              </Button>
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}