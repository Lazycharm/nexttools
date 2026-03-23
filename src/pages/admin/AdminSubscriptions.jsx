import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminSubscriptions() {
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-subs-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">{subs.filter((s) => s.status === 'active').length} active subscriptions</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : subs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-sm">{sub.user_email}</TableCell>
                  <TableCell className="font-medium">{sub.plan_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs capitalize">{sub.plan_tier}</Badge></TableCell>
                  <TableCell className="font-semibold">${sub.price}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{sub.billing_cycle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sub.end_date ? format(new Date(sub.end_date), 'MMM d, yyyy') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}