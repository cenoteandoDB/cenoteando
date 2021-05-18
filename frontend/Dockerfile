ARG NODE_VERSION=15-alpine3.10

## Build stage
FROM node:${NODE_VERSION} as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NODE_ENV
ENV VUE_APP_ROOT_API = 'http://localhost'
RUN if [ "$NODE_ENV" = "development" ] ; then npm run build:dev ; else npm run build ; fi


## Production stage
FROM nginx:stable-alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
