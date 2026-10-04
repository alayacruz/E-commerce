from node:20-alpine as builder
workdir /app

copy package*.json ./
run npm install

copy . .
run npm run build

from nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
