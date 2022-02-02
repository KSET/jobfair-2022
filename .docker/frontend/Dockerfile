FROM node:16-slim as builder
WORKDIR /app
ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache
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
