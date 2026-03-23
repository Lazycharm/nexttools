import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, Mail, Clock, Shield } from 'lucide-react';

const faqs = [
  { q: 'How do I get started?', a: 'Sign up for a free account, deposit funds to your wallet, and start purchasing services from our catalog.' },
  { q: 'What payment methods do you accept?', a: 'We accept USDT (TRC-20, ERC-20), ETH, and BTC. Deposits are credited within 24 hours of confirmation.' },
  { q: 'How fast is service delivery?', a: 'Most services start processing within minutes. Specific delivery times are listed on each service page.' },
  { q: 'Can I get a refund?', a: 'Yes, refunds are available for undelivered services. Contact support with your order details.' },
  { q: 'How do I contact support?', a: 'Create a support ticket from your dashboard or email us directly. We respond within 2–4 hours.' },
  { q: 'Is my information secure?', a: 'Yes. We use enterprise-grade encryption and never share your data with third parties.' },
];

export default function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-2">Find answers or get in touch with our support team</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: MessageSquare, title: 'Live Support', desc: 'Create a ticket from your dashboard', link: '/dashboard/support' },
          { icon: Mail, title: 'Email Us', desc: 'support@toolstack.io', link: null },
          { icon: Clock, title: 'Response Time', desc: 'Usually within 2–4 hours', link: null },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
              {item.link && (
                <Link to={item.link}><Button variant="link" size="sm" className="mt-2 text-xs">Go to tickets</Button></Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg border px-4">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}