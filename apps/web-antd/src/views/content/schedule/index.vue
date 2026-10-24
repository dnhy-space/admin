<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  createScheduleApi,
  deleteScheduleApi,
  getSchedulesApi,
  toggleScheduleApi,
  updateScheduleApi,
} from '#/api/content';
import type { ScheduleItem } from '#/api/content';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

defineOptions({ name: 'ContentSchedule' });

const loading = ref(false);
const items = ref<ScheduleItem[]>([]);
const view = ref<'month' | 'week'>('month');
const cursor = ref(dayjs());
const modalOpen = ref(false);
const saving = ref(false);
const editingId = ref<null | string>(null);

const form = reactive<{
  allDay: boolean;
  endTime: Dayjs | null;
  isCompleted: boolean;
  notes: string;
  startTime: Dayjs | null;
  title: string;
}>({
  allDay: false,
  endTime: null,
  isCompleted: false,
  notes: '',
  startTime: null,
  title: '',
});

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function startOfWeek(value: Dayjs) {
  const offset = (value.day() + 6) % 7;
  return value.startOf('day').subtract(offset, 'day');
}

const days = computed(() => {
  if (view.value === 'week') {
    const start = startOfWeek(cursor.value);
    return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
  }

  const start = startOfWeek(cursor.value.startOf('month'));
  return Array.from({ length: 42 }, (_, index) => start.add(index, 'day'));
});

const title = computed(() => {
  if (view.value === 'month') {
    return cursor.value.format('YYYY 年 M 月');
  }

  const start = startOfWeek(cursor.value);
  return `${start.format('M 月 D 日')} - ${start.add(6, 'day').format('M 月 D 日')}`;
});

function eventsOf(day: Dayjs) {
  return items.value
    .filter((item) => dayjs(item.startTime).isSame(day, 'day'))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }
      return dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf();
    });
}

async function fetchEvents() {
  loading.value = true;
  try {
    const from = cursor.value
      .startOf('month')
      .subtract(1, 'month')
      .format('YYYY-MM-DDTHH:mm:ss');
    const to = cursor.value
      .endOf('month')
      .add(2, 'month')
      .format('YYYY-MM-DDTHH:mm:ss');
    items.value = await getSchedulesApi(from, to);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.title = '';
  form.notes = '';
  form.allDay = false;
  form.isCompleted = false;
  form.startTime = dayjs().hour(9).minute(0).second(0);
  form.endTime = dayjs().hour(10).minute(0).second(0);
}

function openCreate(day: Dayjs) {
  editingId.value = null;
  resetForm();
  form.startTime = day.hour(9).minute(0).second(0);
  form.endTime = day.hour(10).minute(0).second(0);
  modalOpen.value = true;
}

function openEdit(item: ScheduleItem) {
  editingId.value = item.id;
  form.title = item.title;
  form.notes = item.notes ?? '';
  form.allDay = item.allDay;
  form.isCompleted = item.isCompleted;
  form.startTime = dayjs(item.startTime);
  form.endTime = item.endTime ? dayjs(item.endTime) : null;
  modalOpen.value = true;
}

async function save() {
  if (!form.title.trim()) {
    message.warning('请填写标题');
    return;
  }

  if (!form.startTime) {
    message.warning('请选择开始时间');
    return;
  }

  if (form.endTime && form.endTime.isBefore(form.startTime)) {
    message.warning('结束时间必须晚于开始时间');
    return;
  }

  const payload = {
    allDay: form.allDay,
    endTime: form.endTime ? form.endTime.format('YYYY-MM-DDTHH:mm:ss') : null,
    isCompleted: form.isCompleted,
    notes: form.notes || null,
    startTime: form.startTime.format('YYYY-MM-DDTHH:mm:ss'),
    title: form.title.trim(),
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await updateScheduleApi(editingId.value, payload);
      message.success('日程已更新');
    } else {
      await createScheduleApi(payload);
      message.success('日程已创建');
    }
    modalOpen.value = false;
    await fetchEvents();
  } finally {
    saving.value = false;
  }
}

async function toggleCompleted() {
  if (!editingId.value) {
    return;
  }
  await toggleScheduleApi(editingId.value);
  modalOpen.value = false;
  message.success('状态已更新');
  await fetchEvents();
}

async function remove() {
  if (!editingId.value) {
    return;
  }
  await deleteScheduleApi(editingId.value);
  modalOpen.value = false;
  message.success('日程已删除');
  await fetchEvents();
}

function move(step: number) {
  cursor.value = cursor.value.add(step, view.value === 'month' ? 'month' : 'week');
  fetchEvents();
}

function goToday() {
  cursor.value = dayjs();
  fetchEvents();
}

onMounted(fetchEvents);
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">日程</h2>
        <p class="mt-1 text-sm text-gray-500">
          点击日期新建，点击日程编辑；日程仅自己可见。
        </p>
      </div>
      <a-button type="primary" @click="openCreate(dayjs())">新建日程</a-button>
    </div>

    <a-card :bordered="true">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <a-space>
          <a-button @click="move(-1)">&lt;</a-button>
          <a-button @click="goToday">今天</a-button>
          <a-button @click="move(1)">&gt;</a-button>
          <span class="ml-2 text-base font-medium">{{ title }}</span>
        </a-space>

        <a-radio-group v-model:value="view" button-style="solid">
          <a-radio-button value="month">月</a-radio-button>
          <a-radio-button value="week">周</a-radio-button>
        </a-radio-group>
      </div>

      <a-spin :spinning="loading">
        <div v-if="view === 'month'">
          <div class="grid grid-cols-7 border-b border-gray-100 pb-2">
            <div
              v-for="label in WEEK_LABELS"
              :key="label"
              class="text-center text-xs text-gray-400"
            >
              周{{ label }}
            </div>
          </div>

          <div class="grid grid-cols-7">
            <div
              v-for="day in days"
              :key="day.valueOf()"
              class="min-h-[104px] cursor-pointer border-b border-r border-gray-100 p-1.5 transition-colors hover:bg-gray-50"
              :class="[
                day.month() !== cursor.month() && 'bg-gray-50/60 text-gray-300',
                day.isSame(dayjs(), 'day') && 'bg-blue-50/60',
              ]"
              @click="openCreate(day)"
            >
              <div class="mb-1 flex items-center justify-between">
                <span
                  class="text-xs"
                  :class="day.isSame(dayjs(), 'day') ? 'font-semibold text-blue-600' : 'text-gray-500'"
                >
                  {{ day.date() }}
                </span>
                <span
                  v-if="eventsOf(day).length > 0"
                  class="text-[10px] text-gray-400"
                >
                  {{ eventsOf(day).length }}
                </span>
              </div>

              <div class="space-y-1">
                <div
                  v-for="item in eventsOf(day).slice(0, 2)"
                  :key="item.id"
                  class="truncate rounded px-1.5 py-0.5 text-[11px]"
                  :class="
                    item.isCompleted
                      ? 'bg-gray-100 text-gray-400 line-through'
                      : 'bg-blue-100 text-blue-700'
                  "
                  @click.stop="openEdit(item)"
                >
                  {{ item.allDay ? '全天' : dayjs(item.startTime).format('HH:mm') }}
                  {{ item.title }}
                </div>
                <div
                  v-if="eventsOf(day).length > 2"
                  class="px-1 text-[10px] text-gray-400"
                >
                  还有 {{ eventsOf(day).length - 2 }} 条
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-7">
          <div
            v-for="day in days"
            :key="day.valueOf()"
            class="min-h-[180px] rounded-lg border border-gray-100 p-2"
            :class="day.isSame(dayjs(), 'day') && 'bg-blue-50/60'"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs text-gray-500">
                {{ day.format('M/D') }} 周{{ WEEK_LABELS[(day.day() + 6) % 7] }}
              </span>
              <a-button size="small" type="text" @click="openCreate(day)">
                +
              </a-button>
            </div>

            <div class="space-y-1">
              <div
                v-for="item in eventsOf(day)"
                :key="item.id"
                class="cursor-pointer rounded px-1.5 py-1 text-[11px]"
                :class="
                  item.isCompleted
                    ? 'bg-gray-100 text-gray-400 line-through'
                    : 'bg-blue-100 text-blue-700'
                "
                @click="openEdit(item)"
              >
                <div class="font-medium">
                  {{ item.allDay ? '全天' : dayjs(item.startTime).format('HH:mm') }}
                </div>
                <div class="truncate">{{ item.title }}</div>
              </div>
              <div v-if="eventsOf(day).length === 0" class="text-[11px] text-gray-300">
                暂无
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :confirm-loading="saving"
      :title="editingId ? '编辑日程' : '新建日程'"
      destroy-on-close
      ok-text="保存"
      cancel-text="取消"
      @ok="save"
    >
      <a-form layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" placeholder="要做什么" />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="开始时间" required>
              <a-date-picker
                v-model:value="form.startTime"
                class="w-full"
                show-time
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker
                v-model:value="form.endTime"
                class="w-full"
                show-time
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-checkbox v-model:checked="form.allDay">全天</a-checkbox>
          <a-checkbox v-model:checked="form.isCompleted" class="ml-6">
            已完成
          </a-checkbox>
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model:value="form.notes"
            :maxlength="2000"
            :rows="3"
            placeholder="补充说明"
          />
        </a-form-item>

        <a-space v-if="editingId">
          <a-button @click="toggleCompleted">
            {{ form.isCompleted ? '标记未完成' : '标记完成' }}
          </a-button>
          <a-popconfirm
            cancel-text="取消"
            ok-text="删除"
            title="确定删除这条日程吗？"
            @confirm="remove"
          >
            <a-button danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </a-form>
    </a-modal>
  </div>
</template>
