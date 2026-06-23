FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_DOMAIN_NAME
ARG VITE_AUTH_DOMAIN
ARG VITE_API_DOMAIN
ARG VITE_DRAWIO_URL

ENV VITE_DOMAIN_NAME=$VITE_DOMAIN_NAME
ENV VITE_AUTH_DOMAIN=$VITE_AUTH_DOMAIN
ENV VITE_API_DOMAIN=$VITE_API_DOMAIN
ENV VITE_DRAWIO_URL=$VITE_DRAWIO_URL

RUN npm run build

FROM nginx:stable-alpine AS production-stage

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]