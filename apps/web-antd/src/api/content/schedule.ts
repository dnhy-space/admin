import { requestClient } from '#/api/request';

import type { CreateUpdateScheduleInput, ScheduleItem } from './types';

export async function getSchedulesApi(from: string, to: string) {
  return await requestClient.get<ScheduleItem[]>('/api/schedules', {
    params: { From: from, To: to },
  });
}

export async function createScheduleApi(data: CreateUpdateScheduleInput) {
  return await requestClient.post<ScheduleItem>('/api/schedules', data);
}

export async function updateScheduleApi(
  id: string,
  data: CreateUpdateScheduleInput,
) {
  return await requestClient.put<ScheduleItem>(`/api/schedules/${id}`, data);
}

export async function deleteScheduleApi(id: string) {
  return await requestClient.delete<void>(`/api/schedules/${id}`);
}

export async function toggleScheduleApi(id: string) {
  return await requestClient.post<ScheduleItem>(`/api/schedules/${id}/toggle`);
}
