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
  useConfirm,
  useToast,
} from '@/components/ui';

export default function DealerDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const confirm = useConfirm();

  const query = useQuery({
    queryKey: ['admin', 'dealers', params.id],
    queryFn: () => adminApi.dealers.get(params.id),
  });

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!query.data) return;
    setName(query.data.name);
    setBio(query.data.bio ?? '');
    setPhone(query.data.phone ?? '');
  }, [query.data]);

  const update = useMutation({
    mutationFn: () => adminApi.dealers.update(params.id, { name, bio, phone }),
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
  const status =
    dealer.verificationStatus ?? (dealer.verified ? 'VERIFIED' : 'UNVERIFIED');

  return (
    <div>
      <PageHeader
        title={dealer.name}
        description={`Dealer · ${dealer.slug}`}
        action={
          <Badge
            tone={
              status === 'VERIFIED'
                ? 'success'
                : status === 'PENDING'
                  ? 'warning'
                  : status === 'REJECTED'
                    ? 'error'
                    : 'neutral'
            }
          >
            {status}
          </Badge>
        }
      />

      {status === 'PENDING' ? (
        <Card className="mb-6 space-y-3 p-4">
          <p className="text-sm text-ink-secondary">
            This organization is waiting for verification review.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                void (async () => {
                  const ok = await confirm({
                    title: 'Approve dealer application?',
                    confirmLabel: 'Approve',
                  });
                  if (!ok) return;
                  try {
                    await adminApi.dealers.approve(params.id);
                    toast('Dealer approved', 'success');
                    void query.refetch();
                    void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
                  } catch (e) {
                    toast(e instanceof Error ? e.message : 'Approve failed', 'error');
                  }
                })();
              }}
            >
              Approve
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Reject reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-w-[240px] flex-1"
            />
            <Button
              variant="danger"
              disabled={rejectReason.trim().length < 3}
              onClick={() => {
                void (async () => {
                  try {
                    await adminApi.dealers.reject(params.id, rejectReason.trim());
                    toast('Dealer rejected', 'success');
                    setRejectReason('');
                    void query.refetch();
                    void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
                  } catch (e) {
                    toast(e instanceof Error ? e.message : 'Reject failed', 'error');
                  }
                })();
              }}
            >
              Reject
            </Button>
          </div>
        </Card>
      ) : null}

      {status === 'REJECTED' && dealer.rejectionReason ? (
        <Card className="mb-6 p-4 text-sm text-ink-secondary">
          Rejection reason: {dealer.rejectionReason}
        </Card>
      ) : null}

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
