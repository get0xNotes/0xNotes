FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN sed -i 's/adapter-auto/adapter-node/' svelte.config.js
RUN yarn build

FROM node:lts-alpine AS production
WORKDIR /app
COPY --from=build /app/build .
COPY --from=build /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean
CMD [ "node", "index.js" ]