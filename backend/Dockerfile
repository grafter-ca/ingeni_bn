# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from the backend directory
COPY backend/package*.json ./

# Install all dependencies
RUN npm install

# Copy the backend source and the prisma directory
COPY backend/ .

# Generate Prisma client (targets the custom output path)
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# --- STAGE 2: Production Run ---
FROM node:20-alpine

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy only production dependencies
COPY backend/package*.json ./
RUN npm install --only=production

# Copy built assets and generated prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

# Expose NestJS port
EXPOSE 8000

# Script to run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]