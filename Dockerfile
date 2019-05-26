FROM node:10-alpine
WORKDIR /bot

COPY package.json yarn.lock tsconfig.json index.ts /bot/
COPY src /bot/src

RUN apk --update --no-cache --virtual build-dependencies add python make g++ && \
    yarn install && \
    apk del build-dependencies && \
    yarn run build

ENV MONGO_CONN "mongodb://localhost:27017"
ENV DB_DATA "data"
ENV DB_SETTINGS "settings"
ENV API_TOKEN "CHANGEME"
ENV ADMIN ""
ENV EMOJI_GUILD ""

CMD ["node", "index.js"]
