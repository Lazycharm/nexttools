import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does the wallet system work?', a: 'Deposit crypto (USDT or ETH) to your wallet. Once approved by our team, the balance is credited to your account and can be used to purchase any service on the platform.' },
  { q: 'How fast is service delivery?', a: 'Most services begin processing within minutes. Proxy activations are instant, virtual numbers are delivered within 1–5 minutes, and social growth services start within 1 hour.' },
  { q: 'Do you offer refunds?', a: 'Yes, we offer refunds for undelivered services. Each service has a specific refund policy outlined on its detail page. Contact support for any disputes.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption for all transactions and never share your personal information with third parties.' },
  { q: 'What payment methods do you accept?', a: 'We accept USDT (TRC-20, ERC-20), ETH, and BTC. All deposits are processed within 24 hours after confirmation.' },
  { q: 'Can I upgrade my subscription?', a: 'Yes, you can upgrade at any time from your dashboard. The price difference will be prorated for the remaining billing period.' },
];

export default function FAQSection() {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-background rounded-lg border px-4">
              <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}