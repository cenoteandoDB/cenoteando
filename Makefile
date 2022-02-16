# PROJECT_NAME defaults to name of the current directory.
# should not to be changed if you follow GitOps operating procedures.
PROJECT_NAME = cenoteando

# Get shell arguments
SERVICE_TARGET ?= $(service)
CMD_ARGUMENTS ?= $(cmd)

# all our targets are phony (no files to check).
.PHONY: shell help build rebuild service login test clean prune lint

# suppress makes own output
#.SILENT:

# shell is the first target. So instead of: make shell service="database" cmd="whoami", we can type: make service="database" cmd="whoami".
# more examples: make shell cmd="whoami && env", make shell cmd="echo hello container space".
# leave the double quotes to prevent commands overflowing in makefile (things like && would break)
# special chars: '',"",|,&&,||,*,^,[], should all work. Except "$" and "`", if someone knows how, please let me know!).
# escaping (\) does work on most chars, except double quotes (if someone knows how, please let me know)
# i.e. works on most cases. For everything else perhaps more useful to upload a script and execute that.
shell:
ifeq ($(SERVICE_TARGET),)
	$(error service is not set)
endif
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	docker-compose -p $(PROJECT_NAME) exec $(SERVICE_TARGET) sh
else
	# run the command
	docker-compose -p $(PROJECT_NAME) exec $(SERVICE_TARGET) sh -c "$(CMD_ARGUMENTS)"
endif

# Regular Makefile part for buildpypi itself
help:
	@echo ''
	@echo 'Usage: make [TARGET] [EXTRA_ARGUMENTS]'
	@echo ''
	@echo 'Targets:'
	@echo ''
	@echo '  start   			Run as service container'
	@echo '  stop   			Stop service container'
	@echo '  reload   			Build and restart service container'
	@echo '  build    			Build docker image'
	@echo '  rebuild  			Rebuild docker image with --no-cache'
	@echo ''
	@echo '  install			Install all npm dependencies locally'
	@echo '  lint     			Run linter on codebase'
	@echo '  test     			Run all tests'
	@echo '  clean    			Remove docker image and dev dependencies'
	@echo '  prune    			Shortcut for docker system prune --volumes -af. Cleanup inactive containers, volumes and cache.'
	@echo ''
	@echo '  dev_<service>			Setup service specific development environment (hot reload)'
	@echo '				<service> can be one either `frontend` or `backend`.'
	@echo '				Example: `make dev_frontend` starts the frontend in development mode (on localhost:8080)'
	@echo ''
	@echo '  upgrade			Upgrade all services with local code'
	@echo '  upgrade_<service>		Upgrade service specific code on running docker service with local'
	@echo '				<service> can be one either `frontend` or `backend`.'
	@echo '				Example: `make upgrade_backend` updates the backend code on the local ArangoDB instance'
	@echo ''
	@echo '  shell				Open terminal in specified container'
	@echo ''
	@echo ''
	@echo 'Extra arguments for shell:'
	@echo ''
	@echo '  service=:			Service to run commands / open shell in.'
	@echo '				Example: `make service="database"` is the same as `make shell service="database"`'
	@echo ''
	@echo '  cmd=:				Run command in container.'
	@echo '				Example: `make service="database" cmd="whoami"` is the same as `make shell service="database" cmd="whoami"`'
	@echo ''

start:
	# run as a (background) service
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p $(PROJECT_NAME) up -d

stop:
	# Stop service
	docker-compose -p $(PROJECT_NAME) down

reload: build stop start

build:
	# only build the container. Note, docker does this also if you apply other targets.
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build

rebuild:
	# force a rebuild by passing --no-cache
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build --no-cache

install:
	npm install --prefix frontend

# Start backend hot development mode (code changes reflect on save)
dev_backend:
	# TODO: Backend development mode (hot reload)
	$(error target not implemented)

# Start frontend hot development mode (code changes reflect on save)
dev_frontend: install
	npm run serve --prefix frontend

# Upgrade all services with local code
upgrade: upgrade_backend upgrade_frontend

# Upgrade backend with local code
upgrade_backend:
	# TODO: Upgrade backend with local code
	$(error target not implemented)

# Upgrade frontend with local code
upgrade_frontend:
	# TODO: Upgrade frontend with local code
	$(error target not implemented)

	# FIXME
	npm run build:dev --prefix frontend
	docker cp frontend/dist frontend:/var/www/dist

lint:
	npm run lint --prefix frontend
	npm run prettier --prefix frontend

	# TODO: Lint backend

test:
	# Run Cypress E2E tests
	npm run test:e2e --prefix frontend

clean:
	# Cleanup frontend dependencies and dist
	rm -rf frontend/node_modules/ frontend/dist

	# TODO: Cleanup backend dependencies
	rm -rf backend/target/

	# remove created images
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p $(PROJECT_NAME) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME)" already removed.'

prune:
	# Clean all that is not actively used
	DOCKER_BUILDKIT=1 docker system prune --volumes -af