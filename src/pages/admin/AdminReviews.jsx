import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, is_featured }) => {
      const { data: updated, error } = await supabase.from('reviews').update({ is_featured }).eq('id', id).select();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Updated'); },
  });

  const deleteReview = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase.from('reviews').delete().eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {isLoading ? <p className="text-muted-foreground">Loading...</p> : reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{review.user_name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {review.is_featured && <Badge className="text-xs bg-amber-500/10 text-amber-600 border-0">Featured</Badge>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleFeatured.mutate({ id: review.id, is_featured: !review.is_featured })}>
                    <Pin className={`w-3.5 h-3.5 ${review.is_featured ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteReview.mutate(review.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">"{review.content}"</p>
              <p className="text-xs text-muted-foreground mt-2">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}