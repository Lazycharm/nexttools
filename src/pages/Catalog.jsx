import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import ServiceCard from '@/components/catalog/ServiceCard';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Catalog() {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: initialCategory,
    quality: 'all',
    platform: '',
    sort: 'popular',
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    let result = services.filter((s) => s.status === 'active');

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.title?.toLowerCase().includes(q) || s.subtitle?.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'all') {
      result = result.filter((s) => s.category === filters.category);
    }
    if (filters.quality !== 'all') {
      result = result.filter((s) => s.quality_badge === filters.quality);
    }
    if (filters.platform) {
      result = result.filter((s) => s.platforms?.includes(filters.platform));
    }

    if (filters.sort === 'price_low') result.sort((a, b) => a.base_price - b.base_price);
    else if (filters.sort === 'price_high') result.sort((a, b) => b.base_price - a.base_price);
    else if (filters.sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));

    return result;
  }, [services, search, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground mt-1">Browse our complete catalog of professional tools and services</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="mt-6">
              <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No services found matching your filters.</p>
              <Button variant="link" onClick={() => setFilters({ category: 'all', quality: 'all', platform: '', sort: 'popular' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}