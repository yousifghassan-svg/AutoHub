import { getHttpClient } from '@/lib/api/client';
import { createManageRepository, type ManageRepository } from './data/manage.repository';

let repo: ManageRepository | null = null;

export function getManageRepository(): ManageRepository {
  if (!repo) repo = createManageRepository(getHttpClient());
  return repo;
}
