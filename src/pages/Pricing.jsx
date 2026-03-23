import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, ArrowRight } from 'lucide-react';

const plans = [
  { name: 'Starter', monthly: 50, quarterly: 135, yearly: 480, tier: 'starter', features: { services: 5, proxies: 'Basic', support: 'Email', delivery: 'Standard', api: false, manager: false, priority: false, refills: false } },
  { name: 'Growth', monthly: 99, quarterly: 267, yearly: 950, tier: 'growth', popular: true, features: { services: 15, proxies: 'Premium', support: 'Priority', delivery: 'Fast', api: true, manager: false, priority: true, refills: true } },
  { name: 'Pro', monthly: 179, quarterly: 483, yearly: 1716, tier: 'pro', features: { services: 'Unlimited', proxies: 'Elite', support: '24/7', delivery: 'Instant', api: true, manager: true, priority: true, refills: true } },
  { name: 'Elite', monthly: 299, quarterly: 807, yearly: 2868, tier: 'elite', features: { services: 'Unlimited', proxies: 'Elite+', support: 'Dedicated', delivery: 'Instant', api: true, manager: true, priority: true, refills: true } },
  { name: 'Agency', monthly: 499, quarterly: 1347, yearly: 4788, tier: 'agency', features: { services: 'Unlimited', proxies: 'Custom', support: 'Dedicated Team', delivery: 'Instant', api: true, manager: true, priority: true, refills: true } },
];

const bundles = [
  { name: 'Proxy Starter Bundle', price: 45, original: 65, items: ['10 Residential Proxies', '5 Static Proxies', 'Setup Guide'] },
  { name: 'Virtual Number Pro', price: 89, original: 120, items: ['3 US Numbers', '2 UK Numbers', '1 Canada Number', 'Monthly renewal'] },
  { name: 'Social Growth Combo', price: 149, original: 210, items: ['5K Instagram Followers', '10K Likes', '500 Comments', '30-day refill'] },
  { name: 'Creator Toolkit', price: 79, original: 110, items: ['Bio Generator', 'Caption Tool', 'Hashtag Planner', 'Photo Editor'] },
  { name: 'Business Outreach', price: 59, original: 85, items: ['50 Email Templates', '20 Support Templates', 'CTA Generator'] },
  { name: 'Agency Operations', price: 399, original: 580, items: ['Elite Proxies', '10 Virtual Numbers', '50K Followers', 'Priority Support'] },
];

const comparisonFeatures = [
  { label: 'Services Included', key: 'services' },
  { label: 'Proxy Access', key: 'proxies' },
  { label: 'Support Level', key: 'support' },
  { label: 'Delivery Speed', key: 'delivery' },
  { label: 'API Access', key: 'api', boolean: true },
  { label: 'Account Manager', key: 'manager', boolean: true },
  { label: 'Priority Queue', key: 'priority', boolean: true },
  { label: 'Auto Refills', key: 'refills', boolean: true },
];

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');

  const getPrice = (plan) => {
    if (billing === 'quarterly') return plan.quarterly;
    if (billing === 'yearly') return plan.yearly;
    return plan.monthly;
  };

  const getPeriod = () => {
    if (billing === 'quarterly') return '/quarter';
    if (billing === 'yearly') return '/year';
    return '/month';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">Pricing</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Plans that scale with you</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Choose the perfect plan for your needs. All plans include core features with a 7-day satisfaction guarantee.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <Tabs value={billing} onValueChange={setBilling}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">
              Quarterly <Badge variant="secondary" className="ml-1.5 text-xs">Save 10%</Badge>
            </TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly <Badge variant="secondary" className="ml-1.5 text-xs">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-extrabold">${getPrice(plan)}</span>
                <span className="text-sm text-muted-foreground">{getPeriod()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span className="text-muted-foreground">{plan.features.services} services</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span className="text-muted-foreground">{plan.features.proxies} proxies</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span className="text-muted-foreground">{plan.features.support} support</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span className="text-muted-foreground">{plan.features.delivery} delivery</span></li>
              </ul>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} size="sm">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Feature</TableHead>
                  {plans.map((p) => (
                    <TableHead key={p.name} className="text-center">{p.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((f) => (
                  <TableRow key={f.key}>
                    <TableCell className="font-medium">{f.label}</TableCell>
                    {plans.map((p) => (
                      <TableCell key={p.name} className="text-center">
                        {f.boolean ? (
                          p.features[f.key] ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="text-sm">{p.features[f.key]}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-2">Value Bundles</h2>
        <p className="text-center text-muted-foreground mb-8">Save more by combining services</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((b) => (
            <Card key={b.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{b.name}</h3>
                  <Badge variant="secondary" className="text-xs">Save ${b.original - b.price}</Badge>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">${b.price}</span>
                  <span className="text-sm text-muted-foreground line-through ml-2">${b.original}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {b.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary" /> {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" size="sm">Get Bundle</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}