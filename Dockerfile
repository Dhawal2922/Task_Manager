# Build backend image
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/src ./src
COPY --from=backend-deps /app/backend/node_modules ./node_modules

EXPOSE 5000
CMD ["node", "src/server.js"]
