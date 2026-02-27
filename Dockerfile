# Multi-stage Dockerfile for Auto Repair Shop Application
# Stage 1: Builder
FROM docker.io/node:22-alpine3.20 AS builder

WORKDIR /app

# Enable corepack and prepare specific yarn version
RUN corepack enable && \
    corepack prepare yarn@1.22.22 --activate

# Copy package files first for caching
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build) with network timeout settings
RUN yarn install --frozen-lockfile --network-timeout 300000

# Copy source and config files
COPY tsconfig*.json ./
COPY eslint.config.mjs ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN yarn build

# Stage 2: Production
FROM docker.io/node:22-alpine3.20

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

RUN corepack enable && \
    corepack prepare yarn@1.22.22 --activate

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Install only production dependencies with network timeout settings
# Add tsx for seed scripts, tsconfig-paths and module-alias for path resolution at runtime
RUN yarn install --production --frozen-lockfile --network-timeout 300000 && \
    yarn add tsx tsconfig-paths module-alias

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema, migrations and seed script
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy tsconfig files needed for tsconfig-paths module resolution
COPY --from=builder /app/tsconfig*.json ./

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "-r", "tsconfig-paths/register", "-r", "module-alias/register", "dist/main.js"]
