import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
  open: 'bg-blue-500/10 text-blue-600',
  pending: 'bg-amber-500/10 text-amber-600',
  in_progress: 'bg-purple-500/10 text-purple-600',
  resolved: 'bg-emerald-500/10 text-emerald-600',
  closed: 'bg-muted text-muted-foreground',
};

export default function AdminTickets() {
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-tickets-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updated, error } = await supabase.from('tickets').update(data).eq('id', id).select();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-tickets-list'] }); toast.success('Ticket updated'); },
  });

  const sendReply = () => {
    if (!reply.trim()) return;
    const messages = [...(selected.messages || []), { sender: 'admin', content: reply, timestamp: new Date().toISOString(), is_admin: true }];
    updateTicket.mutate({ id: selected.id, data: { messages, status: 'in_progress' } });
    setReply('');
    setSelected((prev) => ({ ...prev, messages, status: 'in_progress' }));
  };

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">{tickets.filter((t) => t.status === 'open').length} open tickets</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-sm cursor-pointer transition-shadow" onClick={() => setSelected(ticket)}>
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="font-semibold">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ticket.user_email} · {ticket.category} · {format(new Date(ticket.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${statusColors[ticket.status] || ''}`}>{ticket.status}</Badge>
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{ticket.messages?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <p className="text-xs text-muted-foreground">{selected?.user_email}</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {selected?.messages?.map((msg, i) => (
              <div key={i} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.is_admin ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.is_admin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.timestamp ? format(new Date(msg.timestamp), 'MMM d, h:mm a') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex gap-2">
            <Select value={selected?.status} onValueChange={(v) => { updateTicket.mutate({ id: selected.id, data: { status: v } }); setSelected((p) => ({ ...p, status: v })); }}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Textarea className="flex-1 min-h-9 h-9 resize-none text-sm" placeholder="Reply..." value={reply} onChange={(e) => setReply(e.target.value)} rows={1} />
            <Button size="icon" onClick={sendReply}><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}