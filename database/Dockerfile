ARG NODE_VERSION=lts-alpine
ARG ARANGODB_VERSION=3.7.10
FROM node:${NODE_VERSION} AS build-stage
# Install dependencies and shared libs
WORKDIR /opt/shared
COPY ./foxx/shared/package*.json ./
RUN npm install
COPY ./foxx/shared /opt/shared


# Lint & build backend
FROM build-stage AS backend
WORKDIR /opt/backend
COPY ./foxx/backend/package*.json ./
RUN npm install
COPY ./foxx/backend /opt/backend
RUN npm run lint
RUN npm run build


# Lint & build oai-pmh
FROM build-stage AS oai-pmh
WORKDIR /opt/oai-pmh
COPY ./foxx/oai-pmh/package*.json ./
RUN npm install
COPY ./foxx/oai-pmh /opt/oai-pmh
RUN npm run lint
RUN npm run build


# Setup database
FROM arangodb/arangodb:${ARANGODB_VERSION} AS database
EXPOSE 8529
COPY ./scripts/entrypoint/ /docker-entrypoint-initdb.d
COPY --from=oai-pmh /opt/oai-pmh/dist /opt/oai/
COPY --from=backend /opt/backend/dist /opt/api/
CMD ["--log.level", "debug"]