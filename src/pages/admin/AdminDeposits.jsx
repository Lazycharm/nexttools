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

    // Also credit user balance
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
    queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    toast.success('Deposit approved and balance credited');
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