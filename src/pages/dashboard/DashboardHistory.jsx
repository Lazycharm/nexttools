import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ShoppingCart, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardHistory() {
  const { user } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders-history', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ['my-deposits-history', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('deposits').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const events = [
    ...orders.map((o) => ({ ...o, _type: 'order', _date: o.created_at })),
    ...deposits.map((d) => ({ ...d, _type: 'deposit', _date: d.created_at })),
  ].sort((a, b) => new Date(b._date) - new Date(a._date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground text-sm mt-1">All your transactions and orders</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No activity yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={`${event._type}-${event.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${event._type === 'order' ? 'bg-primary/10' : 'bg-emerald-500/10'}`}>
                  {event._type === 'order'
                    ? <ShoppingCart className="w-4 h-4 text-primary" />
                    : <CreditCard className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {event._type === 'order' ? event.service_title : `${event.crypto_type} Deposit`}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(event._date), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${event.amount}</p>
                  <Badge variant="secondary" className="text-xs">{event.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}