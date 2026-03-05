# -------- Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo configs
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy server source and prisma schema
COPY server/ ./server/

# Build Backend
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

# -------- Production Stage --------
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./prisma

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
