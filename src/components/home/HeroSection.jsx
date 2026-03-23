import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const TELEGRAM_URL = 'https://t.me/toolstackhq';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Banner image background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80"
          alt="Digital network"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />
      </div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
              ✦ Trusted by 12,000+ professionals
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Professional tools for{' '}
              <span className="text-primary">modern businesses</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Access premium proxy services, virtual numbers, social growth tools, dating services, and business utilities — all in one platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link to="/catalog">
                <Button size="lg" className="gap-2 px-8 h-12 text-sm font-semibold">
                  Explore Services <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2 px-8 h-12 text-sm font-semibold border-dashed">
                  More Tools <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-8 flex-wrap">
              {[
                { icon: Shield, label: 'Enterprise Security' },
                { icon: Zap, label: 'Instant Delivery' },
                { icon: Globe, label: '190+ Countries' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right image collage */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-3"
          >
            <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80" alt="Social Growth" className="rounded-2xl w-full h-48 object-cover shadow-lg" />
            <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80" alt="Proxy Tools" className="rounded-2xl w-full h-48 object-cover shadow-lg mt-6" />
            <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" alt="Virtual Numbers" className="rounded-2xl w-full h-48 object-cover shadow-lg -mt-3" />
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" alt="Dating" className="rounded-2xl w-full h-48 object-cover shadow-lg mt-3" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}