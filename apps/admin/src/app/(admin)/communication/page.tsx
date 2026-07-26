'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Skeleton,
  Table,
  Td,
  Th,
  formatDate,
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

export default function CommunicationAdminPage() {
  const confirm = useConfirm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState('');
  const [messageId, setMessageId] = useState('');

  const stats = useQuery({
    queryKey: ['admin', 'communication', 'stats'],
    queryFn: () => adminApi.communication.stats(),
  });

  const reports = useQuery({
    queryKey: ['admin', 'communication', 'reports'],
    queryFn: () => adminApi.communication.reports({ page: 1, pageSize: 20, status: 'OPEN' }),
  });

  const blocks = useQuery({
    queryKey: ['admin', 'communication', 'blocks'],
    queryFn: () => adminApi.communication.blocks({ page: 1, pageSize: 20 }),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ['admin', 'communication'] });

  const resolve = async (id: string, status: 'RESOLVED' | 'REJECTED') => {
    const ok = await confirm({
      title: `${status === 'RESOLVED' ? 'Resolve' : 'Reject'} conversation report?`,
      confirmLabel: status === 'RESOLVED' ? 'Resolve' : 'Reject',
    });
    if (!ok) return;
    try {
      await adminApi.communication.resolveReport(id, {
        status,
        resolution: resolution || undefined,
      });
      toast('Report updated', 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const removeMessage = async () => {
    if (!messageId.trim()) return;
    const ok = await confirm({
      title: 'Remove flagged message?',
      variant: 'danger',
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    try {
      await adminApi.communication.moderate({
        action: 'remove_message',
        messageId: messageId.trim(),
      });
      toast('Message removed', 'success');
      setMessageId('');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Communication"
        description="Conversation stats, reported threads, blocked users, and moderation tools."
      />

      {stats.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : stats.isError ? (
        <ErrorState message="Could not load stats" onRetry={() => void stats.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Conversations', stats.data?.conversations],
            ['Messages', stats.data?.messages],
            ['Open reports', stats.data?.openReports],
            ['Blocks', stats.data?.blocks],
            ['Flagged messages', stats.data?.flaggedMessages],
          ].map(([label, value]) => (
            <Card key={String(label)} className="p-4">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-2xl font-semibold">{value ?? 0}</div>
            </Card>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reported conversations</h2>
        <Input
          label="Resolution note"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Optional resolution details"
        />
        {reports.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !reports.data?.items.length ? (
          <EmptyState title="No open conversation reports" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reason</Th>
                <Th>Reporter</Th>
                <Th>Conversation</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {reports.data.items.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <Badge tone={statusBadgeTone(r.status)}>{r.reason}</Badge>
                  </Td>
                  <Td>{r.reporter?.displayName ?? r.reporter?.id ?? '—'}</Td>
                  <Td className="font-mono text-xs">{r.conversationId}</Td>
                  <Td>{formatDate(r.createdAt)}</Td>
                  <Td className="space-x-2">
                    <Button size="sm" onClick={() => void resolve(r.id, 'RESOLVED')}>
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void resolve(r.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        void adminApi.communication
                          .moderate({
                            action: 'hide_conversation',
                            conversationId: r.conversationId,
                          })
                          .then(() => {
                            toast('Conversation hidden', 'success');
                            invalidate();
                          })
                          .catch((e) =>
                            toast(e instanceof Error ? e.message : 'Failed', 'error'),
                          )
                      }
                    >
                      Hide thread
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Blocked users</h2>
        {blocks.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !blocks.data?.items.length ? (
          <EmptyState title="No blocks recorded" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Blocker</Th>
                <Th>Blocked</Th>
                <Th>Reason</Th>
                <Th>When</Th>
              </tr>
            </thead>
            <tbody>
              {blocks.data.items.map((b) => (
                <tr key={b.id}>
                  <Td>{b.blocker?.displayName ?? b.blocker?.id ?? '—'}</Td>
                  <Td>{b.blocked?.displayName ?? b.blocked?.id ?? '—'}</Td>
                  <Td>{b.reason ?? '—'}</Td>
                  <Td>{formatDate(b.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Moderation tools</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Message ID"
            value={messageId}
            onChange={(e) => setMessageId(e.target.value)}
            placeholder="Soft-delete a flagged message"
          />
          <Button variant="danger" onClick={() => void removeMessage()}>
            Remove message
          </Button>
        </div>
      </section>
    </div>
  );
}
