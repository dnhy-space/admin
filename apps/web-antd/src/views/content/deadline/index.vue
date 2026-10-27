<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import { onMounted, reactive, ref } from 'vue';

import {
  createDeadlineApi,
  deleteDeadlineApi,
  getDeadlinesApi,
  updateDeadlineApi,
  DEADLINE_STATUS_LABEL,
} from '#/api/content';
import type {
  CreateUpdateDeadlineInput,
  DeadlineItem,
  DeadlineStatus,
} from '#/api/content';
import { formatDate } from '#/utils/format';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

defineOptions({ name: 'ContentDeadline' });

const DEFAULT_ACCENT = '#0070f3';
const PALETTE = [
  DEFAULT_ACCENT,
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#71717a',
];

const STATUS_COLOR: Record<DeadlineStatus, string> = {
  1: 'blue',
  2: 'orange',
  3: 'default',
};

const loading = ref(false);
const items = ref<DeadlineItem[]>([]);
const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<null | string>(null);

const form = reactive<{
  accentColor: string;
  description: string;
  dueDate: Dayjs | null;
  projectName: string;
  sortOrder: number;
  startDate: Dayjs | null;
}>({
  accentColor: DEFAULT_ACCENT,
  description: '',
  dueDate: null,
  projectName: '',
  sortOrder: 0,
  startDate: null,
});

const columns = [
  { dataIndex: 'projectName', key: 'projectName', title: '项目' },
  { key: 'range', title: '周期', width: 240 },
  { key: 'progress', title: '进度', width: 260 },
  { key: 'status', title: '状态', width: 110 },
  { dataIndex: 'sortOrder', key: 'sortOrder', title: '排序', width: 80 },
  { key: 'action', title: '操作', width: 140 },
];

function remainingLabel(record: DeadlineItem) {
  if (record.status === 3) {
    return `已过期 ${Math.abs(record.daysRemaining)} 天`;
  }
  if (record.daysRemaining === 0) {
    return '今天到期';
  }
  return `还有 ${record.daysRemaining} 天`;
}

function statusLabel(status: number) {
  return DEADLINE_STATUS_LABEL[status as DeadlineStatus] ?? '-';
}

function statusColor(status: number) {
  return STATUS_COLOR[status as DeadlineStatus] ?? 'default';
}

async function load() {
  loading.value = true;
  try {
    items.value = await getDeadlinesApi();
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.projectName = '';
  form.description = '';
  form.accentColor = DEFAULT_ACCENT;
  form.sortOrder = items.value.length + 1;
  form.startDate = dayjs().startOf('day');
  form.dueDate = dayjs().add(14, 'day').startOf('day');
}

function openCreate() {
  editingId.value = null;
  resetForm();
  modalOpen.value = true;
}

function openEdit(item: DeadlineItem) {
  editingId.value = item.id;
  form.projectName = item.projectName;
  form.description = item.description ?? '';
  form.accentColor = item.accentColor ?? '';
  form.sortOrder = item.sortOrder;
  form.startDate = dayjs(item.startDate);
  form.dueDate = dayjs(item.dueDate);
  modalOpen.value = true;
}

async function save() {
  if (!form.projectName.trim()) {
    message.warning('请填写项目名称');
    return;
  }

  if (!form.startDate || !form.dueDate) {
    message.warning('请选择开始日期和到期日期');
    return;
  }

  if (form.dueDate.isBefore(form.startDate, 'day')) {
    message.warning('到期日期不能早于开始日期');
    return;
  }

  const payload: CreateUpdateDeadlineInput = {
    accentColor: form.accentColor || null,
    description: form.description || null,
    dueDate: form.dueDate.format('YYYY-MM-DD'),
    projectName: form.projectName.trim(),
    sortOrder: form.sortOrder,
    startDate: form.startDate.format('YYYY-MM-DD'),
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await updateDeadlineApi(editingId.value, payload);
      message.success('Deadline 已更新');
    } else {
      await createDeadlineApi(payload);
      message.success('Deadline 已创建');
    }
    modalOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}

async function remove(record: DeadlineItem) {
  await deleteDeadlineApi(record.id);
  message.success('Deadline 已删除');
  await load();
}

onMounted(load);
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Deadline</h2>
        <p class="mt-1 text-sm text-gray-500">
          设置项目名称与到期日期，前台会按时间自动推进进度条。
        </p>
      </div>
      <a-button type="primary" @click="openCreate">新建 Deadline</a-button>
    </div>

    <a-card :bordered="true">
      <a-table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectName'">
            <div class="font-medium">{{ record.projectName }}</div>
            <div
              v-if="record.description"
              class="mt-0.5 line-clamp-2 max-w-md text-xs text-gray-400"
            >
              {{ record.description }}
            </div>
          </template>

          <template v-else-if="column.key === 'range'">
            <div class="text-sm text-gray-600">
              {{ formatDate(record.startDate) }} →
              {{ formatDate(record.dueDate) }}
            </div>
          </template>

          <template v-else-if="column.key === 'progress'">
            <div class="flex items-center gap-3">
              <a-progress
                :percent="record.progressPercent"
                :show-info="false"
                :stroke-color="record.accentColor || '#0070f3'"
                class="flex-1"
                size="small"
              />
              <span class="w-10 text-right text-xs tabular-nums text-gray-500">
                {{ record.progressPercent }}%
              </span>
            </div>
            <div
              class="mt-1 text-xs"
              :class="record.status === 3 ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ remainingLabel(record) }}
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">
              {{ statusLabel(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-button size="small" type="link" @click="openEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              cancel-text="取消"
              ok-text="删除"
              title="确定删除这个 deadline 吗？"
              @confirm="remove(record)"
            >
              <a-button danger size="small" type="link">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :confirm-loading="saving"
      :title="editingId ? '编辑 Deadline' : '新建 Deadline'"
      cancel-text="取消"
      destroy-on-close
      ok-text="保存"
      @ok="save"
    >
      <a-form layout="vertical">
        <a-form-item label="项目名称" required>
          <a-input
            v-model:value="form.projectName"
            :maxlength="200"
            placeholder="例如：dnhy-space 视觉改版"
          />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="开始日期" required>
              <a-date-picker v-model:value="form.startDate" class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="到期日期" required>
              <a-date-picker v-model:value="form.dueDate" class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="描述">
          <a-textarea
            v-model:value="form.description"
            :maxlength="2000"
            :rows="3"
            placeholder="补充说明（可选）"
          />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="强调色">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="color in PALETTE"
                  :key="color"
                  :style="{ backgroundColor: color }"
                  :class="
                    form.accentColor === color
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : ''
                  "
                  class="h-6 w-6 rounded-full border border-gray-200 transition"
                  title="选择颜色"
                  type="button"
                  @click="form.accentColor = color"
                ></button>
                <a-button
                  v-if="form.accentColor"
                  size="small"
                  type="link"
                  @click="form.accentColor = ''"
                >
                  清除
                </a-button>
              </div>
              <a-input
                v-model:value="form.accentColor"
                class="mt-2"
                placeholder="#0070f3"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model:value="form.sortOrder" class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
