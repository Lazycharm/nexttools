import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import TrustSection from '@/components/home/TrustSection';
import PricingPreview from '@/components/home/PricingPreview';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <TrustSection />
      <PricingPreview />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}