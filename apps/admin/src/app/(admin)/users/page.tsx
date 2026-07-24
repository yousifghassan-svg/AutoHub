'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.repository';
import type { UserRole, UserStatus } from '@/lib/api/types';
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

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const role = (searchParams.get('role') as UserRole | null) ?? undefined;
  const status = (searchParams.get('status') as UserStatus | null) ?? undefined;

  const query = useQuery({
    queryKey: ['admin', 'users', { page, q, role, status }],
    queryFn: () =>
      adminApi.users.list({ page, pageSize: 20, q: q || undefined, role, status }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const run = async (label: string, fn: () => Promise<unknown>, danger = false) => {
    const ok = await confirm({
      title: `${label}?`,
      variant: danger ? 'danger' : 'primary',
      confirmLabel: label,
    });
    if (!ok) return;
    try {
      await fn();
      toast(`${label} successful`, 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Action failed', 'error');
    }
  };

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminApi.users.update(id, { role }),
    onSuccess: () => {
      toast('Role updated', 'success');
      invalidate();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Update failed', 'error'),
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/users?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users and roles." />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap gap-4">
          <Select
            label="Role"
            value={role ?? ''}
            onChange={(e) => setParam('role', e.target.value)}
            className="w-44"
          >
            <option value="">All roles</option>
            {(
              ['USER', 'DEALER', 'MODERATOR', 'DEALER_MANAGER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]
            ).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={status ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className="w-44"
          >
            <option value="">All statuses</option>
            {(['ACTIVE', 'SUSPENDED', 'DELETED'] as UserStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load users" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((user) => (
                <tr key={user.id}>
                  <Td>{user.displayName ?? '—'}</Td>
                  <Td>{user.phone ?? '—'}</Td>
                  <Td>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        updateRole.mutate({ id: user.id, role: e.target.value as UserRole })
                      }
                      className="h-8 min-w-[140px] text-xs"
                      aria-label={`Role for ${user.displayName ?? user.phone}`}
                    >
                      {(
                        ['USER', 'DEALER', 'MODERATOR', 'DEALER_MANAGER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]
                      ).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Badge tone={statusBadgeTone(user.status)}>{user.status}</Badge>
                  </Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void run('Suspend', () => adminApi.users.suspend(user.id))}
                      >
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void run('Activate', () => adminApi.users.activate(user.id))}
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void run('Verify dealer', () => adminApi.users.verifyDealer(user.id))
                        }
                      >
                        Verify dealer
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          void run('Delete', () => adminApi.users.delete(user.id), true)
                        }
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
    </div>
  );
}
