# -------------------------
# Stage 1: Build backend
# -------------------------
FROM node:24-slim AS backend-builder

# Install dependencies required for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --network-timeout=100000

# Copy backend source code
COPY backend/ . 

# Generate Prisma client
RUN npx prisma generate --schema ./prisma/schema.prisma

# Build backend
RUN npm run build

# -------------------------
# Stage 2: Build frontend
# -------------------------
FROM node:24-slim AS frontend-builder

WORKDIR /app/frontend

# Copy root package files for frontend
COPY package*.json ./

# Install frontend dependencies
RUN npm ci --network-timeout=100000

# Copy all frontend source files from root
COPY . .

# Build frontend
RUN npm run build

# -------------------------
# Stage 3: Production image
# -------------------------
FROM node:24-slim AS final

# Install dependencies for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend build artifacts
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/generated ./backend/generated

# Copy frontend build to Nginx directory
FROM nginx:stable-alpine AS nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 8000

# -------------------------
# Start backend & Nginx together
# -------------------------
CMD sh -c "node /app/backend/dist/main.js & nginx -g 'daemon off;'"