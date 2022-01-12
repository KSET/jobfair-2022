FROM node:16-slim as builder
RUN apt-get update && apt-get install openssl -y
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
RUN yarn install --immutable --inline-builds
COPY . .
RUN yarn prisma generate
CMD [ "yarn", "start" ]
