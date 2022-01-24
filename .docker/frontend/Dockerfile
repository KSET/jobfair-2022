FROM node:16-slim as builder
# Install packages required for building node modules
RUN apt-get update -y && apt-get install openssl -y

# Generate backend artefacts required for frontend build
WORKDIR /app/backend
COPY ./backend/package.json ./backend/yarn.lock ./backend/.yarnrc.yml ./
COPY ./backend/.yarn/ ./.yarn/
RUN yarn install
COPY ./backend/ ./
RUN yarn db:client:gen

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
# With buildkit cache yarn stuff
# RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable --inline-builds
RUN yarn install --immutable --inline-builds

COPY . .
RUN yarn build

# Copy just the built app to runner container
FROM node:16-slim as runner
WORKDIR /app
COPY --from=builder /app/.output /app/.output
CMD ["node", ".output/server/index.mjs"]
