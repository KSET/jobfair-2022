FROM node:16-slim as builder
RUN apt-get update && apt-get install openssl -y
WORKDIR /app
ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
RUN yarn install --immutable --inline-builds
COPY . .
RUN yarn prisma generate
RUN yarn tsc --project tsconfig.json --outDir .output --sourceMap false --pretty
COPY .env .output/
CMD [ "node", ".output/index.js" ]
