import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServices() {
  const queryClient = useQueryClient();
  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updated, error } = await supabase.from('services').update(data).eq('id', id).select();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service updated'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-muted-foreground text-sm mt-1">{services.length} total services</p>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.subtitle}</p>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs capitalize">{s.category?.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell className="font-semibold">${s.base_price}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{s.quality_badge || 'standard'}</Badge></TableCell>
                <TableCell>
                  <Select value={s.status} onValueChange={(v) => updateService.mutate({ id: s.id, data: { status: v } })}>
                    <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" size="sm"
                    className={`h-7 text-xs ${s.is_featured ? 'text-amber-600' : 'text-muted-foreground'}`}
                    onClick={() => updateService.mutate({ id: s.id, data: { is_featured: !s.is_featured } })}
                  >
                    <Star className={`w-3.5 h-3.5 ${s.is_featured ? 'fill-amber-400' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => updateService.mutate({ id: s.id, data: { status: s.status === 'active' ? 'inactive' : 'active' } })}
                  >
                    {s.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}