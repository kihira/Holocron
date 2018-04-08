FROM node:9

WORKDIR /bot

COPY . /bot
RUN npm install
RUN npm run build

CMD ["node", "index.js"]