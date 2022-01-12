FROM node:16-slim as builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
# With buildkit cache yarn stuff
# RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable --inline-builds
RUN yarn install --immutable --inline-builds
COPY . .
RUN yarn build

FROM node:16-slim
WORKDIR /app
COPY --from=builder /app/ /app/
RUN ls -lah
CMD [ "yarn", "start" ]
