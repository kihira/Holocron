FROM node:10

WORKDIR /bot

COPY . /bot
RUN yarn install
RUN yarn run build

ENV MONGO_CONN "mongodb://localhost:27017"
ENV DB_DATA "data"
ENV DB_SETTINGS "settings"
ENV API_TOKEN "CHANGEME"
ENV ADMIN ""
ENV EMOJI_GUILD ""

CMD ["node", "index.js"]