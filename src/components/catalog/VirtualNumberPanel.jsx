import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Lock, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InsufficientBalanceDialog from '@/components/checkout/InsufficientBalanceDialog';

export default function VirtualNumberPanel({ service }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [country, setCountry] = useState('US');
  const [insufficientNumber, setInsufficientNumber] = useState(null);

  const { data: numbers = [] } = useQuery({
    queryKey: ['virtual-numbers', country],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_numbers')
        .select('id,country_code,country_name,number_masked,number_type,provider,price,is_available')
        .eq('country_code', country)
        .eq('is_available', true)
        .order('price', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: unlocked = [] } = useQuery({
    queryKey: ['my-virtual-numbers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_number_orders')
        .select('virtual_number_id, virtual_numbers(id, country_name, number_value, number_type, provider)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const unlockedMap = useMemo(() => {
    const map = new Map();
    unlocked.forEach((entry) => {
      if (entry?.virtual_numbers?.id) map.set(entry.virtual_numbers.id, entry.virtual_numbers);
    });
    return map;
  }, [unlocked]);

  const purchaseNumber = useMutation({
    mutationFn: async (number) => {
      if (!isAuthenticated || !user?.id || !user?.email) {
        throw new Error('Please sign in to unlock numbers');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const balance = profile?.wallet_balance || 0;
      const amount = Number(number.price || service.base_price || 0);
      if (balance < amount) {
        throw new Error('Insufficient wallet balance. Please deposit funds.');
      }

      const { data: lockRow, error: lockError } = await supabase
        .from('virtual_numbers')
        .update({ is_available: false })
        .eq('id', number.id)
        .eq('is_available', true)
        .select('*')
        .maybeSingle();
      if (lockError) throw lockError;
      if (!lockRow) throw new Error('Number is no longer available. Please choose another.');

      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: balance - amount })
        .eq('id', user.id);
      if (walletError) throw walletError;

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_email: user.email,
          service_id: service.id,
          service_title: service.title,
          category: 'virtual_numbers',
          package_name: `${number.country_name} ${number.number_type}`.trim(),
          quantity: 1,
          amount,
          payment_method: 'wallet',
          status: 'completed',
          notes: `virtual_number_id:${number.id}`,
        })
        .select('id')
        .maybeSingle();
      if (orderError) throw orderError;

      const { error: vOrderError } = await supabase.from('virtual_number_orders').insert({
        user_id: user.id,
        user_email: user.email,
        virtual_number_id: number.id,
        order_id: orderRow?.id ?? null,
        amount,
        status: 'approved',
      });
      if (vOrderError) throw vOrderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['my-virtual-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Number unlocked and payment approved');
    },
    onError: (error) => {
      const message = error?.message || 'Failed to unlock number';
      toast.error(message);
      if (message.toLowerCase().includes('sign in')) navigate('/auth');
      if (message.toLowerCase().includes('insufficient')) return;
    },
  });

  const cryptoNumberMutation = useMutation({
    mutationFn: async (number) => {
      if (!isAuthenticated || !user?.email) throw new Error('Please sign in to continue');
      const amount = Number(number.price || service.base_price || 0);
      return { amount, purpose: `${number.country_name} virtual number`, number };
    },
    onSuccess: ({ amount, purpose, number }) => {
      navigate(
        `/dashboard/deposits?amount=${amount}&purpose=${encodeURIComponent(
          purpose
        )}&kind=virtual_number&numberId=${number.id}&serviceId=${service.id}&serviceTitle=${encodeURIComponent(
          service.title
        )}&country=${encodeURIComponent(number.country_name)}&numberType=${encodeURIComponent(number.number_type)}`
      );
      toast.success('Complete deposit to unlock this number.');
    },
    onError: (error) => {
      toast.error(error?.message || 'Could not start crypto checkout');
      if ((error?.message || '').toLowerCase().includes('sign in')) navigate('/auth');
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Virtual Number Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe2 className="w-4 h-4 text-muted-foreground" />
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
                <SelectItem value="AE">UAE</SelectItem>
                <SelectItem value="ZA">South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {numbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No numbers currently available for this country.</p>
          ) : (
            <div className="space-y-2">
              {numbers.map((number) => {
                const unlockedNumber = unlockedMap.get(number.id);
                return (
                  <div
                    key={number.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {unlockedNumber?.number_value || number.number_masked}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{number.country_name}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{number.number_type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="text-sm font-semibold">${number.price}</span>
                      {unlockedNumber ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(unlockedNumber.number_value);
                            toast.success('Number copied');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => purchaseNumber.mutate(number, {
                              onError: (error) => {
                                const message = error?.message || '';
                                if (message.toLowerCase().includes('insufficient')) {
                                  setInsufficientNumber(number);
                                }
                              },
                            })}
                            disabled={purchaseNumber.isPending || cryptoNumberMutation.isPending}
                          >
                            <Lock className="w-4 h-4 mr-1" />
                            {purchaseNumber.isPending ? 'Unlocking...' : 'Pay with Balance'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cryptoNumberMutation.mutate(number)}
                            disabled={purchaseNumber.isPending || cryptoNumberMutation.isPending}
                          >
                            {cryptoNumberMutation.isPending ? 'Starting...' : 'Pay with Crypto'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {unlocked.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Unlocked Numbers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unlocked.slice(0, 8).map((entry) => (
              <div key={entry.virtual_number_id} className="flex items-center gap-2">
                <Input value={entry.virtual_numbers?.number_value || ''} readOnly className="font-mono text-xs" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (entry.virtual_numbers?.number_value) {
                      navigator.clipboard.writeText(entry.virtual_numbers.number_value);
                      toast.success('Number copied');
                    }
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <InsufficientBalanceDialog
        open={!!insufficientNumber}
        onOpenChange={(open) => !open && setInsufficientNumber(null)}
        amount={Number(insufficientNumber?.price || service?.base_price || 0)}
        loading={purchaseNumber.isPending || cryptoNumberMutation.isPending}
        onDeposit={() => {
          setInsufficientNumber(null);
          navigate('/dashboard/deposits');
        }}
        onPayWithCrypto={() => {
          if (!insufficientNumber) return;
          const target = insufficientNumber;
          setInsufficientNumber(null);
          cryptoNumberMutation.mutate(target);
        }}
      />
    </div>
  );
}
