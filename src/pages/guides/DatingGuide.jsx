import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Heart, ExternalLink, ChevronDown, ChevronUp, CheckCircle2,
  Wrench, DollarSign, Image, Lightbulb, Smartphone, Monitor,
  AlertTriangle, Package, ShoppingBag, Check
} from 'lucide-react';
import InsufficientBalanceDialog from '@/components/checkout/InsufficientBalanceDialog';

const TELEGRAM_URL = 'https://t.me/toolstackhq';
const GUIDE_PRICE = 20;

const tools = [
  { name: 'Dolphin Anty', link: 'https://anty.dolphin.ru.com/', purpose: 'Transferring Accounts' },
  { name: 'Vysor', link: 'https://www.vysor.io/', purpose: 'Connecting Samsung to PC' },
  { name: 'LDPlayer', link: 'https://www.ldplayer.net/', purpose: 'Managing Accounts' },
  { name: 'App Cloner Ultra Mod', link: 'https://s4.revdL.com/1901/App_Cloner_Premium_2.13.1_3595_Revdl.com.apk', purpose: 'Cloning Accounts' },
  { name: 'SocksDroid', link: 'https://play.google.com/store/apps/details?id=net.typeblog.socks&hl=en_US', purpose: 'Proxy Connector' },
  { name: 'Free Video To JPG', link: 'https://www.dvdvideosoft.com/download.htm?fname=FreeVideoToJPGConverter.exe', purpose: 'Frame extraction from videos' },
  { name: 'Tiny Task', link: 'https://thetinytask.com/', purpose: 'Automating Swipes' },
];

const providers = [
  { name: 'YouProxy', link: 'https://youproxy.io', purpose: 'For Suicide Bumbles' },
  { name: 'DichVuSocks', link: 'https://dichvusocks.us', purpose: 'For Suicide Bumbles' },
  { name: 'TextVerified', link: 'https://textverified.com', purpose: 'SMS verify' },
  { name: 'SMSPool', link: 'https://smspool.net', purpose: 'SMS verify' },
  { name: 'SMS Pin Verify', link: 'https://smspinverify.com/', purpose: 'SMS verify' },
  { name: 'Gmail Accounts', link: 'https://t.me/CJG42', purpose: 'Mail verify' },
  { name: 'Wise', link: 'https://wise.com/cards', purpose: 'Card Purchases' },
  { name: 'ip8', link: 'https://ip8.com/', purpose: "Checking Proxy's Geolocation" },
  { name: 'AccsMarket', link: 'https://accsmarket.com/', purpose: 'Instagram Accounts' },
];

const tinderCosts = [
  { item: 'Gmail', cost: '$0.15' },
  { item: 'Phone Number', cost: '$0.30' },
  { item: 'Instagram', cost: '$0.15' },
  { item: 'ipRoyal per GB', cost: '$6.00' },
  { item: 'Instagram Followers', cost: '$0.01' },
];

const bumbleCosts = [
  { item: 'Phone Number', cost: '$0.50' },
  { item: 'Snap', cost: '$1.50' },
  { item: 'YouProxy', cost: '$1.20' },
];

const suicideBumbleCosts = [
  { item: 'Phone Number', cost: '$0.50' },
  { item: 'Proxies', cost: '$0.50' },
  { item: 'Bumble Gold', cost: '$3.50' },
];

function Section({ id, title, icon: Icon, color, children, defaultOpen = false }) { // eslint-disable-line
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${open ? 'bg-card shadow-sm border-border' : 'bg-card/60 border-border/50 hover:border-border'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="mt-2 px-1">{children}</div>}
    </div>
  );
}

function Step({ number, children }) {
  return (
    <div className="flex gap-3 items-start py-2">
      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{number}</div>
      <p className="text-sm text-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function CostTable({ title, rows, total, color }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-1.5 text-muted-foreground">{r.item}</td>
                <td className="py-1.5 text-right font-medium">{r.cost}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="pt-2 text-foreground">Total</td>
              <td className="pt-2 text-right text-primary">{total}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ProfileStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'sold') {
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Sold</Badge>;
  }
  if (normalized === 'reserved') {
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Reserved</Badge>;
  }
  return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Available</Badge>;
}

export default function DatingGuide() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [insufficientContext, setInsufficientContext] = useState(null);

  const { data: guideOrder } = useQuery({
    queryKey: ['dating-guide-access', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id,status')
        .eq('user_email', user.email)
        .eq('category', 'dating_guide')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  const hasAccess = guideOrder?.status === 'completed' || guideOrder?.status === 'active';

  const { data: verifiedProfiles = [] } = useQuery({
    queryKey: ['verified-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verified_profiles')
        .select('*')
        .eq('category', 'dating')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const unlockWithWallet = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.id || !user?.email) throw new Error('Please sign in first');
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      const balance = profile?.wallet_balance || 0;
      if (balance < GUIDE_PRICE) throw new Error('Insufficient wallet balance. Please deposit first.');

      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: balance - GUIDE_PRICE })
        .eq('id', user.id);
      if (walletError) throw walletError;

      const { error: orderError } = await supabase.from('orders').insert({
        user_email: user.email,
        service_title: 'Dating Guide Access',
        category: 'dating_guide',
        package_name: 'Guide Unlock',
        amount: GUIDE_PRICE,
        quantity: 1,
        payment_method: 'wallet',
        status: 'completed',
        notes: 'Guide access unlocked',
      });
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dating-guide-access'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Dating Guide unlocked');
    },
    onError: (error) => {
      const message = error?.message || 'Unlock failed';
      toast.error(message);
      if (message.toLowerCase().includes('insufficient')) return;
      if (message.toLowerCase().includes('sign in')) navigate('/auth');
    },
  });

  const requestCrypto = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.email) throw new Error('Please sign in first');
      return true;
    },
    onSuccess: () => {
      toast.success('Complete deposit to unlock Dating Guide.');
      navigate(
        `/dashboard/deposits?amount=${GUIDE_PRICE}&purpose=${encodeURIComponent(
          'Dating Guide unlock'
        )}&kind=dating_guide`
      );
    },
    onError: (error) => toast.error(error?.message || 'Could not create crypto payment request'),
  });

  const buyProfileWithWallet = useMutation({
    mutationFn: async (profile) => {
      if (!isAuthenticated || !user?.id || !user?.email) throw new Error('Please sign in first');
      if (!profile || profile.status !== 'available') throw new Error('This profile is not available');

      const { data: latestProfile, error: profileError } = await supabase
        .from('verified_profiles')
        .select('*')
        .eq('id', profile.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!latestProfile || latestProfile.status !== 'available') throw new Error('This profile has already been sold');

      const { data: myWallet, error: walletFetchError } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).maybeSingle();
      if (walletFetchError) throw walletFetchError;
      const balance = Number(myWallet?.wallet_balance || 0);
      const amount = Number(latestProfile.price || 0);
      if (balance < amount) throw new Error('Insufficient wallet balance. Please deposit first.');

      const { error: walletError } = await supabase.from('profiles').update({ wallet_balance: balance - amount }).eq('id', user.id);
      if (walletError) throw walletError;

      const { error: soldError } = await supabase
        .from('verified_profiles')
        .update({ status: 'sold', updated_at: new Date().toISOString() })
        .eq('id', latestProfile.id)
        .eq('status', 'available');
      if (soldError) throw soldError;

      const { error: orderError } = await supabase.from('orders').insert({
        user_email: user.email,
        service_title: latestProfile.title,
        category: 'verified_profile',
        package_name: 'Verified Profile Purchase',
        amount,
        quantity: 1,
        payment_method: 'wallet',
        status: 'completed',
        notes: `verified_profile_id:${latestProfile.id}`,
      });
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verified-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Profile purchased successfully');
      setSelectedProfile(null);
    },
    onError: (error) => {
      const message = error?.message || 'Purchase failed';
      toast.error(message);
      if (message.toLowerCase().includes('insufficient')) return;
      if (message.toLowerCase().includes('sign in')) navigate('/auth');
    },
  });

  const buyProfileWithCrypto = useMutation({
    mutationFn: async (profile) => {
      if (!isAuthenticated || !user?.email) throw new Error('Please sign in first');
      if (!profile || profile.status !== 'available') throw new Error('This profile is not available');
      return profile;
    },
    onSuccess: (profile) => {
      const amount = Number(profile.price || 0);
      navigate(
        `/dashboard/deposits?amount=${amount}&purpose=${encodeURIComponent(
          `Verified profile purchase: ${profile.title}`
        )}&kind=verified_profile&profileId=${profile.id}&profileTitle=${encodeURIComponent(profile.title)}`
      );
      toast.success('Submit deposit details to create your profile order.');
    },
    onError: (error) => toast.error(error?.message || 'Could not start crypto checkout'),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-pink-500/10 text-pink-600 border-pink-200 hover:bg-pink-500/10">Dating Apps Guide</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Bumble + Tinder{' '}
          <span className="text-primary">Ultimate Guide</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base">
          Complete setup, account creation, cloning, migration, and automation guide for Bumble and Tinder.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs"><Heart className="w-3 h-3 mr-1 text-pink-500" />Bumble</Badge>
          <Badge variant="outline" className="text-xs"><Heart className="w-3 h-3 mr-1 text-red-500" />Tinder</Badge>
          <Badge variant="secondary" className="text-xs">Advanced</Badge>
        </div>
      </div>

      {!hasAccess && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold">Unlock full Dating Guide for ${GUIDE_PRICE}</p>
              <p className="text-sm text-muted-foreground">You can preview the content, but actions are locked until paid.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  unlockWithWallet.mutate(undefined, {
                    onError: (error) => {
                      const message = error?.message || '';
                      if (message.toLowerCase().includes('insufficient')) {
                        setInsufficientContext({ type: 'guide', amount: GUIDE_PRICE });
                      }
                    },
                  })
                }
                disabled={unlockWithWallet.isPending || requestCrypto.isPending}
              >
                {unlockWithWallet.isPending ? 'Processing...' : 'Pay with Balance'}
              </Button>
              <Button variant="outline" onClick={() => requestCrypto.mutate()} disabled={unlockWithWallet.isPending || requestCrypto.isPending}>
                Pay with Crypto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card id="verified-profiles" className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Active & Verified Profiles
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            View profile details, what is included, status, and purchase instantly.
          </p>
        </CardHeader>
        <CardContent>
          {verifiedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified profiles listed yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedProfiles.map((profile) => {
                const isSold = profile.status === 'sold';
                const images = Array.isArray(profile.image_urls) ? profile.image_urls : [];
                const preview = profile.primary_image_url || images[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=80';
                return (
                  <div key={profile.id} className="border rounded-xl overflow-hidden bg-card">
                    <img loading="lazy" decoding="async" src={preview} alt={profile.title} className="w-full h-44 object-cover" />
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold line-clamp-1">{profile.title}</p>
                        <ProfileStatusBadge status={profile.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{profile.description || 'Verified profile ready for delivery.'}</p>
                      {profile.profile_details && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{profile.profile_details}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-bold">${Number(profile.price || 0).toFixed(2)}</p>
                        <Button size="sm" variant={isSold ? 'outline' : 'default'} disabled={isSold} onClick={() => {
                          setSelectedProfile(profile);
                          setSelectedImage(preview);
                        }}>
                          {isSold ? 'Sold Out' : 'View Details'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className={`relative ${!hasAccess ? 'opacity-60 pointer-events-none select-none' : ''}`}>
        {/* Table of Contents */}
        <Card className={`mb-8 bg-muted/30 ${!hasAccess ? 'pointer-events-none select-none' : ''}`}>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Tools & Setup', 'Providers', 'Account Cloning', 'Account Creation', 'Browser Migration', 'Pictures', 'Tips', 'Calculations'].map((s) => (
                <a key={s} href={`#${s.toLowerCase().replace(/[^a-z]/g, '-')}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {s}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Tools & Setup */}
      <Section id="tools---setup" title="Tools & Setup" icon={Wrench} color="bg-blue-500/10 text-blue-600" defaultOpen>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tool</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.purpose}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={t.link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">Download <ExternalLink className="w-3 h-3" /></Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Providers */}
      <Section id="providers" title="Providers" icon={Package} color="bg-emerald-500/10 text-emerald-600" defaultOpen>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.purpose}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">Visit <ExternalLink className="w-3 h-3" /></Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Cloning */}
      <Section id="account-cloning" title="Account Cloning" icon={Smartphone} color="bg-purple-500/10 text-purple-600">
        <Card>
          <CardContent className="p-5">
            <div className="divide-y divide-border/50">
              {[
                'Open App Cloner and select Tinder or Bumble.',
                'Select "Clone Number" and click on "Single Clones".',
                'Clone number must always be bigger by 1 than the previous one — this creates a new account instead of overriding.',
                'Change the name to [Creator Name] [#].',
                'Scroll to Modding → "Identity & tracking options" → "New Identity" → check everything.',
                'Back in Modding click "Privacy Options" → Enable "Spoof Location" → enter the preset Latitude & Longitude. Fake location interval = 10.',
                '⚠️ For Tinder: Location MUST match the Proxy Geolocation. For Bumble: Location does NOT need to match.',
                'Enable "Hide mock location".',
                'Go to Modding → "Media Options" → Enable "Fake camera".',
                'Click the Clone App button and install it.',
              ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Account Creation */}
      <Section id="account-creation" title="Account Creation" icon={Heart} color="bg-pink-500/10 text-pink-600">
        <div className="space-y-4">
          {/* SocksDroid */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">1. Configure SocksDroid</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-sm text-muted-foreground mb-2">Fill in: Server IP, Server Port, Username, Password — then turn on SocksDroid.</p>
            </CardContent>
          </Card>
          {/* Tinder */}
          <Card className="border-red-200/40">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <CardTitle className="text-sm font-semibold">Tinder</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4 divide-y divide-border/50">
              {[
                'Open the app and input your phone number from SMSPool or TextVerified.',
                'Enter the verification code received.',
                'Input the mail.',
                'IMPORTANT: Choose "Show me both" when prompted.',
                'Add 4 pictures.',
                'Allow Location and create the profile.',
                'Go to Profile Settings — lower the Distance, extend the Range.',
                'Add Username.',
                'Go to Edit Profile and fill out the basic information.',
                'Add Instagram @ in the Workplace field.',
              ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
            </CardContent>
          </Card>
          {/* Bumble */}
          <Card className="border-yellow-200/40">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-yellow-500" />
                <CardTitle className="text-sm font-semibold">Bumble</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4 divide-y divide-border/50">
              {[
                'Open the app and input the phone number, verify via SMSPool or TextVerified.',
                'Upload 3 profile pictures.',
                'Skip non-essential info but add something to make profile look legit.',
                'Create the account and go to Profile.',
                'Click "Finish the profile" and Verify the profile using Verification Pictures + Fake Camera App.',
                'Fill out basic information in Edit Profile.',
                'Add a Spotify song to make the account appear more legit.',
                'Close the account. No likes needed — accounts go live in 24h. Wait 24h before logging in.',
                'After 24h your account is live. You can also add a BIO.',
              ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Browser Migration */}
      <Section id="browser-migration" title="Browser Migration (Dolphin Anty)" icon={Monitor} color="bg-indigo-500/10 text-indigo-600">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">General Setup</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 divide-y divide-border/50">
              {[
                'Create a new profile in Dolphin — name it [Creator Name][#].',
                'Set Status as the account type.',
                'Use the same proxy as the phone.',
                'Scroll down, switch to Manual Location, enter the same Latitude & Longitude from the phone.',
                'Click Create Profile.',
              ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
            </CardContent>
          </Card>
          <Card className="border-red-200/40">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /><CardTitle className="text-sm font-semibold">Tinder</CardTitle></div>
            </CardHeader>
            <CardContent className="px-5 pb-4 divide-y divide-border/50">
              {[
                'Right Click → Inspect to open the console.',
                'Press Ctrl+Shift+P, type "Sensors" and click Show Sensors.',
                'Scroll to Orientation → Select custom orientation → set a unique position (simulating someone holding a phone).',
                'Drag the console to take up ~2/3 of the screen.',
                'Go to lite.tinder.com and sign in with the Gmail used for the account.',
              ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
            </CardContent>
          </Card>
          <Card className="border-yellow-200/40">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-yellow-500" />
                <CardTitle className="text-sm font-semibold">Bumble — Email Method (Suicide Accounts)</CardTitle>
                <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-200">Golden Method</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 mb-4 text-xs text-amber-700">
                ⚠️ Never close the tab. If you close the tab, the account gets deactivated. Your PC must be running all the time. Buy extra laptops to scale.
              </div>
              <div className="divide-y divide-border/50">
                {[
                  'On your phone, go to Bumble Profile → Settings → Notification Settings → New Messages → Enable Emails.',
                  'Open temp-mail.org in your browser and copy the email.',
                  'Paste it in the phone\'s email field and click Verify.',
                  'In temp-mail\'s inbox, click the verification link → accept cookies.',
                  'Click Sign In — this will log you into the profile on browser.',
                  'Go to Settings → Bio and add something like: "I\'m rarely here. So if we match add me on snap [username]."',
                  'Buy 1 Day Premium using Wise cards.',
                  'Open AutoClicker (Tiny Task) and record yourself clicking matches + refresh. Save and run in loop.',
                  'Scale: have multiple accounts open across multiple computers. When one runs out of matches, move to the next.',
                ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Pictures */}
      <Section id="pictures" title="Pictures & Verification" icon={Image} color="bg-rose-500/10 text-rose-600">
        <Card>
          <CardContent className="p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verification</p>
              <p className="text-sm text-foreground">Ask your model to recreate a 15-second video for each Bumble Verification Pose. Then use the Free Video to JPG tool to export frames every second.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profile Pictures</p>
              <p className="text-sm text-foreground">Ask model to create 4 videos in different outfits, places, and poses. Export frames every second using the video to JPG tool — this gives you a wide variety of profile pictures. Alternatively use <a href="https://photoai.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">photoAI.com</a>.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Adding Snapchat Username to Picture</p>
              <div className="divide-y divide-border/50">
                {[
                  'Open the picture on canva.com.',
                  'Add text: "Snap. [username]"',
                  'Choose grey text color.',
                  'Set transparency to 33.',
                  'Position in the bottom left corner.',
                ].map((s, i) => <Step key={i} number={i + 1}>{s}</Step>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Refunding */}
      <Section id="refunding--shadowban" title="Refunding & ShadowBan" icon={AlertTriangle} color="bg-orange-500/10 text-orange-600">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-3">Submit a request on Tinder's help center stating that matches don't work, or that your credit card was used without permission for a refund:</p>
            <a href="https://help.tinder.com/hc/en-us/requests/new?ticket_form_id=360000234392" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                Open Tinder Help Center <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </Section>

      {/* Tips */}
      <Section id="tips" title="Tips & Tricks" icon={Lightbulb} color="bg-yellow-500/10 text-yellow-600">
        <Card>
          <CardContent className="p-5">
            <ul className="space-y-2">
              {[
                'Reinstall App Cloner every 5 clones.',
                'Use Instagram only as a funnel — avoid Snapchat if possible.',
                'Vysor speeds up account creation — you can copy text and drag pictures from PC to phone directly.',
                'For Tinder swiping: always click the (i) icon, scroll down, then match or reject.',
                'Check if shadowbanned on Tinder: refresh browser, swipe left on the first card — the second should always be a match.',
                'For Bumble: put the bio in the middle of the paragraph.',
                'For Tinder: add Instagram @ in the Workplace field.',
                'Every ~75 Snapchat adds = ~5 conversions.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      {/* Cost Calculations */}
      <Section id="calculations" title="Cost Calculations" icon={DollarSign} color="bg-green-500/10 text-green-600">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CostTable
            title="Tinder Account"
            color="border-red-400"
            rows={tinderCosts}
            total="$6.61"
          />
          <CostTable
            title="Bumble Account"
            color="border-yellow-400"
            rows={bumbleCosts}
            total="$3.20"
          />
          <CostTable
            title="Suicide Bumble"
            color="border-pink-400"
            rows={suicideBumbleCosts}
            total="$6.00"
          />
        </div>
      </Section>

      </div>

      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-3xl">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-8 gap-3">
                  <span>{selectedProfile.title}</span>
                  <ProfileStatusBadge status={selectedProfile.status} />
                </DialogTitle>
                <DialogDescription>{selectedProfile.description || 'Verified profile package details.'}</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedImage || selectedProfile.primary_image_url}
                    alt={selectedProfile.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
                    {[selectedProfile.primary_image_url, ...(Array.isArray(selectedProfile.image_urls) ? selectedProfile.image_urls : [])]
                      .filter(Boolean)
                      .map((img, idx) => (
                        <button
                          key={`${img}-${idx}`}
                          onClick={() => setSelectedImage(img)}
                          className={`rounded-md overflow-hidden border-2 flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                        >
                          <img loading="lazy" decoding="async" src={img} alt={`${selectedProfile.title}-${idx + 1}`} className="w-16 h-16 object-cover" />
                        </button>
                      ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">${Number(selectedProfile.price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">What you get</p>
                    <ul className="space-y-1">
                      {(Array.isArray(selectedProfile.included_items) ? selectedProfile.included_items : []).map((item) => (
                        <li key={item} className="text-sm flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" /> {item}
                        </li>
                      ))}
                      {(!Array.isArray(selectedProfile.included_items) || selectedProfile.included_items.length === 0) && (
                        <li className="text-sm text-muted-foreground">No extra items listed by admin.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Profile Details</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProfile.profile_details || 'No additional details added by admin.'}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      disabled={selectedProfile.status !== 'available' || buyProfileWithWallet.isPending || buyProfileWithCrypto.isPending}
                      onClick={() =>
                        buyProfileWithWallet.mutate(selectedProfile, {
                          onError: (error) => {
                            const message = error?.message || '';
                            if (message.toLowerCase().includes('insufficient')) {
                              setInsufficientContext({
                                type: 'profile',
                                amount: Number(selectedProfile.price || 0),
                                profile: selectedProfile,
                              });
                            }
                          },
                        })
                      }
                    >
                      {buyProfileWithWallet.isPending ? 'Processing...' : 'Pay with Balance'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={selectedProfile.status !== 'available' || buyProfileWithWallet.isPending || buyProfileWithCrypto.isPending}
                      onClick={() => buyProfileWithCrypto.mutate(selectedProfile)}
                    >
                      Pay with Crypto
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA (always unlocked) */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">Need help or want exclusive tools not listed here?</p>
        <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
          <Button className="gap-2">
            Get support on Telegram <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
      <InsufficientBalanceDialog
        open={!!insufficientContext}
        onOpenChange={(open) => !open && setInsufficientContext(null)}
        amount={insufficientContext?.amount || 0}
        loading={unlockWithWallet.isPending || buyProfileWithWallet.isPending || requestCrypto.isPending || buyProfileWithCrypto.isPending}
        onDeposit={() => {
          setInsufficientContext(null);
          navigate('/dashboard/deposits');
        }}
        onPayWithCrypto={() => {
          if (!insufficientContext) return;
          if (insufficientContext.type === 'guide') {
            setInsufficientContext(null);
            requestCrypto.mutate();
            return;
          }
          if (insufficientContext.type === 'profile' && insufficientContext.profile) {
            const profile = insufficientContext.profile;
            setInsufficientContext(null);
            buyProfileWithCrypto.mutate(profile);
          }
        }}
      />
    </div>
  );
}