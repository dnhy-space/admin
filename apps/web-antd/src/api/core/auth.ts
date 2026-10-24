import { useAccessStore } from '@vben/stores';

import { baseRequestClient, requestClient } from '#/api/request';

const CLIENT_ID = 'DnhySpace_Admin';
const SCOPE = 'DnhySpace offline_access';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export namespace AuthApi {
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  export interface LoginResult {
    accessToken: string;
    refreshToken?: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

async function requestToken(body: URLSearchParams) {
  return await baseRequestClient.post<TokenResponse>('/connect/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/**
 * 登录（OpenIddict 密码模式）
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'password',
    password: data.password ?? '',
    scope: SCOPE,
    username: data.username ?? '',
  });

  const result = await requestToken(body);
  const accessStore = useAccessStore();
  accessStore.setRefreshToken(result.refresh_token ?? null);

  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  } as AuthApi.LoginResult;
}

/**
 * 刷新 accessToken
 */
export async function refreshTokenApi() {
  const accessStore = useAccessStore();
  const refreshToken = accessStore.refreshToken;

  if (!refreshToken) {
    throw new Error('refresh_token 不存在');
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const result = await requestToken(body);
  accessStore.setRefreshToken(result.refresh_token ?? refreshToken);

  return {
    data: result.access_token,
    status: 200,
  } as AuthApi.RefreshTokenResult;
}

/**
 * 退出登录：密码模式下没有服务端会话，清除本地令牌即可。
 */
export async function logoutApi() {
  return Promise.resolve(true);
}

/**
 * 获取权限码（ABP grantedPolicies）
 */
export async function getAccessCodesApi() {
  const configuration = await requestClient.get<{
    auth?: { grantedPolicies?: Record<string, boolean> };
  }>('/api/abp/application-configuration');

  const policies = configuration?.auth?.grantedPolicies ?? {};
  return Object.keys(policies).filter((key) => policies[key]);
}
