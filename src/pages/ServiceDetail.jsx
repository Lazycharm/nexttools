import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Clock, Check, ArrowLeft, LifeBuoy, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import VirtualNumberPanel from '@/components/catalog/VirtualNumberPanel';
import InsufficientBalanceDialog from '@/components/checkout/InsufficientBalanceDialog';

export default function ServiceDetail() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const serviceId = window.location.pathname.split('/').pop();
  const [insufficientPayload, setInsufficientPayload] = React.useState(null);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const service = services.find((s) => s.id === serviceId);
  const relatedServices = services.filter((s) => s.category === service?.category && s.id !== serviceId).slice(0, 3);

  const purchaseMutation = useMutation({
    mutationFn: async ({ packageName, amount, quantity = 1 }) => {
      if (!isAuthenticated || !user?.id || !user?.email) {
        throw new Error('Please sign in to place an order');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const walletBalance = profile?.wallet_balance || 0;
      if (walletBalance < amount) {
        throw new Error('Insufficient wallet balance. Please make a deposit first.');
      }

      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: walletBalance - amount })
        .eq('id', user.id);
      if (walletError) throw walletError;

      const { error: orderError } = await supabase.from('orders').insert({
        user_email: user.email,
        service_id: service.id,
        service_title: service.title,
        category: service.category,
        package_name: packageName,
        quantity,
        amount,
        payment_method: 'wallet',
        delivery_estimate: service.delivery_estimate,
        status: 'pending',
      });
      if (orderError) throw orderError;

      await supabase
        .from('services')
        .update({ total_orders: (service.total_orders || 0) + 1 })
        .eq('id', service.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Order placed successfully');
      navigate('/dashboard/orders');
    },
    onError: (error) => {
      const message = error?.message || 'Failed to place order';
      toast.error(message);
      if (message.toLowerCase().includes('insufficient')) return;
      if (message.toLowerCase().includes('sign in')) {
        navigate('/auth');
      }
    },
  });

  const purchasePackage = (pkg) => {
    const payload = {
      packageName: pkg?.name || 'Base Package',
      amount: Number(pkg?.price || service?.base_price || 0),
      quantity: Number(pkg?.quantity || 1),
    };
    purchaseMutation.mutate(payload, {
      onError: (error) => {
        const message = error?.message || '';
        if (message.toLowerCase().includes('insufficient')) {
          setInsufficientPayload(payload);
        }
      },
    });
  };

  const cryptoOrderMutation = useMutation({
    mutationFn: async ({ packageName, amount, quantity = 1 }) => {
      if (!isAuthenticated || !user?.email) throw new Error('Please sign in to continue');
      return { packageName, amount, quantity };
    },
    onSuccess: (variables) => {
      navigate(
        `/dashboard/deposits?amount=${variables.amount}&purpose=${encodeURIComponent(service.title)}&kind=service&serviceId=${service.id}&serviceTitle=${encodeURIComponent(
          service.title
        )}&category=${encodeURIComponent(service.category || 'service')}&packageName=${encodeURIComponent(
          variables.packageName
        )}&quantity=${variables.quantity}`
      );
      toast.success('Complete deposit to place this crypto order.');
    },
    onError: (error) => {
      toast.error(error?.message || 'Could not start crypto checkout');
      if ((error?.message || '').toLowerCase().includes('sign in')) navigate('/auth');
    },
  });

  const payWithCrypto = (pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }
    cryptoOrderMutation.mutate({
      packageName: pkg?.name || 'Base Package',
      amount: Number(pkg?.price || service?.base_price || 0),
      quantity: Number(pkg?.quantity || 1),
    });
  };

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground">Loading service...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="capitalize">{service.category?.replace(/_/g, ' ')}</Badge>
              {service.quality_badge && <Badge className="bg-primary/10 text-primary">{service.quality_badge}</Badge>}
              {service.is_featured && <Badge className="bg-amber-500/10 text-amber-600">Featured</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">{service.subtitle}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {service.rating && (
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {service.rating}</span>
              )}
              {service.delivery_estimate && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {service.delivery_estimate}</span>
              )}
              {service.total_orders > 0 && <span>{service.total_orders.toLocaleString()} orders</span>}
            </div>
          </div>

          {service.description && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{service.description}</p>
              </CardContent>
            </Card>
          )}

          {service.features?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Features</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="grid sm:grid-cols-2 gap-2">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {service.packages?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Available Packages</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.packages.map((pkg, i) => (
                  <Card key={i} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-3">${pkg.price}</p>
                      {pkg.features?.length > 0 && (
                        <ul className="space-y-1">
                          {pkg.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button
                        className="w-full mt-4"
                        size="sm"
                        disabled={purchaseMutation.isPending || cryptoOrderMutation.isPending}
                        onClick={() => purchasePackage(pkg)}
                      >
                        {purchaseMutation.isPending ? 'Processing...' : 'Select Package'}
                      </Button>
                      <Button
                        className="w-full mt-2"
                        variant="ghost"
                        size="sm"
                        disabled={purchaseMutation.isPending || cryptoOrderMutation.isPending}
                        onClick={() => payWithCrypto(pkg)}
                      >
                        {cryptoOrderMutation.isPending ? 'Starting crypto checkout...' : 'Pay with Crypto'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {service.faq?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">FAQ</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {service.faq.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg border px-4">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {service.category === 'virtual_numbers' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Available Numbers</h2>
              <VirtualNumberPanel service={service} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-4xl font-extrabold text-foreground mt-1">${service.base_price}</p>
              </div>
              <Button
                className="w-full mb-3"
                size="lg"
                disabled={purchaseMutation.isPending || cryptoOrderMutation.isPending}
                onClick={() => purchasePackage(null)}
              >
                {purchaseMutation.isPending ? 'Processing...' : 'Purchase Now'}
              </Button>
              <Button
                variant="outline"
                className="w-full mb-3"
                size="lg"
                disabled={purchaseMutation.isPending || cryptoOrderMutation.isPending}
                onClick={() => purchasePackage(null)}
              >
                {purchaseMutation.isPending ? 'Processing...' : 'Quick Buy'}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                size="sm"
                disabled={purchaseMutation.isPending || cryptoOrderMutation.isPending}
                onClick={() => payWithCrypto(null)}
              >
                {cryptoOrderMutation.isPending ? 'Starting crypto checkout...' : 'Pay with Crypto Instead'}
              </Button>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" /> Secure payment
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" /> {service.delivery_estimate || 'Fast delivery'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LifeBuoy className="w-4 h-4 text-primary" /> 24/7 support
                </div>
              </div>
            </CardContent>
          </Card>

          {relatedServices.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Related Services</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {relatedServices.map((rs) => (
                  <Link key={rs.id} to={`/service/${rs.id}`} className="flex items-center justify-between py-2 hover:bg-accent rounded-md px-2 -mx-2 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{rs.title}</p>
                      <p className="text-xs text-muted-foreground">${rs.base_price}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <InsufficientBalanceDialog
        open={!!insufficientPayload}
        onOpenChange={(open) => !open && setInsufficientPayload(null)}
        amount={insufficientPayload?.amount || 0}
        loading={purchaseMutation.isPending || cryptoOrderMutation.isPending}
        onDeposit={() => {
          setInsufficientPayload(null);
          navigate('/dashboard/deposits');
        }}
        onPayWithCrypto={() => {
          if (!insufficientPayload) return;
          const payload = insufficientPayload;
          setInsufficientPayload(null);
          cryptoOrderMutation.mutate(payload);
        }}
      />
    </div>
  );
}