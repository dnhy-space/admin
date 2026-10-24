# syntax=docker/dockerfile:1

# ---------- 构建 ----------
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.16.0 --activate

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build:antd

# ---------- 运行（nginx 静态托管 + 同源反代 ABP） ----------
FROM nginx:alpine AS runner

COPY --from=build /app/apps/web-antd/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
