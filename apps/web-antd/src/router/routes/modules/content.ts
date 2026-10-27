import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:notebook-pen',
      order: -1,
      title: '内容',
    },
    name: 'Content',
    path: '/content',
    children: [
      {
        component: () => import('#/views/content/posts/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '日记与随想',
        },
        name: 'ContentPosts',
        path: 'posts',
      },
      {
        component: () => import('#/views/content/posts/edit.vue'),
        meta: {
          hideInMenu: true,
          title: '新建内容',
        },
        name: 'ContentPostCreate',
        path: 'posts/create',
      },
      {
        component: () => import('#/views/content/posts/edit.vue'),
        meta: {
          hideInMenu: true,
          title: '编辑内容',
        },
        name: 'ContentPostEdit',
        path: 'posts/:id/edit',
      },
      {
        component: () => import('#/views/content/schedule/index.vue'),
        meta: {
          icon: 'lucide:calendar-days',
          title: '日程',
        },
        name: 'ContentSchedule',
        path: 'schedule',
      },
      {
        component: () => import('#/views/content/deadline/index.vue'),
        meta: {
          icon: 'lucide:timer',
          title: 'Deadline',
        },
        name: 'ContentDeadline',
        path: 'deadline',
      },
      {
        component: () => import('#/views/content/comments/index.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '评论',
        },
        name: 'ContentComments',
        path: 'comments',
      },
    ],
  },
];

export default routes;
