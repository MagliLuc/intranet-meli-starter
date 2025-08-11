FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy app
COPY . .

# Use .env.docker if present
RUN [ -f .env.docker ] && cp .env.docker .env || true

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/server.js"]
