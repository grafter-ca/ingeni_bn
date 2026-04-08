# --- Stage 1: Build Backend ---
FROM node:24-slim AS backend-builder

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --network-timeout=100000

# Copy backend source
COPY backend/ .
# Generate Prisma client
RUN npx prisma generate --schema ./prisma/schema.prisma
# Build NestJS backend
RUN npm run build

# --- Stage 2: Build Frontend ---
FROM node:24-slim AS frontend-builder
WORKDIR /app

# Install frontend dependencies (root package.json)
COPY package*.json ./
RUN npm ci --network-timeout=100000

# Copy frontend source (root)
COPY . .
RUN npm run build

# --- Stage 3: Combine in Nginx + Node Backend ---
FROM nginx:stable-alpine AS final

# Copy frontend build into Nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend build into same container
# We need Node for NestJS
FROM node:24-slim AS node-final
WORKDIR /app

COPY --from=backend-builder /app/dist ./backend/dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/generated ./generated
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/package*.json ./

# Expose backend port
EXPOSE 8000
ENV NODE_ENV=production
ENV PORT=8000

# Start backend
CMD ["sh", "-c", "cd backend && npx prisma db push && node dist/main.js"]