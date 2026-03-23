import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Calendar, RefreshCcw, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const SETUP_BUCKET = 'profile-setup-requests';
const DATING_APPS = ['Tinder', 'Bumble', 'Badoo', 'Boo', 'POF', 'Hinge', 'OkCupid'];
const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'Snapchat', 'X / Twitter', 'YouTube'];
const includedByTier = {
  growth: 1,
  pro: 3,
  elite: 5,
  agency: 10,
};

export default function DashboardSubscriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSub, setSelectedSub] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [form, setForm] = useState({
    request_type: 'custom',
    existing_profile_id: '',
    instagram_username: '',
    dating_app: 'Tinder',
    social_platform: 'Instagram',
    notes: '',
  });

  const { data: subs = [] } = useQuery({
    queryKey: ['my-subs', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['profile-setup-requests', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_setup_requests')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const { data: verifiedProfiles = [] } = useQuery({
    queryKey: ['verified-profiles-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verified_profiles')
        .select('id,title,status,price')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: extraOrders = [] } = useQuery({
    queryKey: ['profile-extra-orders', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id,notes')
        .eq('user_email', user.email)
        .eq('category', 'profile_setup_extra')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  const usageBySubscription = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      map[r.subscription_id] = (map[r.subscription_id] || 0) + 1;
    });
    return map;
  }, [requests]);

  const extrasBySubscription = useMemo(() => {
    const map = {};
    extraOrders.forEach((o) => {
      const match = `${o.notes || ''}`.match(/subscription_id:([a-f0-9-]+)/i);
      if (match?.[1]) {
        map[match[1]] = (map[match[1]] || 0) + 1;
      }
    });
    return map;
  }, [extraOrders]);

  const uploadFileToStorage = async (file) => {
    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const { error } = await supabase.storage.from(SETUP_BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(SETUP_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const submitSetupRequest = useMutation({
    mutationFn: async () => {
      if (!selectedSub) throw new Error('Select a subscription first');
      const tier = `${selectedSub.plan_tier || ''}`.toLowerCase();
      const base = includedByTier[tier] || 0;
      if (base === 0) throw new Error('This plan does not include verified profile setup.');

      const used = usageBySubscription[selectedSub.id] || 0;
      const extra = extrasBySubscription[selectedSub.id] || 0;
      const allowed = base + extra;
      if (used >= allowed) throw new Error(`Setup limit reached (${allowed}). Buy extra slots or upgrade your plan.`);

      if (form.request_type === 'existing' && !form.existing_profile_id) {
        throw new Error('Choose an existing verified profile.');
      }

      const uploaded = imageFiles.length > 0 ? await Promise.all(imageFiles.map(uploadFileToStorage)) : [];
      const { error } = await supabase.from('profile_setup_requests').insert({
        user_email: user.email,
        subscription_id: selectedSub.id,
        plan_tier: selectedSub.plan_tier,
        request_type: form.request_type,
        existing_profile_id: form.request_type === 'existing' ? form.existing_profile_id : null,
        instagram_username: form.instagram_username || null,
        dating_app: form.dating_app,
        social_platform: form.social_platform,
        image_urls: uploaded,
        notes: form.notes || null,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-setup-requests'] });
      toast.success('Setup request submitted successfully.');
      setSetupOpen(false);
      setImageFiles([]);
      setForm({
        request_type: 'custom',
        existing_profile_id: '',
        instagram_username: '',
        dating_app: 'Tinder',
        social_platform: 'Instagram',
        notes: '',
      });
    },
    onError: (error) => toast.error(error?.message || 'Could not submit request'),
  });

  const buyExtraSlot = useMutation({
    mutationFn: async (sub) => {
      if (!user?.id || !user?.email) throw new Error('Please sign in again');
      const tier = `${sub.plan_tier || ''}`.toLowerCase();
      if (tier !== 'growth') throw new Error('Extra slots are only needed for Growth.');
      const price = 10;

      const { data: profile, error: profileError } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      const balance = Number(profile?.wallet_balance || 0);
      if (balance < price) throw new Error('Insufficient wallet balance. Deposit first.');

      const { error: walletError } = await supabase.from('profiles').update({ wallet_balance: balance - price }).eq('id', user.id);
      if (walletError) throw walletError;

      const { error: orderError } = await supabase.from('orders').insert({
        user_email: user.email,
        service_title: 'Growth Extra Verified Profile Slot',
        category: 'profile_setup_extra',
        package_name: 'Extra Slot',
        amount: price,
        quantity: 1,
        payment_method: 'wallet',
        status: 'completed',
        notes: `subscription_id:${sub.id}`,
      });
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-extra-orders'] });
      toast.success('Extra setup slot purchased.');
    },
    onError: (error) => {
      const message = error?.message || 'Could not buy extra slot';
      toast.error(message);
    },
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
            <Link to="/pricing">
              <Button className="mt-4" size="sm">Explore Plans</Button>
            </Link>
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
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    {(() => {
                      const tierKey = `${sub.plan_tier || ''}`.toLowerCase();
                      const base = includedByTier[tierKey] || 0;
                      const extra = extrasBySubscription[sub.id] || 0;
                      const used = usageBySubscription[sub.id] || 0;
                      if (!base) return 'No profile setup slots in this tier';
                      return `Profile setups: ${used}/${base + extra} used`;
                    })()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to="/pricing">
                    <Button size="sm" variant="outline">Upgrade / Renew</Button>
                  </Link>
                  {(includedByTier[`${sub.plan_tier || ''}`.toLowerCase()] || 0) > 0 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSub(sub);
                        setSetupOpen(true);
                      }}
                    >
                      Submit Setup
                    </Button>
                  )}
                  {`${sub.plan_tier || ''}`.toLowerCase() === 'growth' && (
                    <Button size="sm" variant="outline" onClick={() => buyExtraSlot.mutate(sub)} disabled={buyExtraSlot.isPending}>
                      Buy Extra ($10)
                    </Button>
                  )}
                  <Link to="/dashboard/support">
                    <Button size="sm" variant="ghost">Need Help</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">My Profile Setup Requests</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No setup requests yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 8).map((r) => (
                <div key={r.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{r.request_type} setup · {r.dating_app} + {r.social_platform}</p>
                    <p className="text-xs text-muted-foreground">{r.plan_tier} · {format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Profile Setup Request</DialogTitle>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Request Type</Label>
              <Select value={form.request_type} onValueChange={(v) => setForm((p) => ({ ...p, request_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Build</SelectItem>
                  <SelectItem value="existing">Use Existing Verified Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Instagram Username (optional)</Label>
              <Input placeholder="@username" value={form.instagram_username} onChange={(e) => setForm((p) => ({ ...p, instagram_username: e.target.value }))} />
            </div>
          </div>

          {form.request_type === 'existing' && (
            <div>
              <Label className="text-xs">Choose Existing Profile</Label>
              <Select value={form.existing_profile_id} onValueChange={(v) => setForm((p) => ({ ...p, existing_profile_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select profile" /></SelectTrigger>
                <SelectContent>
                  {verifiedProfiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} (${p.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Dating App (one)</Label>
              <Select value={form.dating_app} onValueChange={(v) => setForm((p) => ({ ...p, dating_app: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATING_APPS.map((app) => <SelectItem key={app} value={app}>{app}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Social Platform (one)</Label>
              <Select value={form.social_platform} onValueChange={(v) => setForm((p) => ({ ...p, social_platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Character Images (upload)</Label>
            <Input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
          </div>
          <div>
            <Label className="text-xs">Additional Details</Label>
            <Textarea
              rows={4}
              placeholder="Describe style, bio tone, location preference, age range, or any custom setup request."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <Button onClick={() => submitSetupRequest.mutate()} disabled={submitSetupRequest.isPending}>
            {submitSetupRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}