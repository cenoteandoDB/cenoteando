ARG ARANGODB_VERSION=3.7.11

# Setup database
FROM arangodb/arangodb:${ARANGODB_VERSION} AS database
EXPOSE 8529
COPY ./scripts/entrypoint /docker-entrypoint-initdb.d
COPY ./dumps /docker-entrypoint-initdb.d/dumps
CMD ["--log.level", "debug"]