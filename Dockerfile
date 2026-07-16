FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server/ ./server/
WORKDIR /app/server
RUN npm install --omit=dev
WORKDIR /app
EXPOSE 3001
CMD ["node", "server/index.js"]
