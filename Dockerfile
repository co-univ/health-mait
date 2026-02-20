# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine

RUN npm install -g serve

COPY --from=builder /app/out /app

EXPOSE 3000

CMD ["serve", "-s", "/app", "-l", "3000"]
