'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Skeleton,
  Table,
  Td,
  TextLink,
  Th,
  formatDate,
  statusBadgeTone,
} from '@/components/ui';

export default function PlateVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get('page') ?? '1');
  const listingId = searchParams.get('listingId') ?? '';

  const query = useQuery({
    queryKey: ['admin', 'plates', 'verifications', { page, listingId }],
    queryFn: () =>
      adminApi.plates.verifications.list({
        page,
        pageSize: 20,
        listingId: listingId || undefined,
      }),
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/plates/verification?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader
        title="Plate verification"
        description="Verification events from /v1/admin/plates/verifications."
      />

      <Card className="mb-4 p-4">
        <Input
          label="Listing ID"
          value={listingId}
          onChange={(e) => setParam('listingId', e.target.value)}
          placeholder="Filter by listing UUID"
          className="max-w-md"
        />
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-64" />
      ) : query.isError ? (
        <ErrorState message="Failed to load verifications" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No verification events" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Listing</Th>
                <Th>Status</Th>
                <Th>Note</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((row) => (
                <tr key={row.id}>
                  <Td>
                    <TextLink href={`/plates?q=${row.listingId}`}>{row.listingId}</TextLink>
                  </Td>
                  <Td>
                    <Badge tone={statusBadgeTone(row.status)}>{row.status}</Badge>
                  </Td>
                  <Td>{row.note ?? '—'}</Td>
                  <Td>{formatDate(row.createdAt)}</Td>
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

      <p className="mt-4 text-sm text-ink-secondary">
        Manage plate listings from{' '}
        <Link href="/plates" className="font-semibold text-brand hover:underline">
          Plates
        </Link>
        .
      </p>
    </div>
  );
}
