import React from 'react';
import { Shield, Clock, Headphones, RefreshCcw } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Enterprise-Grade Security', desc: 'Bank-level encryption and secure transactions on every order.' },
  { icon: Clock, title: 'Instant Activation', desc: 'Most services are delivered and activated within minutes.' },
  { icon: Headphones, title: '24/7 Priority Support', desc: 'Dedicated support team available around the clock.' },
  { icon: RefreshCcw, title: 'Guaranteed Refills', desc: 'Automatic refills on eligible services for peace of mind.' },
];

export default function TrustSection() {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Built on trust and reliability</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}