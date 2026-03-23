import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe, Phone, TrendingUp, Monitor, CheckCircle, Camera, FileText, PenTool, ArrowRight, Heart, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const TELEGRAM_URL = 'https://t.me/toolstackhq';

const categories = [
  { key: 'proxy_tools', title: 'Proxy Tools', desc: 'Residential, rotating & static proxies for 190+ countries', icon: Globe, count: 12, color: 'bg-blue-500/10 text-blue-600', telegram: false },
  { key: 'virtual_numbers', title: 'Virtual Numbers', desc: 'Verification numbers with instant delivery worldwide', icon: Phone, count: 8, color: 'bg-emerald-500/10 text-emerald-600', telegram: false },
  { key: 'social_growth', title: 'Social Growth', desc: 'Followers, likes & engagement across all platforms', icon: TrendingUp, count: 24, color: 'bg-purple-500/10 text-purple-600', telegram: false },
  { key: 'website_traffic', title: 'Website Traffic', desc: 'Geo-targeted traffic packages with real analytics', icon: Monitor, count: 6, color: 'bg-amber-500/10 text-amber-600', telegram: false },
  { key: 'photo_tools', title: 'Photo Tools', desc: 'Professional photo editing for portraits & profiles', icon: Camera, count: 5, color: 'bg-rose-500/10 text-rose-600', telegram: false },
  { key: 'content_tools', title: 'Content Tools', desc: 'AI-powered bios, captions & ad copy generators', icon: PenTool, count: 7, color: 'bg-cyan-500/10 text-cyan-600', telegram: false },
  { key: 'templates', title: 'Business Templates', desc: 'Professional email & support reply templates', icon: FileText, count: 10, color: 'bg-indigo-500/10 text-indigo-600', telegram: false },
  { key: 'blue_tick', title: 'Verification Guides', desc: 'Eligibility guidance for platform verification', icon: CheckCircle, count: 3, color: 'bg-sky-500/10 text-sky-600', telegram: false },
  { key: 'dating', title: 'Dating App Services', desc: 'Tinder, Bumble & Hinge boosts, matches & profile upgrades', icon: Heart, count: 15, color: 'bg-pink-500/10 text-pink-600', telegram: true },
];

export default function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Everything you need, one platform</h2>
        <p className="mt-3 text-muted-foreground text-lg">Browse our comprehensive suite of tools and services</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            {cat.telegram ? (
              <Card className="group hover:shadow-md hover:border-pink-400/30 transition-all duration-300 cursor-pointer h-full border-pink-200/50 bg-gradient-to-br from-pink-50/50 to-rose-50/30">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center mb-4`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-semibold text-foreground">{cat.title}</h3>
                    <Badge className="text-xs bg-pink-500 text-white border-0 px-1.5 py-0">New</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                  <div className="flex flex-col gap-2">
                    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button size="sm" className="w-full gap-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs h-8">
                        Get Services <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    <Link to="/guides/dating" className="w-full">
                      <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs h-8 border-pink-200 text-pink-600 hover:bg-pink-50">
                        View Guide <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Link to={`/catalog?category=${cat.key}`}>
                <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center mb-4`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{cat.count} services</Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* More Tools Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80"
          alt="More tools"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-purple-600/80 flex items-center justify-between px-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-1">100+ More Tools Available</h3>
            <p className="text-white/80 text-sm">Exclusive services available on our Telegram group — join for early access & deals</p>
          </div>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 flex-shrink-0">
              More Tools <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}