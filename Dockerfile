FROM node:20-alpine AS base

# --- 安裝所有依賴（含 devDeps，build 需要） ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 只安裝 production 依賴 ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --omit=dev

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

# dotenv（prisma.config.ts 需要，但在 devDeps 中）
COPY --from=deps /app/node_modules/dotenv ./node_modules/dotenv

# Build 產出與必要檔案
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "run", "start"]
