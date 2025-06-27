# ================================
# Build image
# ================================
FROM node:23-alpine AS build

# Set the working directory
WORKDIR /build

# Enable corepack
RUN corepack enable

# Copy package.json and your lockfile
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm i --frozen-lockfile

# Copy the rest of the application files to the working directory
COPY . .

# Set Node.js memory limit before running the build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm run build

# ================================
# Run image
# ================================
FROM node:23-alpine AS run

# Update and install latest dependencies
RUN apk add --no-cache dumb-init

# Add a non-root user
RUN adduser -D nuxtuser

# Set non-root user
USER nuxtuser

# set work dir as app
WORKDIR /app

# Copy the built files from the build image
COPY --chown=nuxtuser:nuxtuser --from=build /build/.output ./

# Expose 8080 on the container
EXPOSE 8080

# Set app host and port. In nuxt 3 this is based on nitro and you can read
#more on this https://nitro.unjs.io/deploy/node#environment-variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# Start the app with dumb init to spawn the Node.js runtime process
# with signal support
CMD ["dumb-init", "node", "/app/server/index.mjs"]