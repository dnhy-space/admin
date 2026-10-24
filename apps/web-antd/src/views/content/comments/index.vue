<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  deleteCommentApi,
  getCommentsApi,
  getPostsApi,
} from '#/api/content';
import type { CommentItem, PostListItem } from '#/api/content';
import { formatDateTime } from '#/utils/format';

import { message } from 'ant-design-vue';

defineOptions({ name: 'ContentComments' });

const loading = ref(false);
const posts = ref<PostListItem[]>([]);
const postId = ref<null | string>(null);
const comments = ref<CommentItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const pageLoading = ref(false);

const columns = [
  { dataIndex: 'authorName', key: 'author', title: '作者', width: 180 },
  { dataIndex: 'content', key: 'content', title: '内容' },
  { dataIndex: 'creationTime', key: 'creationTime', title: '时间', width: 180 },
  { key: 'action', title: '操作', width: 100 },
];

async function loadPosts() {
  const result = await getPostsApi({ MaxResultCount: 100, SkipCount: 0 });
  posts.value = result.items;
  if (!postId.value && result.items[0]) {
    postId.value = result.items[0].id;
  }
}

async function loadComments() {
  if (!postId.value) {
    comments.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const result = await getCommentsApi({
      MaxResultCount: pageSize.value,
      PostId: postId.value,
      SkipCount: (page.value - 1) * pageSize.value,
    });
    comments.value = result.items;
    total.value = result.totalCount;
  } finally {
    loading.value = false;
  }
}

async function handleChange(pagination: {
  current?: number;
  pageSize?: number;
}) {
  page.value = pagination.current ?? 1;
  pageSize.value = pagination.pageSize ?? 20;
  await loadComments();
}

async function handlePostChange() {
  page.value = 1;
  await loadComments();
}

async function remove(record: CommentItem) {
  pageLoading.value = true;
  try {
    await deleteCommentApi(record.id);
    message.success('评论已删除');
    await loadComments();
  } finally {
    pageLoading.value = false;
  }
}

onMounted(async () => {
  await loadPosts();
  await loadComments();
});
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">评论</h2>
        <p class="mt-1 text-sm text-gray-500">
          访客通过 GitHub 登录后发表评论，这里可以清理不合适的内容。
        </p>
      </div>
    </div>

    <a-card :bordered="true">
      <a-select
        v-model:value="postId"
        :options="
          posts.map((post) => ({
            label: post.title || post.summary || post.id,
            value: post.id,
          }))
        "
        class="mb-4"
        placeholder="选择一条内容"
        show-search
        style="width: 320px"
        option-filter-prop="label"
        @change="handlePostChange"
      />

      <a-table
        :columns="columns"
        :data-source="comments"
        :loading="loading || pageLoading"
        :pagination="{
          current: page,
          pageSize,
          showSizeChanger: true,
          total,
        }"
        row-key="id"
        @change="handleChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'author'">
            <div class="font-medium">{{ record.authorName }}</div>
            <div class="text-xs text-gray-400">@{{ record.authorLogin }}</div>
          </template>

          <template v-else-if="column.key === 'content'">
            <div class="whitespace-pre-wrap text-sm">{{ record.content }}</div>
          </template>

          <template v-else-if="column.key === 'creationTime'">
            <span class="text-sm text-gray-500">
              {{ formatDateTime(record.creationTime) }}
            </span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-popconfirm
              cancel-text="取消"
              ok-text="删除"
              title="确定删除这条评论吗？"
              @confirm="remove(record)"
            >
              <a-button danger size="small" type="link">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
