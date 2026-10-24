import { requestClient } from '#/api/request';

import type {
  CreateUpdatePostInput,
  PagedResult,
  PostDetail,
  PostListItem,
  PostType,
  PostVisibility,
} from './types';

export interface GetPostsParams {
  Filter?: string;
  MaxResultCount?: number;
  SkipCount?: number;
  Type?: PostType;
  Visibility?: PostVisibility;
}

export async function getPostsApi(params: GetPostsParams) {
  return await requestClient.get<PagedResult<PostListItem>>('/api/posts', {
    params,
  });
}

export async function getPostApi(id: string) {
  return await requestClient.get<PostDetail>(`/api/posts/${id}`);
}

export async function createPostApi(data: CreateUpdatePostInput) {
  return await requestClient.post<PostDetail>('/api/posts', data);
}

export async function updatePostApi(
  id: string,
  data: CreateUpdatePostInput,
) {
  return await requestClient.put<PostDetail>(`/api/posts/${id}`, data);
}

export async function deletePostApi(id: string) {
  return await requestClient.delete<void>(`/api/posts/${id}`);
}

export async function publishPostApi(id: string) {
  return await requestClient.post<PostDetail>(`/api/posts/${id}/publish`);
}

export async function hidePostApi(id: string) {
  return await requestClient.post<PostDetail>(`/api/posts/${id}/hide`);
}
