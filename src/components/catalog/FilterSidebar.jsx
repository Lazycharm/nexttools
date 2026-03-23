import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Services' },
  { value: 'dating_guide', label: 'Dating Guide' },
  { value: 'verified_profiles', label: 'Verified Profiles' },
  { value: 'proxy_tools', label: 'Proxy Tools' },
  { value: 'virtual_numbers', label: 'Virtual Numbers' },
  { value: 'social_growth', label: 'Social Growth' },
  { value: 'website_traffic', label: 'Website Traffic' },
  { value: 'photo_tools', label: 'Photo Tools' },
  { value: 'content_tools', label: 'Content Tools' },
  { value: 'templates', label: 'Templates' },
  { value: 'blue_tick', label: 'Verification Guides' },
  { value: 'gpro', label: 'G Pro' },
];

const platforms = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'X / Twitter', 'YouTube'];

const qualities = [
  { value: 'all', label: 'All Quality' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'elite', label: 'Elite' },
];

export default function FilterSidebar({ filters, onFilterChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Category</label>
        <Select value={filters.category} onValueChange={(v) => onFilterChange({ ...filters, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Quality</label>
        <Select value={filters.quality} onValueChange={(v) => onFilterChange({ ...filters, quality: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {qualities.map((q) => (
              <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Platform</label>
        <div className="flex flex-wrap gap-1.5">
          {platforms.map((p) => (
            <Badge
              key={p}
              variant={filters.platform === p ? 'default' : 'secondary'}
              className="cursor-pointer text-xs"
              onClick={() => onFilterChange({ ...filters, platform: filters.platform === p ? '' : p })}
            >
              {p}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Sort By</label>
        <Select value={filters.sort} onValueChange={(v) => onFilterChange({ ...filters, sort: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => onFilterChange({ category: 'all', quality: 'all', platform: '', sort: 'popular' })}
      >
        <X className="w-3 h-3 mr-1" /> Clear Filters
      </Button>
    </div>
  );
}