FROM node:9

WORKDIR /bot

COPY . /bot
RUN yarn install
RUN yarn run build

CMD ["node", "index.js"]