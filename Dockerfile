# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV HOST=0.0.0.0
ENV PORT=4000
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
EXPOSE 4000
CMD ["npm","run","start"]
