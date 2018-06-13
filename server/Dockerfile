FROM node:9.7

RUN npm install -g node-dev

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --quiet


COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]