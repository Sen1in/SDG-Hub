# Frontend Dockerfile
#  Build phase
FROM node:18-alpine as build

WORKDIR /app

# Copy the package file
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

#  Build the app
RUN npm run build

# Production phase
FROM nginx:alpine

# Copy the build results to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]