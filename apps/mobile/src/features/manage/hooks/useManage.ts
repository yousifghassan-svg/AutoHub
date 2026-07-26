import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManageRepository } from '../di';
import type { ManagedItem, ManageStatus, ManageStatusTab } from '../domain/types';

export const manageKeys = {
  all: ['manage'] as const,
  list: (domain: 'VEHICLE' | 'PLATE', tab: ManageStatusTab) =>
    [...manageKeys.all, domain, tab] as const,
};

export function useManageInfinite(domain: 'VEHICLE' | 'PLATE', tab: ManageStatusTab) {
  return useInfiniteQuery({
    queryKey: manageKeys.list(domain, tab),
    queryFn: ({ pageParam }) =>
      getManageRepository().listMine({ domain, tab, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useManageChangeStatus(domain: 'VEHICLE' | 'PLATE') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: ManageStatus; title?: string }) =>
      getManageRepository().changeStatus(domain, input.id, input.status, input.title),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: manageKeys.all });
    },
  });
}

export function useManageDelete(domain: 'VEHICLE' | 'PLATE') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getManageRepository().softDelete(domain, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: manageKeys.all });
    },
  });
}

export function useManageDuplicate(domain: 'VEHICLE' | 'PLATE') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: ManagedItem) => getManageRepository().duplicate(domain, item),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: manageKeys.all });
    },
  });
}
