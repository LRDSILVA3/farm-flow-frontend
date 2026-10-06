# Step 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps

COPY . .

# Accept build arguments for environment variables
ARG VITE_API_URL=http://192.168.1.20:3333
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
