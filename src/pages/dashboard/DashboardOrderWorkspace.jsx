import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, KeyRound, MessageSquareText, PlusCircle } from 'lucide-react';

export default function DashboardOrderWorkspace() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [otpTarget, setOtpTarget] = useState('');
  const [otpLog, setOtpLog] = useState([]);

  const otpStorageKey = useMemo(() => `otp_workspace_${orderId}`, [orderId]);

  const { data: order, isLoading } = useQuery({
    queryKey: ['my-order-workspace', orderId, user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_email', user.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId && !!user?.email,
  });

  useEffect(() => {
    const raw = localStorage.getItem(otpStorageKey);
    if (!raw) return;
    try {
      setOtpLog(JSON.parse(raw));
    } catch {
      setOtpLog([]);
    }
  }, [otpStorageKey]);

  const isOtpPack = useMemo(() => {
    const serviceTitle = `${order?.service_title || ''}`.toLowerCase();
    const packageName = `${order?.package_name || ''}`.toLowerCase();
    return serviceTitle.includes('otp') || packageName.includes('otp') || packageName.includes('virtual');
  }, [order]);

  const totalCredits = Number(order?.quantity || 0) || 50;
  const usedCredits = otpLog.length;
  const remainingCredits = Math.max(totalCredits - usedCredits, 0);

  const generateOtp = () => {
    if (!otpTarget.trim()) {
      toast.error('Enter destination/app first');
      return;
    }
    if (remainingCredits <= 0) {
      toast.error('No credits left in this demo pack');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const entry = {
      id: crypto.randomUUID(),
      target: otpTarget.trim(),
      code,
      created_at: new Date().toISOString(),
      status: 'delivered',
    };
    const next = [entry, ...otpLog].slice(0, 50);
    setOtpLog(next);
    localStorage.setItem(otpStorageKey, JSON.stringify(next));
    setOtpTarget('');
    toast.success(`Demo OTP ${code} generated`);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading workspace...</p>;
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Order not found or you do not have access.</p>
          <Link to="/dashboard/orders">
            <Button className="mt-4" size="sm">Back to Orders</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Workspace</h1>
          <p className="text-sm text-muted-foreground">
            {order.service_title} · {order.package_name || 'Package'}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">{order.status}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Purchase Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><span className="text-muted-foreground">Amount:</span> ${order.amount}</p>
          <p><span className="text-muted-foreground">Payment:</span> {order.payment_method || 'wallet'}</p>
          <p><span className="text-muted-foreground">Category:</span> {order.category || 'service'}</p>
        </CardContent>
      </Card>

      {isOtpPack ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> OTP Pack Console (Demo)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Purchased Credits</p>
                  <p className="text-lg font-bold">{totalCredits}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Used</p>
                  <p className="text-lg font-bold">{usedCredits}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold">{remainingCredits}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Destination/App</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Telegram, Bumble, TikTok"
                    value={otpTarget}
                    onChange={(e) => setOtpTarget(e.target.value)}
                  />
                  <Button onClick={generateOtp} disabled={remainingCredits <= 0}>
                    <PlusCircle className="w-4 h-4 mr-1" /> Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" /> OTP History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {otpLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No OTP sessions yet. Generate your first code.</p>
              ) : (
                otpLog.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{entry.target}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tracking-widest">{entry.code}</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {entry.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your purchase is active in your account history. For service-specific credentials or delivery files,
              check notifications/support or contact admin support.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link to="/dashboard/notifications"><Button size="sm" variant="outline">View Notifications</Button></Link>
              <Link to="/dashboard/support"><Button size="sm" variant="outline">Contact Support</Button></Link>
              <Link to="/catalog"><Button size="sm">Browse More Services</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
