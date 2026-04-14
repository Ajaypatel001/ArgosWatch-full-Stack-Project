# ---------- Build Stage ----------
FROM node:18 AS build

WORKDIR /app

COPY package.json ./
RUN npm install --omit=optional --legacy-peer-deps

COPY . .

RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy build output (Vite → dist)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
