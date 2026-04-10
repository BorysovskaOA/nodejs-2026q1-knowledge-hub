FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

## Build
FROM base AS build
RUN npm ci && npx prisma generate
COPY . .
RUN npm run build

## Pre-production
FROM base as pre-production
RUN npm ci --omit=dev \
  && npx prisma generate \
  && npm cache clean --force

## Production
FROM node:24-alpine AS production
WORKDIR /app
RUN apk add --no-cache tini
ENV NODE_ENV=production

COPY --from=pre-production /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma.config.js ./

USER node

EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm" "run" "start:prod"]
