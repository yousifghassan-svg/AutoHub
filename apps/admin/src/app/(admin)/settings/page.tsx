'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Button,
  Card,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
  TextArea,
  useToast,
} from '@/components/ui';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminApi.settings.get,
  });

  const [siteName, setSiteName] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [featuredLimit, setFeaturedLimit] = useState('10');
  const [maxImages, setMaxImages] = useState('20');
  const [defaultCurrency, setDefaultCurrency] = useState('IQD');
  const [contactInfo, setContactInfo] = useState('{}');
  const [socialLinks, setSocialLinks] = useState('{}');

  useEffect(() => {
    if (!query.data) return;
    setSiteName(query.data.siteName);
    setMaintenanceMode(query.data.maintenanceMode);
    setFeaturedLimit(String(query.data.featuredLimit));
    setMaxImages(String(query.data.maxImages));
    setDefaultCurrency(query.data.defaultCurrency);
    setContactInfo(JSON.stringify(query.data.contactInfo ?? {}, null, 2));
    setSocialLinks(JSON.stringify(query.data.socialLinks ?? {}, null, 2));
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => {
      let contact: Record<string, unknown> | undefined;
      let social: Record<string, unknown> | undefined;
      try {
        contact = JSON.parse(contactInfo) as Record<string, unknown>;
        social = JSON.parse(socialLinks) as Record<string, unknown>;
      } catch {
        throw new Error('Contact info and social links must be valid JSON');
      }
      return adminApi.settings.update({
        siteName,
        maintenanceMode,
        featuredLimit: Number(featuredLimit),
        maxImages: Number(maxImages),
        defaultCurrency,
        contactInfo: contact,
        socialLinks: social,
      });
    },
    onSuccess: () => {
      toast('Settings saved', 'success');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Save failed', 'error'),
  });

  if (query.isLoading) return <Skeleton className="h-96" />;
  if (query.isError) {
    return <ErrorState message="Failed to load settings" onRetry={() => void query.refetch()} />;
  }

  return (
    <div>
      <PageHeader title="Settings" description="Site-wide configuration." />

      <Card>
        <form
          className="max-w-2xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Input label="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            Maintenance mode
          </label>
          <Input
            label="Featured limit"
            type="number"
            value={featuredLimit}
            onChange={(e) => setFeaturedLimit(e.target.value)}
          />
          <Input
            label="Max images per listing"
            type="number"
            value={maxImages}
            onChange={(e) => setMaxImages(e.target.value)}
          />
          <Input
            label="Default currency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
          />
          <TextArea
            label="Contact info (JSON)"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="font-mono text-xs"
          />
          <TextArea
            label="Social links (JSON)"
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
            className="font-mono text-xs"
          />
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save settings'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
