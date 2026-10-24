<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  deletePostApi,
  getPostsApi,
  hidePostApi,
  publishPostApi,
} from '#/api/content';
import type { PostListItem, PostType, PostVisibility } from '#/api/content';
import { formatDateTime } from '#/utils/format';

import { message } from 'ant-design-vue';

defineOptions({ name: 'ContentPosts' });

const router = useRouter();

const loading = ref(false);
const items = ref<PostListItem[]>([]);
const total = ref(0);

const query = reactive({
  filter: '',
  page: 1,
  pageSize: 10,
  type: undefined as PostType | undefined,
  visibility: undefined as PostVisibility | undefined,
});

const columns = [
  { dataIndex: 'title', ellipsis: true, key: 'title', title: '标题' },
  { key: 'type', title: '类型', width: 90 },
  { key: 'visibility', title: '可见性', width: 90 },
  { dataIndex: 'occurredAt', key: 'occurredAt', title: '时间', width: 170 },
  { key: 'stats', title: '互动', width: 110 },
  { key: 'action', title: '操作', width: 210 },
];

async function fetchData() {
  loading.value = true;
  try {
    const result = await getPostsApi({
      Filter: query.filter || undefined,
      MaxResultCount: query.pageSize,
      SkipCount: (query.page - 1) * query.pageSize,
      Type: query.type,
      Visibility: query.visibility,
    });
    items.value = result.items;
    total.value = result.totalCount;
  } finally {
    loading.value = false;
  }
}

function handleTableChange(pagination: {
  current?: number;
  pageSize?: number;
}) {
  query.page = pagination.current ?? 1;
  query.pageSize = pagination.pageSize ?? 10;
  fetchData();
}

function resetAndFetch() {
  query.page = 1;
  fetchData();
}

async function toggleVisibility(record: PostListItem) {
  if (record.visibility === 2) {
    await hidePostApi(record.id);
    message.success('已设为私密');
  } else {
    await publishPostApi(record.id);
    message.success('已公开');
  }
  await fetchData();
}

async function remove(record: PostListItem) {
  await deletePostApi(record.id);
  message.success('已删除');
  await fetchData();
}

onMounted(fetchData);
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">日记与随想</h2>
        <p class="mt-1 text-sm text-gray-500">按时间线管理你的内容。</p>
      </div>
      <a-button type="primary" @click="router.push('/content/posts/create')">
        新建内容
      </a-button>
    </div>

    <a-card :bordered="true">
      <a-space class="mb-4" wrap>
        <a-input-search
          v-model:value="query.filter"
          allow-clear
          placeholder="搜索标题或正文"
          style="width: 240px"
          @search="resetAndFetch"
        />
        <a-select
          v-model:value="query.type"
          allow-clear
          placeholder="类型"
          style="width: 120px"
          @change="resetAndFetch"
        >
          <a-select-option :value="1">随想</a-select-option>
          <a-select-option :value="2">日记</a-select-option>
        </a-select>
        <a-select
          v-model:value="query.visibility"
          allow-clear
          placeholder="可见性"
          style="width: 120px"
          @change="resetAndFetch"
        >
          <a-select-option :value="2">公开</a-select-option>
          <a-select-option :value="1">私密</a-select-option>
        </a-select>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        :pagination="{
          current: query.page,
          pageSize: query.pageSize,
          showSizeChanger: true,
          showTotal: (value: number) => `共 ${value} 条`,
          total,
        }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="font-medium">
              {{ record.title || '(无标题随想)' }}
            </div>
            <div class="mt-0.5 line-clamp-1 text-xs text-gray-400">
              {{ record.summary }}
            </div>
          </template>

          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 2 ? 'blue' : 'default'">
              {{ record.type === 2 ? '日记' : '随想' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'visibility'">
            <a-tag :color="record.visibility === 2 ? 'green' : 'default'">
              {{ record.visibility === 2 ? '公开' : '私密' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'occurredAt'">
            <span class="text-sm text-gray-600">
              {{ formatDateTime(record.occurredAt) }}
            </span>
          </template>

          <template v-else-if="column.key === 'stats'">
            <span class="text-sm text-gray-500">
              ♥ {{ record.likeCount }} · 💬 {{ record.commentCount }}
            </span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                size="small"
                type="link"
                @click="router.push(`/content/posts/${record.id}/edit`)"
              >
                编辑
              </a-button>
              <a-button size="small" type="link" @click="toggleVisibility(record)">
                {{ record.visibility === 2 ? '设为私密' : '公开' }}
              </a-button>
              <a-popconfirm
                cancel-text="取消"
                ok-text="删除"
                title="确定删除这条内容吗？"
                @confirm="remove(record)"
              >
                <a-button danger size="small" type="link">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
