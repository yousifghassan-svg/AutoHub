'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import type { DealerVerificationStatus } from '@/lib/api/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Table,
  Td,
  TextLink,
  Th,
  formatDate,
  useConfirm,
  useToast,
} from '@/components/ui';

function statusTone(status: string | undefined, verified: boolean) {
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'REJECTED') return 'error' as const;
  if (status === 'VERIFIED' || verified) return 'success' as const;
  return 'neutral' as const;
}

export default function DealersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const status = (searchParams.get('status') ?? '') as DealerVerificationStatus | '';

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const query = useQuery({
    queryKey: ['admin', 'dealers', { page, q, status }],
    queryFn: () =>
      adminApi.dealers.list({
        page,
        pageSize: 20,
        q: q || undefined,
        status: status || undefined,
      }),
  });

  const create = useMutation({
    mutationFn: () => adminApi.dealers.create({ name, slug }),
    onSuccess: () => {
      toast('Dealer created', 'success');
      setCreateOpen(false);
      setName('');
      setSlug('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Create failed', 'error'),
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/dealers?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader
        title="Dealers"
        description="Review self-serve applications and manage dealer organizations."
        action={<Button onClick={() => setCreateOpen(true)}>Create dealer</Button>}
      />

      <Card className="mb-4 flex flex-wrap gap-3 p-4">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
          className="w-48"
        >
          <option value="">All</option>
          <option value="PENDING">Pending queue</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="UNVERIFIED">Unverified</option>
        </Select>
        <Input
          label="Search"
          value={q}
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Name or slug"
          className="w-64"
        />
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load dealers" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No dealers found" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th>Followers</Th>
                <Th>Created</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((d) => {
                const st = d.verificationStatus ?? (d.verified ? 'VERIFIED' : 'UNVERIFIED');
                return (
                  <tr key={d.id}>
                    <Td>
                      <TextLink href={`/dealers/${d.id}`}>{d.name}</TextLink>
                    </Td>
                    <Td>{d.slug}</Td>
                    <Td>
                      <Badge tone={statusTone(st, d.verified)}>{st}</Badge>
                    </Td>
                    <Td>{d.followersCount}</Td>
                    <Td>{formatDate(d.createdAt)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dealers/${d.id}`}
                          className="text-sm text-brand hover:underline"
                        >
                          View
                        </Link>
                        {st === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                void (async () => {
                                  const ok = await confirm({
                                    title: 'Approve dealer application?',
                                    confirmLabel: 'Approve',
                                  });
                                  if (!ok) return;
                                  try {
                                    await adminApi.dealers.approve(d.id);
                                    toast('Dealer approved', 'success');
                                    void queryClient.invalidateQueries({
                                      queryKey: ['admin', 'dealers'],
                                    });
                                  } catch (e) {
                                    toast(
                                      e instanceof Error ? e.message : 'Approve failed',
                                      'error',
                                    );
                                  }
                                })();
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setRejectId(d.id);
                                setRejectReason('');
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            void (async () => {
                              const ok = await confirm({
                                title: 'Delete dealer?',
                                variant: 'danger',
                                confirmLabel: 'Delete',
                              });
                              if (!ok) return;
                              try {
                                await adminApi.dealers.delete(d.id);
                                toast('Dealer deleted', 'success');
                                void queryClient.invalidateQueries({
                                  queryKey: ['admin', 'dealers'],
                                });
                              } catch (e) {
                                toast(e instanceof Error ? e.message : 'Delete failed', 'error');
                              }
                            })();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <div className="px-4 pb-4">
            <Pagination
              page={query.data!.page}
              totalPages={query.data!.totalPages}
              onPageChange={(p) => setParam('page', String(p))}
            />
          </div>
        </Card>
      )}

      {rejectId ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setRejectId(null)}
          />
          <Card className="relative z-10 w-full max-w-md space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Reject application</h2>
            <Input
              label="Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button
                variant="danger"
                disabled={rejectReason.trim().length < 3}
                onClick={() => {
                  void (async () => {
                    try {
                      await adminApi.dealers.reject(rejectId, rejectReason.trim());
                      toast('Dealer rejected', 'success');
                      setRejectId(null);
                      void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
                    } catch (e) {
                      toast(e instanceof Error ? e.message : 'Reject failed', 'error');
                    }
                  })();
                }}
              >
                Reject
              </Button>
              <Button type="button" variant="secondary" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setCreateOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold">Create dealer</h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-dealer"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={create.isPending}>
                  Create
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
