# 사내 서버에 위키를 상시 띄울 때 쓰는 이미지: 빌드 후 nginx로 정적 파일을 서비스합니다.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
