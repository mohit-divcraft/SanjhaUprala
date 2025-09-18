# backend/Dockerfile (replace current)
FROM node:18-slim

WORKDIR /usr/src/app

# install system deps needed by Prisma + optional build tools
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      ca-certificates openssl libc6-dev && \
    rm -rf /var/lib/apt/lists/*

# copy package files first (for cached installs)
COPY package*.json ./

# install prod deps (and dev deps if prisma generation requires it)
RUN npm install --omit=dev

# copy rest of the app
COPY . .

# generate prisma client for linux (inside container, so binary matches)
RUN npx prisma generate || true

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]
