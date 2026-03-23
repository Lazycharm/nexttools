import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const walletAddresses = {
  'USDT-TRC20': 'TN8sDr5Lfb4iF9qc7sRn2k4EZx3Vf7PjhK',
  'USDT-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  'ETH-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  'BTC-BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
};

export default function DashboardDeposits() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ crypto_type: 'USDT', network: 'TRC20', amount: '', tx_hash: '' });
  const queryClient = useQueryClient();

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['my-deposits', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('deposits').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const createDeposit = useMutation({
    mutationFn: async (data) => {
      const { data: inserted, error } = await supabase.from('deposits').insert(data).select();
      if (error) throw error;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deposits'] });
      setDialogOpen(false);
      setForm({ crypto_type: 'USDT', network: 'TRC20', amount: '', tx_hash: '' });
      toast.success('Deposit submitted for review');
    },
  });

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied');
  };

  const addressKey = `${form.crypto_type}-${form.network}`;
  const walletAddr = walletAddresses[addressKey] || walletAddresses['USDT-TRC20'];

  const handleSubmit = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    createDeposit.mutate({
      user_email: user.email,
      amount: parseFloat(form.amount),
      crypto_type: form.crypto_type,
      network: form.network,
      wallet_address: walletAddr,
      tx_hash: form.tx_hash,
      status: 'pending',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deposits</h1>
          <p className="text-muted-foreground text-sm mt-1">Fund your wallet with cryptocurrency</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Deposit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Make a Deposit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cryptocurrency</Label>
                  <Select value={form.crypto_type} onValueChange={(v) => setForm({ ...form, crypto_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Network</Label>
                  <Select value={form.network} onValueChange={(v) => setForm({ ...form, network: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {form.crypto_type === 'USDT' && <><SelectItem value="TRC20">TRC-20</SelectItem><SelectItem value="ERC20">ERC-20</SelectItem></>}
                      {form.crypto_type === 'ETH' && <SelectItem value="ERC20">ERC-20</SelectItem>}
                      {form.crypto_type === 'BTC' && <SelectItem value="BTC">Bitcoin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Send to this address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={walletAddr} readOnly className="text-xs font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copyAddress(walletAddr)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Only send {form.crypto_type} on {form.network} network</p>
              </div>

              <div>
                <Label className="text-xs">Amount (USD)</Label>
                <Input type="number" placeholder="100.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>

              <div>
                <Label className="text-xs">Transaction Hash (optional)</Label>
                <Input placeholder="0x..." value={form.tx_hash} onChange={(e) => setForm({ ...form, tx_hash: e.target.value })} />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={createDeposit.isPending}>
                {createDeposit.isPending ? 'Submitting...' : 'Submit Deposit'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Deposits are reviewed and credited within 24 hours</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : deposits.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No deposits yet</TableCell></TableRow>
              ) : (
                deposits.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-medium">{dep.crypto_type}</TableCell>
                    <TableCell className="text-muted-foreground">{dep.network}</TableCell>
                    <TableCell className="font-semibold">${dep.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${dep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : dep.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>
                        {dep.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {dep.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {dep.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {dep.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(dep.created_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}