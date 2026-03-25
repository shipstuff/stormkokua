FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN mkdir -p data && npx tsx scripts/sync-sheets.ts
RUN npm run build
RUN npx tsx scripts/generate-og-images.tsx

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
