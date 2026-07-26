'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { GOVERNORATES } from '@/features/plates/domain/governorates';
import { IRAQI_GOVERNORATES, type IraqiGovernorate } from '@/features/plates/domain/types';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Table,
  Td,
  Th,
  useToast,
} from '@/components/ui';

export default function PlatePrefixesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [governorate, setGovernorate] = useState<IraqiGovernorate | ''>('');
  const [open, setOpen] = useState(false);
  const [formatCode, setFormatCode] = useState('IQ_BAGHDAD');
  const [letter, setLetter] = useState('');
  const [label, setLabel] = useState('');
  const filterFormat = governorate ? GOVERNORATES[governorate].formatCode : '';

  const query = useQuery({
    queryKey: ['admin', 'plates', 'catalog', 'prefixes', filterFormat],
    queryFn: () => adminApi.plates.catalog.prefixes.list(filterFormat || undefined),
  });

  const create = useMutation({
    mutationFn: () =>
      adminApi.plates.catalog.prefixes.create({
        formatCode: formatCode.trim().toUpperCase(),
        letter: letter.trim().toUpperCase(),
        label: label.trim() || undefined,
      }),
    onSuccess: () => {
      toast('Prefix created', 'success');
      setOpen(false);
      setLetter('');
      setLabel('');
      void qc.invalidateQueries({ queryKey: ['admin', 'plates', 'catalog', 'prefixes'] });
    },
    onError: (e: Error) => toast(e.message || 'Create failed', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="Plate prefixes"
        description="Series letters allowed per governorate format code."
        action={
          <Button variant={open ? 'secondary' : 'primary'} onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : 'Add prefix'}
          </Button>
        }
      />

      {open ? (
        <Card className="mb-4 space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Format code"
              value={formatCode}
              onChange={(e) => setFormatCode(e.target.value)}
            >
              {IRAQI_GOVERNORATES.map((gov) => (
                <option key={gov} value={GOVERNORATES[gov].formatCode}>
                  {GOVERNORATES[gov].nameEn} ({GOVERNORATES[gov].formatCode})
                </option>
              ))}
            </Select>
            <Input
              label="Letter"
              value={letter}
              onChange={(e) => setLetter(e.target.value.toUpperCase())}
            />
            <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <Button
            disabled={!formatCode.trim() || !letter.trim() || create.isPending}
            onClick={() => void create.mutateAsync()}
          >
            Create prefix
          </Button>
        </Card>
      ) : null}

      <Card className="mb-4 p-4">
        <Select
          label="Filter by governorate"
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value as IraqiGovernorate | '')}
          className="max-w-md"
        >
          <option value="">All formats</option>
          {IRAQI_GOVERNORATES.map((gov) => (
            <option key={gov} value={gov}>
              {GOVERNORATES[gov].nameEn} ({GOVERNORATES[gov].formatCode})
            </option>
          ))}
        </Select>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-64" />
      ) : query.isError ? (
        <ErrorState message="Failed to load prefixes" onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState title="No prefixes" description="Try a different format code filter." />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Format code</Th>
                <Th>Letter</Th>
                <Th>Label</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.map((row) => (
                <tr key={row.id}>
                  <Td>{row.formatCode}</Td>
                  <Td>{row.letter}</Td>
                  <Td>{row.label ?? '—'}</Td>
                  <Td>
                    <Badge tone={row.active === false ? 'neutral' : 'success'}>
                      {row.active === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
