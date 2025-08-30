# Frontend Dockerfile with SSL support
# Build phase
FROM node:18-alpine as build

WORKDIR /app

# Copy the package file
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production phase
FROM nginx:alpine

# Install openssl and curl for SSL operations
RUN apk add --no-cache openssl curl

# Copy the build results to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy the nginx configuration
COPY nginx-https.conf /etc/nginx/conf.d/default.conf

# Create directories for certificates and challenges
RUN mkdir -p /var/www/certbot \
    && mkdir -p /etc/letsencrypt \
    && chmod -R 755 /var/www/certbot

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Expose both HTTP and HTTPS ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]