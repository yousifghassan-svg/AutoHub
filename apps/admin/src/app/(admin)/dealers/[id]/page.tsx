'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
  TextArea,
  useToast,
} from '@/components/ui';

export default function DealerDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['admin', 'dealers', params.id],
    queryFn: () => adminApi.dealers.get(params.id),
  });

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    setName(query.data.name);
    setBio(query.data.bio ?? '');
    setPhone(query.data.phone ?? '');
    setVerified(query.data.verified);
  }, [query.data]);

  const update = useMutation({
    mutationFn: () =>
      adminApi.dealers.update(params.id, { name, bio, phone, verified }),
    onSuccess: () => {
      toast('Dealer updated', 'success');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
      void query.refetch();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Update failed', 'error'),
  });

  if (query.isLoading) return <Skeleton className="h-96" />;
  if (query.isError || !query.data) {
    return <ErrorState message="Dealer not found" onRetry={() => void query.refetch()} />;
  }

  const dealer = query.data;
  const stats = dealer.statistics;

  return (
    <div>
      <PageHeader
        title={dealer.name}
        description={`Dealer · ${dealer.slug}`}
        action={
          <Badge tone={dealer.verified ? 'success' : 'neutral'}>
            {dealer.verified ? 'Verified' : 'Unverified'}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Edit dealer" className="lg:col-span-2">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate();
            }}
          >
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              Verified dealer
            </label>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </Card>

        <Card title="Statistics">
          {stats ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Cars</dt>
                <dd className="font-semibold">{stats.cars}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Sold</dt>
                <dd className="font-semibold">{stats.sold}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Followers</dt>
                <dd className="font-semibold">{stats.followers}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Views</dt>
                <dd className="font-semibold">{stats.views}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-ink-secondary">No statistics available.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
