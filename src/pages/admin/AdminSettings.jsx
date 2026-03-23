import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Settings, CreditCard, MessageCircle, Globe, Bell, Shield, Save, Copy, Check, Eye, EyeOff, Upload
} from 'lucide-react';
import { toast } from 'sonner';

// Default settings schema
const SETTINGS_SCHEMA = {
  general: {
    label: 'General',
    icon: Globe,
    color: 'bg-blue-500/10 text-blue-600',
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'ToolStack', type: 'text' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Professional tools for modern businesses', type: 'text' },
      { key: 'support_email', label: 'Support Email', placeholder: 'support@toolstack.io', type: 'email' },
      { key: 'min_deposit', label: 'Minimum Deposit ($)', placeholder: '10', type: 'number' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', placeholder: 'false', type: 'text' },
    ],
  },
  homepage: {
    label: 'Homepage Banner Images',
    icon: Globe,
    color: 'bg-fuchsia-500/10 text-fuchsia-600',
    fields: [
      { key: 'hero_bg_image', label: 'Hero Background Image URL', placeholder: 'https://images.unsplash.com/...', type: 'image_url' },
      { key: 'hero_collage_1', label: 'Hero Image 1 URL', placeholder: 'https://images.unsplash.com/...', type: 'image_url' },
      { key: 'hero_collage_2', label: 'Hero Image 2 URL', placeholder: 'https://images.unsplash.com/...', type: 'image_url' },
      { key: 'hero_collage_3', label: 'Hero Image 3 URL', placeholder: 'https://images.unsplash.com/...', type: 'image_url' },
      { key: 'hero_collage_4', label: 'Hero Image 4 URL', placeholder: 'https://images.unsplash.com/...', type: 'image_url' },
    ],
  },
  payments: {
    label: 'Payment & Deposits',
    icon: CreditCard,
    color: 'bg-emerald-500/10 text-emerald-600',
    fields: [
      { key: 'wallet_usdt_trc20', label: 'USDT (TRC-20) Address', placeholder: 'TRx...', type: 'text', secret: false },
      { key: 'wallet_usdt_erc20', label: 'USDT (ERC-20) Address', placeholder: '0x...', type: 'text' },
      { key: 'wallet_eth', label: 'ETH Address', placeholder: '0x...', type: 'text' },
      { key: 'wallet_btc', label: 'BTC Address', placeholder: '1A2B...', type: 'text' },
      { key: 'deposit_bonus_percent', label: 'Deposit Bonus (%)', placeholder: '0', type: 'number' },
      { key: 'deposit_instructions', label: 'Deposit Instructions', placeholder: 'Send exact amount to the address shown...', type: 'text' },
    ],
  },
  social: {
    label: 'Social & Links',
    icon: MessageCircle,
    color: 'bg-purple-500/10 text-purple-600',
    fields: [
      { key: 'telegram_group', label: 'Telegram Group URL', placeholder: 'https://t.me/toolstackhq', type: 'url' },
      { key: 'telegram_support', label: 'Telegram Support Bot', placeholder: 'https://t.me/toolstack_support', type: 'url' },
      { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/toolstack', type: 'url' },
      { key: 'twitter_url', label: 'Twitter/X URL', placeholder: 'https://twitter.com/toolstack', type: 'url' },
      { key: 'discord_url', label: 'Discord URL', placeholder: 'https://discord.gg/...', type: 'url' },
      { key: 'whatsapp_url', label: 'WhatsApp URL', placeholder: 'https://wa.me/...', type: 'url' },
    ],
  },
  notifications: {
    label: 'Notifications',
    icon: Bell,
    color: 'bg-amber-500/10 text-amber-600',
    fields: [
      { key: 'notify_new_order', label: 'Notify on New Order (admin email)', placeholder: 'admin@toolstack.io', type: 'email' },
      { key: 'notify_new_deposit', label: 'Notify on New Deposit (admin email)', placeholder: 'admin@toolstack.io', type: 'email' },
      { key: 'welcome_message', label: 'Welcome Message', placeholder: 'Welcome to ToolStack!', type: 'text' },
      { key: 'deposit_pending_message', label: 'Deposit Pending Message', placeholder: 'Your deposit is under review...', type: 'text' },
      { key: 'order_complete_message', label: 'Order Complete Message', placeholder: 'Your order has been delivered!', type: 'text' },
    ],
  },
  security: {
    label: 'Security',
    icon: Shield,
    color: 'bg-rose-500/10 text-rose-600',
    fields: [
      { key: 'max_daily_deposit', label: 'Max Daily Deposit ($)', placeholder: '10000', type: 'number' },
      { key: 'max_daily_orders', label: 'Max Daily Orders per User', placeholder: '50', type: 'number' },
      { key: 'require_kyc', label: 'Require KYC', placeholder: 'false', type: 'text' },
      { key: 'allowed_countries', label: 'Allowed Countries (comma separated, empty = all)', placeholder: 'US,UK,CA,AU', type: 'text' },
    ],
  },
  pricing: {
    label: 'Pricing Plans',
    icon: CreditCard,
    color: 'bg-cyan-500/10 text-cyan-600',
    fields: [
      { key: 'pricing_plans_json', label: 'Plans JSON', placeholder: 'Paste pricing plans JSON array', type: 'textarea' },
    ],
  },
};

const DEFAULT_PRICING_PLANS_JSON = JSON.stringify([
  { name: 'Starter', monthly: 50, quarterly: 135, yearly: 480, tier: 'starter', features: { services: 5, proxies: 'Basic', support: 'Email', delivery: 'Standard', verifiedProfiles: '0', extraProfile: 'N/A', api: false, manager: false, priority: false, refills: false } },
  { name: 'Growth', monthly: 99, quarterly: 267, yearly: 950, tier: 'growth', popular: true, features: { services: 15, proxies: 'Premium', support: 'Priority', delivery: 'Fast', verifiedProfiles: '1 profile setup (existing or custom)', extraProfile: '$10 each extra setup', api: true, manager: false, priority: true, refills: true } },
  { name: 'Pro', monthly: 179, quarterly: 483, yearly: 1716, tier: 'pro', features: { services: 'Unlimited', proxies: 'Elite', support: '24/7', delivery: 'Instant', verifiedProfiles: '3 profile setups (existing or custom)', extraProfile: 'Priority team handling', api: true, manager: true, priority: true, refills: true } },
  { name: 'Elite', monthly: 299, quarterly: 807, yearly: 2868, tier: 'elite', features: { services: 'Unlimited', proxies: 'Elite+', support: 'Dedicated', delivery: 'Instant', verifiedProfiles: '5 profile setups', extraProfile: 'White-glove setup', api: true, manager: true, priority: true, refills: true } },
  { name: 'Agency', monthly: 499, quarterly: 1347, yearly: 4788, tier: 'agency', features: { services: 'Unlimited', proxies: 'Custom', support: 'Dedicated Team', delivery: 'Instant', verifiedProfiles: '10 profile setups', extraProfile: 'Team onboarding support', api: true, manager: true, priority: true, refills: true } },
], null, 2);

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={copy}>
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </Button>
  );
}

function SettingsSection({ section, sectionKey, values, onChange, onSave, saving, onUploadImage, uploadingField }) {
  const Icon = section.icon;
  const [showSecrets, setShowSecrets] = useState({});

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <CardTitle className="text-base">{section.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.fields.map((field) => {
          const val = values[field.key] ?? '';
          const isSecret = field.key.startsWith('wallet_');
          const shown = showSecrets[field.key];
          return (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</Label>
              <div className="flex gap-2">
                {field.type === 'textarea' ? (
                  <Textarea
                    value={val}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={10}
                    className="font-mono text-xs"
                  />
                ) : (
                  <Input
                    type={isSecret && !shown ? 'password' : field.type === 'number' ? 'number' : 'text'}
                    value={val}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="font-mono text-sm"
                  />
                )}
                {field.type === 'image_url' && (
                  <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs cursor-pointer hover:bg-accent transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingField === field.key ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadImage(field.key, file);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                )}
                {isSecret && (
                  <Button
                    type="button" variant="ghost" size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={() => setShowSecrets((p) => ({ ...p, [field.key]: !p[field.key] }))}
                  >
                    {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                )}
                {val && field.type !== 'textarea' && <CopyButton value={val} />}
              </div>
              {field.key === 'pricing_plans_json' && (
                <p className="text-[11px] text-muted-foreground">
                  Format must be a JSON array of plans. If left empty, the site uses current default plans.
                </p>
              )}
              {field.type === 'image_url' && val && (
                <div className="mt-2">
                  <img
                    src={val}
                    alt={field.label}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-32 rounded-md object-cover border"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div className="pt-2">
          {sectionKey === 'pricing' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => onChange('pricing_plans_json', DEFAULT_PRICING_PLANS_JSON)}
            >
              Load Current Plans Template
            </Button>
          )}
          <Button size="sm" className="gap-2" onClick={() => onSave(sectionKey)} disabled={saving}>
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Section'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState({});
  const [savingSection, setSavingSection] = useState(null);
  const [uploadingField, setUploadingField] = useState('');

  const { data: settingsRecords = [], isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Load settings into local state
  useEffect(() => {
    if (settingsRecords.length > 0) {
      const map = {};
      settingsRecords.forEach((s) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settingsRecords]);

  const upsertMutation = useMutation({
    mutationFn: async ({ key, value, category }) => {
      const existing = settingsRecords.find((s) => s.key === key);
      if (existing) {
        const { data, error } = await supabase.from('app_settings').update({ value }).eq('id', existing.id).select();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('app_settings').insert({ key, value, category }).select();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-settings'] }),
  });

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadImage = async (fieldKey, file) => {
    try {
      setUploadingField(fieldKey);
      const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
      const filePath = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('homepage-hero').upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('homepage-hero').getPublicUrl(filePath);
      handleChange(fieldKey, data.publicUrl);
      toast.success('Image uploaded. Save section to persist.');
    } catch (error) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploadingField('');
    }
  };

  const handleSave = async (sectionKey) => {
    setSavingSection(sectionKey);
    const section = SETTINGS_SCHEMA[sectionKey];
    if (sectionKey === 'pricing' && values.pricing_plans_json) {
      try {
        const parsed = JSON.parse(values.pricing_plans_json);
        if (!Array.isArray(parsed)) {
          throw new Error('Pricing plans JSON must be an array.');
        }
      } catch (error) {
        setSavingSection(null);
        toast.error(error?.message || 'Invalid pricing plans JSON');
        return;
      }
    }
    const promises = section.fields.map((field) =>
      upsertMutation.mutateAsync({ key: field.key, value: values[field.key] ?? '', category: sectionKey })
    );
    await Promise.all(promises);
    setSavingSection(null);
    toast.success(`${section.label} settings saved`);
  };

  const handleSaveAll = async () => {
    setSavingSection('all');
    const allFields = Object.entries(SETTINGS_SCHEMA).flatMap(([cat, section]) =>
      section.fields.map((f) => ({ key: f.key, value: values[f.key] ?? '', category: cat }))
    );
    await Promise.all(allFields.map((f) => upsertMutation.mutateAsync(f)));
    setSavingSection(null);
    toast.success('All settings saved');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6" />Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your platform settings</p>
        </div>
        <Button className="gap-2" onClick={handleSaveAll} disabled={savingSection === 'all'}>
          <Save className="w-4 h-4" />
          {savingSection === 'all' ? 'Saving All...' : 'Save All'}
        </Button>
      </div>

      {/* Quick view: deposit wallets */}
      {(values.wallet_usdt_trc20 || values.wallet_btc || values.wallet_eth) && (
        <Card className="border-emerald-200/50 bg-emerald-50/30">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Deposit Addresses</p>
            <div className="space-y-2">
              {[
                { label: 'USDT TRC-20', key: 'wallet_usdt_trc20' },
                { label: 'USDT ERC-20', key: 'wallet_usdt_erc20' },
                { label: 'ETH', key: 'wallet_eth' },
                { label: 'BTC', key: 'wallet_btc' },
              ].filter((w) => values[w.key]).map((w) => (
                <div key={w.key} className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs w-24 justify-center flex-shrink-0">{w.label}</Badge>
                  <code className="text-xs text-muted-foreground font-mono truncate flex-1">{values[w.key]}</code>
                  <CopyButton value={values[w.key]} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(SETTINGS_SCHEMA).map(([key, section]) => (
        <SettingsSection
          key={key}
          section={section}
          sectionKey={key}
          values={values}
          onChange={handleChange}
          onSave={handleSave}
          saving={savingSection === key}
          onUploadImage={handleUploadImage}
          uploadingField={uploadingField}
        />
      ))}
    </div>
  );
}