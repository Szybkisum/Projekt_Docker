FROM node:18-alpine

WORKDIR /app
COPY ./app/package*.json ./
RUN npm install --production

COPY ./app .

EXPOSE 3001

CMD [ "node", "server.js" ]