# --- STAGE 1: Build ---
FROM node:24-slim AS builder

# Required for Prisma on slim images
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy package files from the backend folder
COPY backend/package*.json ./

# 2. Install dependencies
RUN npm ci --network-timeout=100000

# 3. Copy the backend source AND the prisma folder specifically
COPY backend/ . 

# 4. Generate Prisma client (Explicitly pointing to the schema location)
RUN npx prisma generate --schema ./prisma/schema.prisma

# 5. Build the NestJS application
RUN npm run build

# --- STAGE 2: Production Run ---
FROM node:24-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 8000

# Push the schema to Neon and start
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
