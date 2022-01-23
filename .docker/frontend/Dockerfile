FROM node:16-slim as builder
RUN apt-get update -y && apt-get install openssl -y

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY . .

# generate backend schema-related stuff
WORKDIR /app/backend
RUN yarn install
RUN yarn db:client:gen
WORKDIR /app


# With buildkit cache yarn stuff
# RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --immutable --inline-builds
RUN yarn install --immutable --inline-builds
#COPY . .
RUN yarn build

FROM node:16-slim
WORKDIR /app
COPY --from=builder /app/.output /app/.output
#CMD [ "yarn", "start" ]
CMD ["node", ".output/server/index.mjs"]
