# Production Dockerfile for Next.js app
FROM node:20-bullseye-slim AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests
COPY package.json pnpm-lock.yaml* ./

# Install deps
RUN pnpm install --frozen-lockfile --prod

# Copy source
COPY . .

# Build
RUN pnpm build

# Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
COPY --from=base /app .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
