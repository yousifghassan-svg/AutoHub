'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Table,
  Td,
  Th,
  formatDate,
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function MediaLibraryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const mediaType = searchParams.get('mediaType') ?? '';
  const status = searchParams.get('status') ?? '';
  const unused = searchParams.get('unused') === '1';
  const duplicates = searchParams.get('duplicates') === '1';
  const includeDeleted = searchParams.get('includeDeleted') === '1';

  const query = useQuery({
    queryKey: [
      'admin',
      'media',
      { page, q, mediaType, status, unused, duplicates, includeDeleted },
    ],
    queryFn: () =>
      adminApi.media.list({
        page,
        pageSize: 20,
        q: q || undefined,
        mediaType: mediaType || undefined,
        status: status || undefined,
        unused: unused || undefined,
        duplicates: duplicates || undefined,
        includeDeleted: includeDeleted || undefined,
      }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/media?${params.toString()}`);
  };

  const toggleFlag = (key: 'unused' | 'duplicates' | 'includeDeleted') => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === '1') params.delete(key);
    else params.set(key, '1');
    params.delete('page');
    router.replace(`/media?${params.toString()}`);
  };

  const runDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Soft-delete this media asset?',
      description: 'R2 objects are retained for 72 hours so restore remains possible.',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await adminApi.media.delete(id);
      toast('Media deleted', 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const runRestore = async (id: string) => {
    try {
      await adminApi.media.restore(id);
      toast('Media restored', 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Restore failed', 'error');
    }
  };

  const storage = query.data?.storageUsage;

  return (
    <div>
      <PageHeader
        title="Media"
        description="Platform media library — filters, storage usage, soft-delete and restore."
      />

      {storage ? (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
                Storage used
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {formatBytes(storage.totalBytes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
                Active assets
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {storage.assetCount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Type"
            value={mediaType}
            onChange={(e) => setParam('mediaType', e.target.value)}
            className="w-44"
          >
            <option value="">All types</option>
            {['IMAGE', 'VIDEO', 'MEDIA_360', 'DOCUMENT'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="w-44"
          >
            <option value="">All statuses</option>
            {['PENDING_UPLOAD', 'PROCESSING', 'READY', 'FAILED', 'DELETED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={unused}
              onChange={() => toggleFlag('unused')}
            />
            Unused
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={duplicates}
              onChange={() => toggleFlag('duplicates')}
            />
            Duplicates
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={() => toggleFlag('includeDeleted')}
            />
            Include deleted
          </label>
        </div>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load media" onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyState title="No media found" description="Try adjusting filters or search." />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Preview</Th>
                <Th>Filename</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Size</Th>
                <Th>Owner</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((item) => {
                const thumb =
                  item.urls?.thumbnail ??
                  item.urls?.small ??
                  item.blurDataUrl ??
                  null;
                const ownerLabel =
                  item.owner?.displayName ||
                  item.owner?.email ||
                  item.owner?.phone ||
                  item.ownerId ||
                  '—';
                const deleted = Boolean(item.deletedAt) || item.status === 'DELETED';
                return (
                  <tr key={item.id}>
                    <Td>
                      <div className="h-12 w-12 overflow-hidden rounded bg-surface-muted">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-ink-secondary">
                            {item.mediaType.slice(0, 3)}
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="max-w-[200px]">
                        <p className="truncate font-medium text-ink">
                          {item.filename || item.originalKey.split('/').pop() || item.id}
                        </p>
                        <p className="truncate text-xs text-ink-secondary">{item.id}</p>
                      </div>
                    </Td>
                    <Td>
                      <Badge>{item.mediaType}</Badge>
                    </Td>
                    <Td>
                      <Badge tone={statusBadgeTone(item.status)}>{item.status}</Badge>
                    </Td>
                    <Td>{formatBytes(item.byteSize)}</Td>
                    <Td>
                      <span className="text-sm text-ink">{ownerLabel}</span>
                    </Td>
                    <Td>{formatDate(item.createdAt)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {deleted ? (
                          <Button size="sm" variant="secondary" onClick={() => void runRestore(item.id)}>
                            Restore
                          </Button>
                        ) : (
                          <Button size="sm" variant="danger" onClick={() => void runDelete(item.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            page={query.data.page}
            totalPages={query.data.totalPages}
            onPageChange={(p) => setParam('page', String(p))}
          />
        </>
      )}
    </div>
  );
}
