ARG NODE_VERSION=lts-alpine

FROM node:${NODE_VERSION} AS builder

WORKDIR /code

COPY . .
RUN --mount=type=cache,target=/root/.npm npm install && npm run build

FROM node:${NODE_VERSION} AS runner

WORKDIR /web

RUN --mount=type=cache,target=/root/.npm npm install -global serve@latest

COPY --from=builder /code/dist .

EXPOSE 3000

CMD [ "serve" ]
