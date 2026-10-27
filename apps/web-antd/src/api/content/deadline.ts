import { requestClient } from '#/api/request';

import type { CreateUpdateDeadlineInput, DeadlineItem } from './types';

export async function getDeadlinesApi() {
  return await requestClient.get<DeadlineItem[]>('/api/deadlines');
}

export async function createDeadlineApi(data: CreateUpdateDeadlineInput) {
  return await requestClient.post<DeadlineItem>('/api/deadlines', data);
}

export async function updateDeadlineApi(
  id: string,
  data: CreateUpdateDeadlineInput,
) {
  return await requestClient.put<DeadlineItem>(`/api/deadlines/${id}`, data);
}

export async function deleteDeadlineApi(id: string) {
  return await requestClient.delete(`/api/deadlines/${id}`);
}
