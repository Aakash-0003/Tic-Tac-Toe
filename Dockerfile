# ── Stage 1: build the Nakama JS module ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json esbuild.config.js ./
COPY server/ ./server/
RUN npm run build

# ── Stage 2: Nakama runtime with the compiled module ──────────────────────────
FROM registry.heroiclabs.com/heroiclabs/nakama:3.22.0

COPY --from=builder /app/build/index.js /nakama/data/modules/index.js

# Strip the postgres:// or postgresql:// scheme that Railway provides,
# run migrations, then start Nakama.
ENTRYPOINT DB=$(echo "$DATABASE_URL" | sed 's|^postgres[a-z]*://||') && \
    /nakama/nakama migrate up --database.address "$DB" && \
    exec /nakama/nakama \
      --database.address "$DB" \
      --socket.server_key "${NAKAMA_SERVER_KEY}" \
      --socket.address "0.0.0.0" \
      --socket.port "${PORT:-7350}" \
      --runtime.js_entrypoint "index.js"
