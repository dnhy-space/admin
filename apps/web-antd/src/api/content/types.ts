export type PostType = 1 | 2;
export type PostVisibility = 1 | 2;

export const POST_TYPE_LABEL: Record<PostType, string> = {
  1: '随想',
  2: '日记',
};

export const POST_VISIBILITY_LABEL: Record<PostVisibility, string> = {
  1: '私密',
  2: '公开',
};

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface PostListItem {
  commentCount: number;
  creationTime: string;
  id: string;
  isArchived: boolean;
  isLikedByMe: boolean;
  likeCount: number;
  occurredAt: string;
  summary: string;
  title: string;
  type: PostType;
  visibility: PostVisibility;
}

export interface PostDetail extends PostListItem {
  content: string;
}

export interface CreateUpdatePostInput {
  content: string;
  occurredAt?: null | string;
  title?: string;
  type: PostType;
  visibility: PostVisibility;
}

export interface CommentItem {
  authorAvatarUrl?: null | string;
  authorGithubId: number;
  authorLogin: string;
  authorName: string;
  content: string;
  creationTime: string;
  id: string;
  postId: string;
}

export interface ScheduleItem {
  allDay: boolean;
  creationTime: string;
  endTime?: null | string;
  id: string;
  isCompleted: boolean;
  notes?: null | string;
  startTime: string;
  title: string;
}

export interface CreateUpdateScheduleInput {
  allDay: boolean;
  endTime?: null | string;
  isCompleted: boolean;
  notes?: null | string;
  startTime: string;
  title: string;
}

export type DeadlineStatus = 1 | 2 | 3;

export const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  1: '进行中',
  2: '即将到期',
  3: '已过期',
};

export interface DeadlineItem {
  accentColor?: null | string;
  creationTime: string;
  daysRemaining: number;
  description?: null | string;
  dueDate: string;
  id: string;
  progressPercent: number;
  projectName: string;
  sortOrder: number;
  startDate: string;
  status: DeadlineStatus;
}

export interface CreateUpdateDeadlineInput {
  accentColor?: null | string;
  description?: null | string;
  dueDate: string;
  projectName: string;
  sortOrder: number;
  startDate: string;
}

export interface DashboardSummary {
  completedScheduleCount: number;
  diaryCountThisMonth: number;
  pendingScheduleCount: number;
  privateCount: number;
  publicCount: number;
  recentComments: CommentItem[];
  thoughtCountThisMonth: number;
  totalCommentCount: number;
  totalLikeCount: number;
}
