import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_BUCKET = 'verified-profiles';

const emptyForm = {
  title: '',
  description: '',
  profile_details: '',
  price: '20',
  status: 'available',
  primary_image_url: '',
  image_urls: '',
  included_items: '',
};

export default function AdminVerifiedProfiles() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const uploadFileToStorage = async (file) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = `admin/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName || `image.${ext}`}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-verified-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('verified_profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createProfile = useMutation({
    mutationFn: async () => {
      setUploadingImages(true);
      let uploadedPrimary = '';
      let uploadedGallery = [];

      if (primaryImageFile) {
        uploadedPrimary = await uploadFileToStorage(primaryImageFile);
      }

      if (galleryFiles.length > 0) {
        uploadedGallery = await Promise.all(galleryFiles.map((file) => uploadFileToStorage(file)));
      }

      const manualImages = form.image_urls
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      const images = [...uploadedGallery, ...manualImages];

      const included = form.included_items
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const { error } = await supabase.from('verified_profiles').insert({
        title: form.title,
        description: form.description,
        profile_details: form.profile_details,
        price: Number(form.price || 0),
        status: form.status,
        category: 'dating',
        primary_image_url: uploadedPrimary || form.primary_image_url || images[0] || null,
        image_urls: images,
        included_items: included,
      });
      setUploadingImages(false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-profiles'] });
      setForm(emptyForm);
      setPrimaryImageFile(null);
      setGalleryFiles([]);
      toast.success('Verified profile added');
    },
    onError: (error) => {
      setUploadingImages(false);
      toast.error(error?.message || 'Could not create profile');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('verified_profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-verified-profiles'] }),
  });

  const removeProfile = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('verified_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verified-profiles'] });
      toast.success('Profile deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verified Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Create and manage sellable dating profiles.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add New Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Price (USD)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Full Profile Details</Label>
            <Textarea
              rows={4}
              placeholder="Write detailed info about this profile (age range, niche, account history, quality notes, handover notes, etc.)"
              value={form.profile_details}
              onChange={(e) => setForm((p) => ({ ...p, profile_details: e.target.value }))}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Primary Image Upload</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPrimaryImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label className="text-xs">Primary Image URL (optional)</Label>
              <Input value={form.primary_image_url} onChange={(e) => setForm((p) => ({ ...p, primary_image_url: e.target.value }))} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Gallery Images Upload (multiple)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
              />
            </div>
            <div>
              <Label className="text-xs">Additional Image URLs (comma separated)</Label>
              <Input value={form.image_urls} onChange={(e) => setForm((p) => ({ ...p, image_urls: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">What comes with profile (comma separated)</Label>
            <Input value={form.included_items} onChange={(e) => setForm((p) => ({ ...p, included_items: e.target.value }))} />
          </div>
          <Button onClick={() => createProfile.mutate()} disabled={createProfile.isPending || uploadingImages || !form.title}>
            <Plus className="w-4 h-4 mr-1" /> {createProfile.isPending || uploadingImages ? 'Saving...' : 'Add Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No profiles yet.</p>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium">{profile.title}</p>
                  <p className="text-xs text-muted-foreground">${profile.price} · {profile.description}</p>
                  {profile.profile_details && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.profile_details}</p>
                  )}
                  <Badge variant="secondary" className="text-xs mt-1 capitalize">{profile.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={profile.status} onValueChange={(v) => updateStatus.mutate({ id: profile.id, status: v })}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProfile.mutate(profile.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
