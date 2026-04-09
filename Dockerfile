## Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm ci
COPY . .
RUN npm run build

## Production
FROM node:22-alpine AS production
RUN apk add --no-cache tini
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN mkdir -p /app/node_modules && chown -R node:node /app
USER node
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma.config.js ./prisma.config.js

EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/main.js"]
