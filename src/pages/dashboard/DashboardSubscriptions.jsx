import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardSubscriptions() {
  const { user } = useAuth();

  const { data: subs = [] } = useQuery({
    queryKey: ['my-subs', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const tierColors = {
    starter: 'bg-secondary text-secondary-foreground',
    growth: 'bg-blue-500/10 text-blue-600',
    pro: 'bg-purple-500/10 text-purple-600',
    elite: 'bg-amber-500/10 text-amber-600',
    agency: 'bg-emerald-500/10 text-emerald-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your active plans</p>
      </div>

      {subs.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No active subscriptions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {subs.map((sub) => (
            <Card key={sub.id} className={sub.status === 'active' ? 'border-primary/20' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{sub.plan_name}</h3>
                    <Badge variant="secondary" className={`text-xs mt-1 ${tierColors[sub.plan_tier] || ''}`}>{sub.plan_tier}</Badge>
                  </div>
                  <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="text-xs">{sub.status}</Badge>
                </div>
                <p className="text-2xl font-bold">${sub.price}<span className="text-sm font-normal text-muted-foreground">/{sub.billing_cycle}</span></p>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {sub.start_date && (
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Started {format(new Date(sub.start_date), 'MMM d, yyyy')}</div>
                  )}
                  {sub.end_date && (
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Expires {format(new Date(sub.end_date), 'MMM d, yyyy')}</div>
                  )}
                  {sub.auto_renew && (
                    <div className="flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5" /> Auto-renewal enabled</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}