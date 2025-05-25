FROM node:18-alpine AS builder
WORKDIR /app
COPY ./app/package*.json ./
RUN npm ci
COPY ./app .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]