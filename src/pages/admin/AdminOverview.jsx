import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, CreditCard, Package, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-destructive/10 text-destructive',
  open: 'bg-blue-500/10 text-blue-600',
  processing: 'bg-purple-500/10 text-purple-600',
  completed: 'bg-primary/10 text-primary',
};

export default function AdminOverview() {
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: async () => (await supabase.from('orders').select('*').order('created_at', { ascending: false })).data ?? [] });
  const { data: deposits = [] } = useQuery({ queryKey: ['admin-deposits'], queryFn: async () => (await supabase.from('deposits').select('*').order('created_at', { ascending: false })).data ?? [] });
  const { data: tickets = [] } = useQuery({ queryKey: ['admin-tickets'], queryFn: async () => (await supabase.from('tickets').select('*').order('created_at', { ascending: false })).data ?? [] });
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: async () => (await supabase.from('services').select('*').order('created_at', { ascending: false })).data ?? [] });

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const openTickets = tickets.filter((t) => ['open', 'in_progress'].includes(t.status));
  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + (o.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingCart} />
        <StatCard title="Pending Deposits" value={pendingDeposits.length} icon={CreditCard} />
        <StatCard title="Open Tickets" value={openTickets.length} icon={Clock} />
        <StatCard title="Active Services" value={services.filter((s) => s.status === 'active').length} icon={Package} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.service_title}</p>
                    <p className="text-xs text-muted-foreground">{order.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${order.amount}</p>
                    <Badge variant="secondary" className={`text-xs ${statusColors[order.status] || ''}`}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Pending Deposits</CardTitle></CardHeader>
          <CardContent>
            {pendingDeposits.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No pending deposits</p>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.slice(0, 5).map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{dep.user_email}</p>
                      <p className="text-xs text-muted-foreground">{dep.crypto_type} · {dep.network}</p>
                    </div>
                    <p className="text-sm font-semibold">${dep.amount}</p>
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