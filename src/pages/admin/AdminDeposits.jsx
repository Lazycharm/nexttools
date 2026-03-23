import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDeposits() {
  const queryClient = useQueryClient();
  const parseNotes = (text) => {
    const result = {};
    `${text || ''}`
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        const idx = part.indexOf(':');
        if (idx > 0) {
          const key = part.slice(0, idx).trim();
          const value = part.slice(idx + 1).trim();
          result[key] = value;
        }
      });
    return result;
  };

  const { data: deposits = [] } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deposits').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateDeposit = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updated, error } = await supabase.from('deposits').update(data).eq('id', id).select();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      toast.success('Deposit updated');
    },
  });

  const handleApprove = async (deposit) => {
    const { data: approvedRow, error: approveError } = await supabase
      .from('deposits')
      .update({ status: 'approved', credited_amount: deposit.amount })
      .eq('id', deposit.id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle();
    if (approveError) throw approveError;
    if (!approvedRow) {
      toast.error('Deposit was already processed');
      return;
    }

    const notesMap = parseNotes(approvedRow.admin_notes);
    const checkoutKind = notesMap.checkout_kind || '';

    // For checkout-linked crypto payments, complete linked orders/subscriptions.
    // Do NOT credit wallet balance in this branch.
    if (checkoutKind) {
      const { data: linkedOrders, error: linkedError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', deposit.user_email)
        .ilike('notes', `%awaiting_deposit:${deposit.id}%`);
      if (linkedError) throw linkedError;

      for (const order of linkedOrders || []) {
        if (order.status === 'pending') {
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', order.id);
          if (orderUpdateError) throw orderUpdateError;
        }

        if (order.category === 'subscriptions') {
          const now = new Date();
          const end = new Date(now);
          const pkg = `${order.package_name || ''}`.toLowerCase();
          const billing = pkg.includes('yearly') ? 'yearly' : pkg.includes('quarterly') ? 'quarterly' : 'monthly';
          if (billing === 'yearly') end.setFullYear(end.getFullYear() + 1);
          if (billing === 'quarterly') end.setMonth(end.getMonth() + 3);
          if (billing === 'monthly') end.setMonth(end.getMonth() + 1);

          const planTierMatch = `${order.notes || ''}`.match(/plan_tier:([^;]+)/i);
          const planTier = planTierMatch?.[1]?.trim() || 'growth';
          const planName = `${order.service_title || 'Plan'}`.replace(/\s+Subscription$/i, '').trim();

          const { error: subError } = await supabase.from('subscriptions').insert({
            user_email: order.user_email,
            plan_name: planName || 'Plan',
            plan_tier: planTier,
            price: Number(order.amount || approvedRow.amount || 0),
            billing_cycle: billing,
            status: 'active',
            start_date: now.toISOString().slice(0, 10),
            end_date: end.toISOString().slice(0, 10),
            auto_renew: true,
          });
          if (subError) throw subError;
        }
      }
    } else {
      // Normal wallet top-up deposit: credit user balance.
      const { data: user } = await supabase.from('profiles').select('*').eq('email', deposit.user_email).maybeSingle();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            wallet_balance: (user.wallet_balance || 0) + deposit.amount,
            total_deposits: (user.total_deposits || 0) + deposit.amount,
          })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['my-deposits'] });
    queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    queryClient.invalidateQueries({ queryKey: ['my-subs'] });
    queryClient.invalidateQueries({ queryKey: ['admin-subs-list'] });
    toast.success(checkoutKind ? 'Checkout approved and order activated' : 'Deposit approved and balance credited');
  };

  const handleReject = (deposit) => {
    updateDeposit.mutate({ id: deposit.id, data: { status: 'rejected' } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deposits</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve crypto deposits</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>TX Hash</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-sm">{d.user_email}</TableCell>
                <TableCell className="font-medium">{d.crypto_type}</TableCell>
                <TableCell className="text-muted-foreground">{d.network}</TableCell>
                <TableCell className="font-semibold">${d.amount}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{d.tx_hash || '—'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-xs ${d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : d.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(d.created_at), 'MMM d')}</TableCell>
                <TableCell>
                  {d.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => handleApprove(d)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleReject(d)}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {deposits.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No deposits</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}