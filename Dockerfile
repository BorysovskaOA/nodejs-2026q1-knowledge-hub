## Base
FROM node:22-alpine AS base
RUN apk update && apk upgrade && apk add --no-cache tini curl
ENTRYPOINT ["/sbin/tini", "--"]
WORKDIR /app
COPY package*.json ./

## Build
FROM base AS build
COPY prisma ./prisma/ 
RUN npm ci
COPY . .
RUN npm run build

## Production
FROM base AS production
ENV NODE_ENV=production
RUN mkdir -p /app/node_modules && chown -R node:node /app
USER node
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.js ./prisma.config.js
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=build --chown=node:node /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000
CMD ["node", "dist/src/main.js"]
