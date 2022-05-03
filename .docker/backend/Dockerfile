FROM node:16-slim as builder
RUN apt-get update && apt-get install openssl -y
WORKDIR /app
ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
RUN yarn install --immutable --inline-builds
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN node -e 'console.log("|> Memory limit", v8.getHeapStatistics().heap_size_limit/(1024*1024))'
RUN yarn prisma generate
RUN yarn tsc --project tsconfig.json --outDir .output --sourceMap false --pretty
WORKDIR app
# Copy the non-ts/non-compiled files back into the build directory position
RUN find . -not -name '*.ts' -type f -exec cp --recursive --verbose --parents {} ../.output/ \;
WORKDIR ..
COPY .env .output/
CMD [ "yarn", "start" ]
