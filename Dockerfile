FROM node:alpine

RUN mkdir -p /bot
WORKDIR /bot

COPY . /bot

CMD ["node", "index.js"]