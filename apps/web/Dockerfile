FROM node:18-alpine AS base

WORKDIR /app

FROM base AS dependencies

WORKDIR /app/apps/web
COPY apps/web/package.json ./
RUN npm install

FROM dependencies AS build

COPY apps/web ./
RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
