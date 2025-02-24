# ===== Stage 1: Build =====
FROM node:22 AS builder
WORKDIR /usr/src/app

# Copy only package files first for dependency caching
COPY package*.json ./
RUN npm install --silent

# Copy the rest of the source code
COPY . .

# Run the build script (it creates dist/server.js)
RUN npm run build

# ===== Stage 2: Production =====
FROM node:22
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/server.js ./server.js
COPY --from=builder /usr/src/app/package*.json ./

COPY .env .env
COPY . .

# Install PM2 globally
RUN npm install --production
RUN npm install -g pm2

# Create persistent data directory
RUN mkdir -p /usr/src/app/data

# Expose the default port (the app will use the PORT from .env, default 8080)
EXPOSE 8080

# Use the custom entrypoint script
CMD ["pm2-runtime", "server.js", "--name", "git-pr-reviewer"]
