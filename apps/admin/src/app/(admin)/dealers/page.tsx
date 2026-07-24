'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
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

export default function DealersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const verified = searchParams.get('verified') ?? '';

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const query = useQuery({
    queryKey: ['admin', 'dealers', { page, q, verified }],
    queryFn: () =>
      adminApi.dealers.list({
        page,
        pageSize: 20,
        q: q || undefined,
        verified: verified === '' ? undefined : verified === 'true',
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
        description="Manage dealer organizations."
        action={<Button onClick={() => setCreateOpen(true)}>Create dealer</Button>}
      />

      <Card className="mb-4 p-4">
        <Select
          label="Verified"
          value={verified}
          onChange={(e) => setParam('verified', e.target.value)}
          className="w-44"
        >
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </Select>
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
                <Th>Verified</Th>
                <Th>Followers</Th>
                <Th>Created</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <TextLink href={`/dealers/${d.id}`}>{d.name}</TextLink>
                  </Td>
                  <Td>{d.slug}</Td>
                  <Td>
                    <Badge tone={d.verified ? 'success' : 'neutral'}>
                      {d.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </Td>
                  <Td>{d.followersCount}</Td>
                  <Td>{formatDate(d.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Link href={`/dealers/${d.id}`} className="text-sm text-brand hover:underline">
                        View
                      </Link>
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
                              void queryClient.invalidateQueries({ queryKey: ['admin', 'dealers'] });
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
              ))}
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
