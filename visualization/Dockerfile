FROM node:16

WORKDIR /app
COPY package*.json ./
RUN npm install --quiet
COPY . .
RUN npm run build

FROM halverneus/static-file-server:v1.8.5

COPY --from=0 /app/dist/ /web/
ENV CORS=true
ENV PORT=80
ENV FOLDER=/web

EXPOSE 80
