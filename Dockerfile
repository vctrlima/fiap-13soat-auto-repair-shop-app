# Multi-stage Dockerfile for Auto Repair Shop Application
# Stage 1: Builder
FROM docker.io/node:22-alpine3.20 AS builder

WORKDIR /workspace

# Enable corepack and prepare specific yarn version
RUN corepack enable && \
    corepack prepare yarn@1.22.22 --activate

# Copy root package files
COPY package.json yarn.lock ./
COPY tsconfig*.json ./
COPY nx.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./

# Copy app specific files
COPY apps/auto-repair-shop ./apps/auto-repair-shop

# Install all dependencies (including dev dependencies for build) with network timeout settings
RUN yarn install --frozen-lockfile --network-timeout 300000

# Generate Prisma Client
RUN cd apps/auto-repair-shop && npx prisma generate

# Build the application (disable Nx Cloud)
ENV NX_CLOUD_NO_TIMEOUTS=true
ENV NX_NO_CLOUD=true
RUN yarn nx build auto-repair-shop --configuration=production

# Stage 2: Production
FROM docker.io/node:22-alpine3.20

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Copy built application from builder
COPY --from=builder /workspace/apps/auto-repair-shop/dist ./dist

# Copy Prisma schema, migrations and seed script
COPY --from=builder /workspace/apps/auto-repair-shop/prisma ./prisma

# Copy generated Prisma Client from builder
COPY --from=builder /workspace/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /workspace/node_modules/@prisma ./node_modules/@prisma

# Copy tsconfig files needed for tsconfig-paths module resolution
COPY --from=builder /workspace/apps/auto-repair-shop/tsconfig*.json ./
COPY --from=builder /workspace/tsconfig.base.json /workspace/

# Copy package.json files for installation
COPY --from=builder /workspace/apps/auto-repair-shop/package.json ./
COPY --from=builder /workspace/package.json ./package.json.root
COPY --from=builder /workspace/yarn.lock ./

# Install only production dependencies with network timeout settings
# Add tsx for seed scripts, tsconfig-paths and module-alias for path resolution at runtime
RUN yarn install --production --frozen-lockfile --network-timeout 300000 && \
    yarn add tsx tsconfig-paths module-alias --ignore-workspace-root-check

# Create a root package.json with proper module alias configuration for production
RUN node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('./package.json.root', 'utf8')); pkg._moduleAliases = {'@': '/app/dist/apps/auto-repair-shop/src'}; fs.writeFileSync('/app/package.json', JSON.stringify(pkg, null, 2));"

# Copy entrypoint script
COPY apps/auto-repair-shop/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
