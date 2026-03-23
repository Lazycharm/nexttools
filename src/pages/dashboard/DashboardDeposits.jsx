import React, { useEffect, useMemo, useState } from 'react';
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
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const checkoutAmount = searchParams.get('amount') || '';
  const checkoutPurpose = searchParams.get('purpose') || '';
  const checkoutKind = searchParams.get('kind') || '';
  const checkoutServiceId = searchParams.get('serviceId') || '';
  const checkoutServiceTitle = searchParams.get('serviceTitle') || '';
  const checkoutCategory = searchParams.get('category') || '';
  const checkoutPackageName = searchParams.get('packageName') || '';
  const checkoutQuantity = Number(searchParams.get('quantity') || 1);
  const checkoutPlanName = searchParams.get('planName') || '';
  const checkoutPlanTier = searchParams.get('planTier') || '';
  const checkoutBilling = searchParams.get('billing') || '';
  const checkoutNumberId = searchParams.get('numberId') || '';
  const checkoutCountry = searchParams.get('country') || '';
  const checkoutNumberType = searchParams.get('numberType') || '';
  const checkoutProfileId = searchParams.get('profileId') || '';
  const checkoutProfileTitle = searchParams.get('profileTitle') || '';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ crypto_type: 'USDT', network: 'TRC20', amount_crypto: '', tx_hash: '' });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (checkoutAmount) {
      setDialogOpen(true);
      setForm((prev) => ({ ...prev, amount_crypto: '' }));
    }
  }, [checkoutAmount]);

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['my-deposits', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('deposits').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: appSettings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('key,value');
      if (error) throw error;
      return data ?? [];
    },
  });

  const createDeposit = useMutation({
    mutationFn: async (data) => {
      const { data: inserted, error } = await supabase.from('deposits').insert(data).select().maybeSingle();
      if (error) throw error;

      if (checkoutKind) {
        const amount = Number(data.amount || checkoutAmount || 0);

        if (checkoutKind === 'service') {
          const { error: orderError } = await supabase.from('orders').insert({
            user_email: user.email,
            service_id: checkoutServiceId || null,
            service_title: checkoutServiceTitle || checkoutPurpose || 'Service',
            category: checkoutCategory || 'service',
            package_name: `${checkoutPackageName || 'Package'} (Crypto)`,
            quantity: checkoutQuantity || 1,
            amount,
            payment_method: 'crypto',
            status: 'pending',
            notes: `awaiting_deposit:${inserted?.id || ''}`,
          });
          if (orderError) throw orderError;
        }

        if (checkoutKind === 'subscription') {
          const { error: orderError } = await supabase.from('orders').insert({
            user_email: user.email,
            service_title: `${checkoutPlanName || 'Plan'} Subscription`,
            category: 'subscriptions',
            package_name: `${checkoutPlanName || 'Plan'} (${checkoutBilling || 'monthly'}) - Crypto`,
            quantity: 1,
            amount,
            payment_method: 'crypto',
            status: 'pending',
            notes: `plan_tier:${checkoutPlanTier || ''}; awaiting_deposit:${inserted?.id || ''}`,
          });
          if (orderError) throw orderError;
        }

        if (checkoutKind === 'dating_guide') {
          const { error: orderError } = await supabase.from('orders').insert({
            user_email: user.email,
            service_title: 'Dating Guide Access',
            category: 'dating_guide',
            package_name: 'Guide Unlock (Crypto)',
            quantity: 1,
            amount,
            payment_method: 'crypto',
            status: 'pending',
            notes: `awaiting_deposit:${inserted?.id || ''}`,
          });
          if (orderError) throw orderError;
        }

        if (checkoutKind === 'virtual_number') {
          const { error: orderError } = await supabase.from('orders').insert({
            user_email: user.email,
            service_id: checkoutServiceId || null,
            service_title: checkoutServiceTitle || 'Virtual Number',
            category: 'virtual_numbers',
            package_name: `${checkoutCountry || 'Number'} ${checkoutNumberType || 'sms'} (Crypto)`,
            quantity: 1,
            amount,
            payment_method: 'crypto',
            status: 'pending',
            notes: `virtual_number_id:${checkoutNumberId || ''}; awaiting_deposit:${inserted?.id || ''}`,
          });
          if (orderError) throw orderError;
        }

        if (checkoutKind === 'verified_profile') {
          const { error: orderError } = await supabase.from('orders').insert({
            user_email: user.email,
            service_title: checkoutProfileTitle || 'Verified Profile',
            category: 'verified_profile',
            package_name: `${checkoutProfileTitle || 'Profile'} (Crypto)`,
            quantity: 1,
            amount,
            payment_method: 'crypto',
            status: 'pending',
            notes: `verified_profile_id:${checkoutProfileId || ''}; awaiting_deposit:${inserted?.id || ''}`,
          });
          if (orderError) throw orderError;
        }
      }

      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setDialogOpen(false);
      setForm({ crypto_type: 'USDT', network: 'TRC20', amount_crypto: '', tx_hash: '' });
      toast.success('Deposit submitted for review');
    },
  });

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied');
  };

  const settingsMap = appSettings.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  const configuredAddresses = {
    'USDT-TRC20': settingsMap.wallet_usdt_trc20 || walletAddresses['USDT-TRC20'],
    'USDT-ERC20': settingsMap.wallet_usdt_erc20 || walletAddresses['USDT-ERC20'],
    'ETH-ERC20': settingsMap.wallet_eth || walletAddresses['ETH-ERC20'],
    'BTC-BTC': settingsMap.wallet_btc || walletAddresses['BTC-BTC'],
  };

  const addressKey = `${form.crypto_type}-${form.network}`;
  const walletAddr = configuredAddresses[addressKey] || configuredAddresses['USDT-TRC20'];

  const configuredRates = {
    USDT: Number(settingsMap.rate_usdt || 1),
    ETH: Number(settingsMap.rate_eth || 3000),
    BTC: Number(settingsMap.rate_btc || 60000),
  };

  const selectedRate = configuredRates[form.crypto_type] || 1;
  const cryptoAmount = Number(form.amount_crypto || 0);
  const convertedUsd = Number((cryptoAmount * selectedRate).toFixed(2));
  const usdAmount = checkoutAmount ? Number(checkoutAmount) : convertedUsd;

  const handleSubmit = () => {
    if (!form.amount_crypto || cryptoAmount <= 0) return;
    if (!usdAmount || usdAmount <= 0) return;
    createDeposit.mutate({
      user_email: user.email,
      amount: usdAmount,
      crypto_type: form.crypto_type,
      network: form.network,
      wallet_address: walletAddr,
      tx_hash: form.tx_hash,
      status: 'pending',
      admin_notes: [
        `crypto_amount:${cryptoAmount}`,
        `rate:${selectedRate}`,
        `usd_amount:${usdAmount}`,
        checkoutKind ? `checkout_kind:${checkoutKind}` : null,
        checkoutPurpose ? `purpose:${checkoutPurpose}` : null,
      ]
        .filter(Boolean)
        .join('; '),
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
                <Label className="text-xs">Amount ({form.crypto_type})</Label>
                <Input
                  type="number"
                  placeholder={form.crypto_type === 'USDT' ? '100' : form.crypto_type === 'ETH' ? '0.05' : '0.002'}
                  value={form.amount_crypto}
                  onChange={(e) => setForm({ ...form, amount_crypto: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Rate: 1 {form.crypto_type} = ${selectedRate.toLocaleString()} USD
                </p>
                <p className="text-xs text-muted-foreground">
                  {checkoutAmount
                    ? `Order requires fixed $${Number(checkoutAmount).toFixed(2)} USD credit`
                    : `Converted amount: $${convertedUsd.toFixed(2)} USD`}
                </p>
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

      {checkoutKind && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold">Checkout in progress</p>
            <p className="text-xs text-muted-foreground mt-1">
              Purpose: {checkoutPurpose || 'Order payment'} · Amount (USD): ${checkoutAmount || '0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Submit your payment proof to create a pending order tied to this checkout.
            </p>
          </CardContent>
        </Card>
      )}

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