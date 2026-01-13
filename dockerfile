############################
# Build stage
############################
FROM node:16-bullseye AS build

# Install Python 2 and build tools
RUN apt-get update && apt-get install -y \
    python2-minimal \
    python2-dev \
    make \
    g++ \
    gcc \
    && ln -sf /usr/bin/python2 /usr/bin/python \
    && npm config set python /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


############################
# Runtime stage
############################
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
