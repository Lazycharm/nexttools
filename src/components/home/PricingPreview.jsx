import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  { name: 'Starter', price: 50, popular: false, features: ['5 services included', 'Basic proxy access', 'Email support', 'Standard delivery'] },
  { name: 'Growth', price: 99, popular: true, features: ['15 services included', 'Premium proxies', 'Priority support', 'Fast delivery', 'API access'] },
  { name: 'Pro', price: 179, popular: false, features: ['Unlimited services', 'Elite proxies', '24/7 support', 'Instant delivery', 'Dedicated manager'] },
];

export default function PricingPreview() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
        <p className="mt-3 text-muted-foreground text-lg">Start with a plan that works for you. Upgrade anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-extrabold">${plan.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/pricing">
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link to="/pricing" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
          Compare all plans <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}