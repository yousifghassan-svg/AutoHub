'use client';

import { useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Table,
  Td,
  Th,
} from '@/components/ui';

type PlateProvince = {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  plateFormats?: Array<{ code: string; regionCode?: string | null }>;
};

export default function PlateProvincesPage() {
  const query = useQuery({
    queryKey: ['plates', 'catalog', 'provinces'],
    queryFn: () => getHttpClient().get<PlateProvince[]>('/v1/plates/catalog/provinces', false),
  });

  const rows =
    query.data?.flatMap((gov) => {
      const formats = gov.plateFormats?.length
        ? gov.plateFormats
        : [{ code: '—', regionCode: null }];
      return formats.map((format) => ({
        key: `${gov.id}-${format.code}`,
        nameEn: gov.nameEn,
        nameAr: gov.nameAr,
        formatCode: format.code,
        defaultRegionCode: format.regionCode ?? null,
        catalogCode: gov.code,
      }));
    }) ?? [];

  return (
    <div>
      <PageHeader
        title="Plate provinces"
        description="Governorates and format codes from /v1/plates/catalog/provinces."
      />

      {query.isLoading ? (
        <Skeleton className="h-64" />
      ) : query.isError ? (
        <ErrorState message="Failed to load provinces" onRetry={() => void query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No provinces returned" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Governorate</Th>
                <Th>Arabic</Th>
                <Th>Format code</Th>
                <Th>Default region</Th>
                <Th>Catalog code</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.key}>
                  <Td>{row.nameEn}</Td>
                  <Td>{row.nameAr ?? '—'}</Td>
                  <Td>{row.formatCode}</Td>
                  <Td>{row.defaultRegionCode ?? '—'}</Td>
                  <Td>{row.catalogCode}</Td>
                  <Td>
                    <Badge tone="success">Active</Badge>
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
