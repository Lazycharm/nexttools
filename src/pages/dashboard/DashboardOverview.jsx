import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import { Wallet, ShoppingCart, CreditCard, Star, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-600',
  processing: 'bg-blue-500/10 text-blue-600',
  active: 'bg-emerald-500/10 text-emerald-600',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subs', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ['my-deposits', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('deposits').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const activeOrders = orders.filter((o) => ['active', 'processing'].includes(o.status));
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's an overview of your account activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Wallet Balance" value={`$${(user?.wallet_balance || 0).toFixed(2)}`} subtitle="Available to spend" icon={Wallet} />
        <StatCard title="Total Deposits" value={`$${(user?.total_deposits || 0).toFixed(2)}`} subtitle="All time" icon={CreditCard} />
        <StatCard title="Active Orders" value={activeOrders.length} subtitle={`${orders.length} total orders`} icon={ShoppingCart} />
        <StatCard title="Subscriptions" value={activeSubs.length} subtitle="Currently active" icon={Star} />
      </div>

      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Ready to place a new order?</p>
            <p className="text-sm text-muted-foreground">Browse services or compare plans directly from your dashboard.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/catalog">
              <Button size="sm">Browse Services</Button>
            </Link>
            <Link to="/pricing">
              <Button size="sm" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Link to="/dashboard/orders"><Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="w-3 h-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{order.service_title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${order.amount}</p>
                      <Badge variant="secondary" className={`text-xs ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Deposits</CardTitle>
              <Link to="/dashboard/deposits"><Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="w-3 h-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {deposits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No deposits yet</p>
            ) : (
              <div className="space-y-3">
                {deposits.slice(0, 5).map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dep.status === 'approved' ? 'bg-emerald-500/10' : dep.status === 'rejected' ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
                        {dep.status === 'approved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : dep.status === 'rejected' ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{dep.crypto_type} Deposit</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(dep.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${dep.amount}</p>
                      <Badge variant="secondary" className={`text-xs ${dep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : dep.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>
                        {dep.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}