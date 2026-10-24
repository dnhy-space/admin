import { requestClient } from '#/api/request';

import type { DashboardSummary } from './types';

export async function getDashboardSummaryApi() {
  return await requestClient.get<DashboardSummary>('/api/dashboard/summary');
}
