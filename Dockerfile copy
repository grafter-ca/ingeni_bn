# Stage 1: Build the Vite App
FROM node:24-slim AS builder
WORKDIR /app

# Install dependencies (cached if package.json doesn't change)
COPY package*.json ./
RUN npm ci --network-timeout=100000

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the static build from the first stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]