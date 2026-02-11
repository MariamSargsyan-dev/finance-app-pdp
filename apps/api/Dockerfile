FROM node:18-alpine AS base

WORKDIR /app

FROM base AS dependencies

WORKDIR /app/apps/api
COPY apps/api/package.json ./
RUN npm install

FROM dependencies AS build

COPY apps/api ./
RUN npm run build

FROM base AS production

WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/node_modules ./node_modules

EXPOSE 8787

CMD ["node", "dist/main.js"]
