# Use Node.js 16 (Debian-based for best node-gyp compatibility)
FROM node:16-buster

# Install Python 2 and build tools required by node-gyp / node-sass
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

# Copy dependency files first (better Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build step (if needed)
# RUN npm run build

# Expose port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
