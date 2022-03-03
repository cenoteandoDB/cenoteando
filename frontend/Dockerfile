ARG NODE_VERSION=16-alpine

## Build stage
FROM node:${NODE_VERSION} as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ] ; then npm run build:dev ; else npm run build ; fi


## Production stage
FROM nginx:stable-alpine as production-stage
RUN mkdir -p /var/www/frontend
COPY /nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /var/www/frontend
