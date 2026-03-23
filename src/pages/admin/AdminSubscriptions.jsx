import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-subs-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: setupRequests = [] } = useQuery({
    queryKey: ['admin-profile-setup-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profile_setup_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateSetup = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('profile_setup_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile-setup-requests'] });
      toast.success('Request updated');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">{subs.filter((s) => s.status === 'active').length} active subscriptions</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : subs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-sm">{sub.user_email}</TableCell>
                  <TableCell className="font-medium">{sub.plan_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs capitalize">{sub.plan_tier}</Badge></TableCell>
                  <TableCell className="font-semibold">${sub.price}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{sub.billing_cycle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{sub.end_date ? format(new Date(sub.end_date), 'MMM d, yyyy') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Profile Setup Requests</h3>
          <p className="text-xs text-muted-foreground mt-1">Custom or existing-profile setup requests from subscribed users.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Apps</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setupRequests.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No setup requests yet</TableCell></TableRow>
              ) : setupRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{r.user_email}</TableCell>
                  <TableCell className="capitalize">{r.request_type}</TableCell>
                  <TableCell className="text-sm">{r.dating_app} + {r.social_platform}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs capitalize">{r.plan_tier || '—'}</Badge></TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => updateSetup.mutate({ id: r.id, status: v })}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}