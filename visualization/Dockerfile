FROM httpd:2.4

RUN apt-get update && \
    apt-get install -y apt-transport-https lsb-release curl && \
    curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    echo 'deb https://deb.nodesource.com/node_9.x jessie main' > /etc/apt/sources.list.d/nodesource.list && \
    echo 'deb-src https://deb.nodesource.com/node_9.x jessie main' >> /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get install -y nodejs

WORKDIR ~

COPY package*.json ./

RUN npm i npm@latest -g && npm install --quiet


COPY . .

RUN npm run build

RUN mv dist/* /usr/local/apache2/htdocs/

EXPOSE 80