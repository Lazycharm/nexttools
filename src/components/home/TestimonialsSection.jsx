import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Alex R.', role: 'Agency Owner', content: 'ToolStack has been instrumental for our agency operations. The proxy quality is unmatched and customer support is always on point.', rating: 5 },
  { name: 'Sarah M.', role: 'Social Media Manager', content: 'The social growth tools are reliable and the delivery speed is impressive. I use it daily for all my clients.', rating: 5 },
  { name: 'David K.', role: 'E-commerce Founder', content: 'From virtual numbers to traffic services, everything works seamlessly. The pricing is fair and transparent.', rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Loved by professionals worldwide</h2>
        <p className="mt-3 text-muted-foreground text-lg">Join thousands of businesses that trust ToolStack</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <Card key={t.name} className="bg-card">
            <CardContent className="p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.content}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}