############################
# Build stage
############################
FROM node:16-buster AS build

# Install Python 2 and build tools for node-gyp / node-sass
RUN apt-get update && apt-get install -y \
    python2 \
    python2-dev \
    make \
    g++ \
    gcc \
    && ln -sf /usr/bin/python2 /usr/bin/python \
    && npm config set python /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files first (Docker cache optimization)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build the app
RUN npm run build


############################
# Runtime stage (Nginx)
############################
FROM nginx:alpine

# Copy build output to Nginx
# (adjust if your build output folder is NOT "docs")
COPY --from=build /app/docs /usr/share/nginx/html

# Optional: custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
