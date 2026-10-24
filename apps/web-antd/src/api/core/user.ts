import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

interface AbpProfile {
  email?: string;
  id?: string;
  name?: string;
  surname?: string;
  userName?: string;
}

/**
 * 获取当前登录用户信息（ABP Identity my-profile）
 */
export async function getUserInfoApi() {
  const profile = await requestClient.get<AbpProfile>(
    '/api/account/my-profile',
  );

  const displayName =
    [profile.name, profile.surname].filter(Boolean).join(' ') ||
    profile.userName ||
    'admin';

  return {
    avatar: '',
    desc: profile.email ?? '',
    homePath: '/dashboard',
    realName: displayName,
    roles: ['owner'],
    token: '',
    userId: profile.id ?? '',
    username: profile.userName ?? 'admin',
  } as UserInfo;
}
