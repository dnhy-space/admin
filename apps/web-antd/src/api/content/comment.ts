import { requestClient } from '#/api/request';

import type { CommentItem, PagedResult } from './types';

export async function getCommentsApi(params: {
  MaxResultCount?: number;
  PostId: string;
  SkipCount?: number;
}) {
  return await requestClient.get<PagedResult<CommentItem>>('/api/comments', {
    params,
  });
}

export async function deleteCommentApi(id: string) {
  return await requestClient.delete<void>(`/api/comments/${id}`);
}
