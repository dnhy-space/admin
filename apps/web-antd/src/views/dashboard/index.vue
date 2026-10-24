<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getDashboardSummaryApi } from '#/api/content';
import type { DashboardSummary } from '#/api/content';
import { formatDateTime } from '#/utils/format';

defineOptions({ name: 'Dashboard' });

const router = useRouter();
const loading = ref(true);
const summary = ref<DashboardSummary>();

onMounted(async () => {
  try {
    summary.value = await getDashboardSummaryApi();
  } finally {
    loading.value = false;
  }
});

const cards = computed(() => [
  { label: '本月日记', value: summary.value?.diaryCountThisMonth ?? 0 },
  { label: '本月随想', value: summary.value?.thoughtCountThisMonth ?? 0 },
  { label: '公开内容', value: summary.value?.publicCount ?? 0 },
  { label: '私密内容', value: summary.value?.privateCount ?? 0 },
  { label: '待办日程', value: summary.value?.pendingScheduleCount ?? 0 },
  { label: '近 7 天完成', value: summary.value?.completedScheduleCount ?? 0 },
  { label: '评论总数', value: summary.value?.totalCommentCount ?? 0 },
  { label: '点赞总数', value: summary.value?.totalLikeCount ?? 0 },
]);
</script>

<template>
  <div class="p-5">
    <a-spin :spinning="loading">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight">概览</h2>
          <p class="mt-1 text-sm text-gray-500">今天也写一点吧。</p>
        </div>
        <a-space>
          <a-button @click="router.push('/content/schedule')">
            查看日程
          </a-button>
          <a-button
            type="primary"
            @click="router.push('/content/posts/create')"
          >
            写点什么
          </a-button>
        </a-space>
      </div>

      <a-row :gutter="[16, 16]">
        <a-col
          v-for="card in cards"
          :key="card.label"
          :lg="6"
          :sm="12"
          :xs="12"
        >
          <a-card :bordered="true">
            <a-statistic :title="card.label" :value="card.value" />
          </a-card>
        </a-col>
      </a-row>

      <a-card class="mt-4" title="最新评论">
        <a-empty
          v-if="!summary?.recentComments?.length"
          description="还没有评论"
        />
        <a-list v-else :data-source="summary.recentComments" item-layout="horizontal">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <span class="text-sm font-medium">{{ item.authorName }}</span>
                  <span class="ml-2 text-xs text-gray-400">
                    @{{ item.authorLogin }}
                  </span>
                </template>
                <template #description>
                  <div class="text-sm text-gray-600">{{ item.content }}</div>
                  <div class="mt-1 text-xs text-gray-400">
                    {{ formatDateTime(item.creationTime) }}
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-spin>
  </div>
</template>
