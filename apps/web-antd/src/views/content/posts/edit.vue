<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  createPostApi,
  getPostApi,
  updatePostApi,
} from '#/api/content';
import type { CreateUpdatePostInput, PostType, PostVisibility } from '#/api/content';
import { requestClient } from '#/api/request';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { MdEditor } from 'md-editor-v3';

import 'md-editor-v3/lib/style.css';

defineOptions({ name: 'ContentPostEdit' });

const route = useRoute();
const router = useRouter();

const postId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] : id;
});
const isEdit = computed(() => Boolean(postId.value));
const saving = ref(false);
const loading = ref(false);

const form = reactive<{
  content: string;
  occurredAt: Dayjs | null;
  title: string;
  type: PostType;
  visibility: PostVisibility;
}>({
  content: '',
  occurredAt: dayjs(),
  title: '',
  type: 2,
  visibility: 1,
});

onMounted(async () => {
  if (!postId.value) {
    return;
  }

  loading.value = true;
  try {
    const post = await getPostApi(postId.value);
    form.content = post.content;
    form.title = post.title;
    form.type = post.type;
    form.visibility = post.visibility;
    form.occurredAt = post.occurredAt ? dayjs(post.occurredAt) : dayjs();
  } finally {
    loading.value = false;
  }
});

async function handleUploadImg(
  files: File[],
  callback: (urls: string[]) => void,
) {
  const urls = await Promise.all(
    files.map(async (file) => {
      const data = new FormData();
      data.append('file', file);
      const result = await requestClient.post<{ url: string }>(
        '/api/app/file',
        data,
      );
      return result.url;
    }),
  );

  callback(urls);
}

async function save() {
  if (!form.content.trim()) {
    message.warning('正文不能为空');
    return;
  }

  if (form.type === 2 && !form.title.trim()) {
    message.warning('日记需要填写标题');
    return;
  }

  const payload: CreateUpdatePostInput = {
    content: form.content,
    occurredAt: form.occurredAt ? form.occurredAt.toISOString() : undefined,
    title: form.title.trim() || undefined,
    type: form.type,
    visibility: form.visibility,
  };

  saving.value = true;
  try {
    if (isEdit.value && postId.value) {
      await updatePostApi(postId.value, payload);
      message.success('已保存');
    } else {
      await createPostApi(payload);
      message.success('已创建');
    }
    await router.push('/content/posts');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="p-5">
    <a-spin :spinning="loading">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <a-button @click="router.push('/content/posts')">返回</a-button>
          <div>
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ isEdit ? '编辑内容' : '新建内容' }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              支持 Markdown，图片会直接上传到 ABP。
            </p>
          </div>
        </div>

        <a-space>
          <a-button :loading="saving" type="primary" @click="save">
            保存
          </a-button>
        </a-space>
      </div>

      <a-card :bordered="true">
        <a-form layout="vertical">
          <a-row :gutter="[16, 0]">
            <a-col :md="4" :xs="24">
              <a-form-item label="类型">
                <a-radio-group v-model:value="form.type" button-style="solid">
                  <a-radio-button :value="2">日记</a-radio-button>
                  <a-radio-button :value="1">随想</a-radio-button>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :md="8" :xs="24">
              <a-form-item :label="form.type === 2 ? '标题（必填）' : '标题（可选）'">
                <a-input
                  v-model:value="form.title"
                  :maxlength="200"
                  placeholder="给这条内容起个名字"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :xs="24">
              <a-form-item label="时间">
                <a-date-picker
                  v-model:value="form.occurredAt"
                  class="w-full"
                  show-time
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :xs="24">
              <a-form-item label="可见性">
                <a-radio-group v-model:value="form.visibility">
                  <a-radio :value="1">私密</a-radio>
                  <a-radio :value="2">公开</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="正文（Markdown）">
            <MdEditor
              v-model="form.content"
              :on-upload-img="handleUploadImg"
              :style="{ height: '58vh' }"
              preview-theme="github"
              theme="light"
            />
          </a-form-item>
        </a-form>
      </a-card>
    </a-spin>
  </div>
</template>
