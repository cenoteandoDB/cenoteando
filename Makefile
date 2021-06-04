# --------------------------------------------------------------------
# Copyright (c) 2019 LINKIT, The Netherlands. All Rights Reserved.
# Author(s): Anthony Potappel
# Modified by: Cenoteando
#
# This software may be modified and distributed under the terms of the
# MIT license. See the LICENSE file for details.
# --------------------------------------------------------------------

# This file and more information on how to use and extend it can be found in
# https://itnext.io/docker-makefile-x-ops-sharing-infra-as-code-parts-ea6fa0d22946

# PROJECT_NAME defaults to name of the current directory.
# should not to be changed if you follow GitOps operating procedures.
PROJECT_NAME = cenoteando

# NOTE: If you change this, you also need to update docker-compose.yml.
# only useful in a setting with multiple services/ makefiles.
SERVICE_TARGET := database

# if vars not set specifically: try default to environment, else fixed value.
# strip to ensure spaces are removed in future editorial mistakes.
# tested to work consistently on popular Linux flavors and Mac.
ifeq ($(user),)
# USER retrieved from env, UID from shell.
HOST_USER ?= $(strip $(if $(USER),$(USER),nodummy))
HOST_UID ?= $(strip $(if $(shell id -u),$(shell id -u),4000))
else
# allow override by adding user= and/ or uid=  (lowercase!).
# uid= defaults to 0 if user= set (i.e. root).
HOST_USER = $(user)
HOST_UID = $(strip $(if $(uid),$(uid),0))
endif

THIS_FILE := $(lastword $(MAKEFILE_LIST))
CMD_ARGUMENTS ?= $(cmd)

# export such that its passed to shell functions for Docker to pick up.
export PROJECT_NAME
export HOST_USER
export HOST_UID

# all our targets are phony (no files to check).
.PHONY: shell help build rebuild service login test clean prune lint

# suppress makes own output
#.SILENT:

# shell is the first target. So instead of: make shell cmd="whoami", we can type: make cmd="whoami".
# more examples: make shell cmd="whoami && env", make shell cmd="echo hello container space".
# leave the double quotes to prevent commands overflowing in makefile (things like && would break)
# special chars: '',"",|,&&,||,*,^,[], should all work. Except "$" and "`", if someone knows how, please let me know!).
# escaping (\) does work on most chars, except double quotes (if someone knows how, please let me know)
# i.e. works on most cases. For everything else perhaps more useful to upload a script and execute that.
shell:
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
	@echo 'Targets:'
	@echo '  start   		Run as service container'
	@echo '  stop   		Stop service container'
	@echo '  install		Install all npm dependencies locally'
	@echo '  build    		Build docker image'
	@echo '  rebuild  		Rebuild docker image with --no-cache'
	@echo '  clean    		Remove docker image and dev dependencies'
	@echo '  dev			Setup service development environment'
	@echo '  dev_<proj>		Setup project specific development environment'
	@echo '			<proj> can be one of `frontend`, `backend`, `oai-pmh`.'
	@echo '			Example: `make dev_frontend` starts the frontend in development mode (on localhost:8080)'
	@echo '  upgrade_<proj>	Upgrade project specific code on running docker service with local'
	@echo '			<proj> can be one of `frontend`, `backend`, `oai-pmh`.'
	@echo '			Example: `make upgrade_backend` updates the backend code on the local ArangoDB instance'
	@echo '  lint     		Run linter on codebase'
	@echo '  test     		Test docker container'
	@echo '  shell			Open terminal in $(SERVICE_TARGET)'
	@echo '  prune    		Shortcut for docker system prune -af. Cleanup inactive containers and cache.'
	@echo ''
	@echo 'Extra arguments:'
	@echo 'cmd=:			Run command in container.'
	@echo '			Example: `make cmd="whoami"` is the same as `make shell cmd="whoami"`'

rebuild:
	# force a rebuild by passing --no-cache
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build --no-cache

start:
	# run as a (background) service
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p $(PROJECT_NAME) up -d

stop:
	docker-compose -p $(PROJECT_NAME) down

build:
	# only build the container. Note, docker does this also if you apply other targets.
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build

clean:
	# cleanup frontend libs
	rm -rf frontend/node_modules/
	# cleanup shared libs
	rm -rf database/foxx/shared/dist/ database/foxx/shared/node_modules/

	# cleanup backend
	rm -rf database/foxx/backend/dist/ database/foxx/backend/node_modules/

	# cleanup oai-pmh
	rm -rf database/foxx/oai-pmh/dist/ database/foxx/oai-pmh/node_modules/

	# remove created images
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p $(PROJECT_NAME) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME)" already removed.'

prune:
	# clean all that is not actively used
	DOCKER_BUILDKIT=1 docker system prune -af

test:
	# TODO: Add our tests here
	# here it is useful to add your own customised tests
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -p $(PROJECT_NAME) run --rm $(SERVICE_TARGET) sh -c '\
		echo "I am `whoami`. My uid is `id -u`." && echo "Docker runs!"' \
	&& echo success

lint:
	npm run lint --prefix frontend
	npm run prettier --prefix frontend

	npm run lint --prefix database/foxx/backend
	npm run prettier --prefix database/foxx/backend

	npm run lint --prefix database/foxx/oai-pmh
	npm run prettier --prefix database/foxx/oai-pmh

install:
	npm install --prefix frontend
	npm install --prefix database/foxx/shared
	npm install --prefix database/foxx/backend
	npm install --prefix database/foxx/oai-pmh

dev: install
	(trap 'kill 0' INT; make dev_frontend & make dev_backend & make dev_oai-pmh) && wait
	@echo ''
	@echo ''
	@echo 'Development environment ready! Happy coding!'
	@echo ''
	@echo ''

# Setup Backend
dev_backend: install
	# Start hot development mode (code changes reflect on save)
	npm run dev --prefix database/foxx/backend

# Setup oai-pmh
dev_oai-pmh: install
	# Start hot development mode (code changes reflect on save)
	npm run dev --prefix database/foxx/oai-pmh

# Setup frontend
dev_frontend: install
	# Start hot development mode (code changes reflect on save)
	npm run serve --prefix frontend

# Upgrade Backend code with local
upgrade_backend:
	npm run build --prefix database/foxx/backend && npm run upgrade --prefix database/foxx/backend

# Upgrade oai-pmh code with local
upgrade_oai-pmh:
	npm run build --prefix database/foxx/oai-pmh && npm run upgrade --prefix database/foxx/oai-pmh

# Upgrade frontend docker code with local
upgrade_frontend:
	# FIXME
	npm run build:dev --prefix frontend && docker cp frontend/dist frontend:/app
