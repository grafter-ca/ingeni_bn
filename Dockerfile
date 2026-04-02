# Stage 1: Build the Vite App
FROM node:20-alpine AS build-stage
WORKDIR /app

# Install dependencies (cached if package.json doesn't change)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the static build from the first stage to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]