'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import { listingTitle, type ListingStatus } from '@/lib/api/types';
import { useCatalogFilters } from '@/features/vehicles/hooks/useCatalogFilters';
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
  formatPrice,
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

type BulkAction =
  | 'delete'
  | 'archive'
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'restore';

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();
  const catalog = useCatalogFilters();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const status = (searchParams.get('status') as ListingStatus | null) ?? undefined;
  const categoryCode = searchParams.get('categoryCode') ?? '';
  const brandId = searchParams.get('brandId') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? 'desc';
  const includeDeleted = searchParams.get('includeDeleted') === '1';
  const featured = searchParams.get('featured');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchDraft, setSearchDraft] = useState(q);

  const listParams = {
    page,
    pageSize: 20,
    q: q || undefined,
    status,
    categoryCode: categoryCode || undefined,
    brandId: brandId || undefined,
    sortBy,
    sortOrder,
    includeDeleted: includeDeleted || undefined,
    featured: featured === '1' ? true : featured === '0' ? false : undefined,
  };

  const query = useQuery({
    queryKey: ['admin', 'listings', listParams],
    queryFn: () => adminApi.listings.list(listParams),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });

  const bulkMutation = useMutation({
    mutationFn: (input: { ids: string[]; action: BulkAction }) =>
      adminApi.listings.bulk(input),
    onSuccess: (_, vars) => {
      toast(`${vars.action} completed for ${vars.ids.length} listing(s)`, 'success');
      setSelected(new Set());
      invalidate();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Action failed', 'error'),
  });

  const allIds = useMemo(() => query.data?.items.map((i) => i.id) ?? [], [query.data]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/listings?${params.toString()}`);
  };

  const bulk = async (action: BulkAction) => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: `${action} ${selected.size} listing(s)?`,
      description: 'This action will apply to all selected listings.',
      variant: action === 'delete' ? 'danger' : 'primary',
      confirmLabel: action,
    });
    if (!ok) return;
    bulkMutation.mutate({ ids: [...selected], action });
  };

  const duplicateListing = async (id: string) => {
    const ok = await confirm({
      title: 'Duplicate listing',
      description: 'Create a copy of this listing as a new draft.',
      confirmLabel: 'Duplicate',
    });
    if (!ok) return;
    try {
      const copy = await adminApi.listings.duplicate(id);
      toast('Duplicate succeeded', 'success');
      invalidate();
      router.push(`/listings/${copy.id}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Duplicate failed', 'error');
    }
  };

  const exportCsv = async () => {
    try {
      const csv = await adminApi.listings.exportCsv({
        q: q || undefined,
        status,
        categoryCode: categoryCode || undefined,
        brandId: brandId || undefined,
        includeDeleted: includeDeleted || undefined,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autohub-listings-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast('CSV exported', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Export failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Vehicle management"
        description="Create, moderate, and manage marketplace vehicles."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void exportCsv()}>
              Export CSV
            </Button>
            <Link href="/listings/new">
              <Button>New vehicle</Button>
            </Link>
          </div>
        }
      />

      <Card className="mb-4 space-y-4 p-4">
        <form
          className="grid gap-3 md:grid-cols-[1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', searchDraft.trim());
          }}
        >
          <Input
            label="Search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Title, slug, plate…"
          />
          <div className="flex items-end">
            <Button type="submit">Search</Button>
          </div>
        </form>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Status"
            value={status ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className="w-40"
          >
            <option value="">All</option>
            {(['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'ARCHIVED', 'REJECTED'] as ListingStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            value={categoryCode}
            onChange={(e) => setParam('categoryCode', e.target.value)}
            className="w-40"
          >
            <option value="">All</option>
            {(catalog.data?.categories ?? []).map((c) => (
              <option key={c.id} value={c.code}>
                {c.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Brand"
            value={brandId}
            onChange={(e) => setParam('brandId', e.target.value)}
            className="w-44"
          >
            <option value="">All brands</option>
            {(catalog.data?.brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Sort"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [by = 'createdAt', order = 'desc'] = e.target.value.split(':');
              setParam('sortBy', by);
              setParam('sortOrder', order);
            }}
            className="w-48"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="updatedAt:desc">Recently updated</option>
            <option value="primaryPrice:desc">Price high</option>
            <option value="primaryPrice:asc">Price low</option>
            <option value="viewsCount:desc">Most viewed</option>
          </Select>
          <Select
            label="Featured"
            value={featured ?? ''}
            onChange={(e) => setParam('featured', e.target.value)}
            className="w-36"
          >
            <option value="">Any</option>
            <option value="1">Featured</option>
            <option value="0">Not featured</option>
          </Select>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setParam('includeDeleted', e.target.checked ? '1' : '')}
            />
            Include deleted
          </label>
        </div>
        {selected.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void bulk('activate')}>
              Activate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void bulk('deactivate')}>
              Deactivate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void bulk('archive')}>
              Archive
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void bulk('feature')}>
              Feature
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void bulk('unfeature')}>
              Unfeature
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void bulk('restore')}>
              Restore
            </Button>
            <Button size="sm" variant="danger" onClick={() => void bulk('delete')}>
              Soft delete
            </Button>
          </div>
        ) : null}
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load listings" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState
          title="No listings found"
          description="Try adjusting filters or create a new vehicle."
          action={
            <Link href="/listings/new">
              <Button>New vehicle</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={selected.size === allIds.length && allIds.length > 0}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(allIds) : new Set())
                    }
                  />
                </Th>
                <Th>Vehicle</Th>
                <Th>Status</Th>
                <Th>Price</Th>
                <Th>Seller / dealer</Th>
                <Th>Views</Th>
                <Th>Favorites</Th>
                <Th>Created</Th>
                <Th>Updated</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((item) => (
                <tr key={item.id} className={item.deletedAt ? 'opacity-60' : undefined}>
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${listingTitle(item)}`}
                      checked={selected.has(item.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(item.id);
                        else next.delete(item.id);
                        setSelected(next);
                      }}
                    />
                  </Td>
                  <Td>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TextLink href={`/listings/${item.id}`}>{listingTitle(item)}</TextLink>
                        {item.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
                        {item.isVerified ? <Badge tone="success">Verified</Badge> : null}
                        {item.deletedAt ? <Badge tone="error">Deleted</Badge> : null}
                      </div>
                      <p className="text-xs text-ink-secondary">
                        {[
                          item.carDetails?.brand?.nameEn,
                          item.carDetails?.model?.nameEn,
                          item.carDetails?.year,
                          item.city?.nameEn,
                        ]
                          .filter(Boolean)
                          .join(' · ') || item.categoryCode}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={statusBadgeTone(item.status)}>{item.status}</Badge>
                  </Td>
                  <Td>{formatPrice(item.primaryPrice)}</Td>
                  <Td>{item.seller?.displayName ?? item.seller?.phone ?? '—'}</Td>
                  <Td>{item.viewsCount ?? item.viewCount ?? 0}</Td>
                  <Td>{item.favoritesCount ?? item.favoriteCount ?? 0}</Td>
                  <Td>{formatDate(item.createdAt)}</Td>
                  <Td>{formatDate(item.updatedAt)}</Td>
                  <Td>
                    <div className="flex flex-col gap-1 text-sm">
                      <Link href={`/listings/${item.id}`} className="text-brand hover:underline">
                        View
                      </Link>
                      <Link
                        href={`/listings/${item.id}/edit`}
                        className="text-ink-secondary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-left text-ink-secondary hover:underline"
                        onClick={() => void duplicateListing(item.id)}
                      >
                        Duplicate
                      </button>
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
    </div>
  );
}
