#!/bin/bash

printf "\n\nsetting setup env vars\n"
export REDIS_DOCKER_NAME=redis-local
export SECURE_REDIS_DOCKER_PORT=7379

printf "setting local Docker instances..\n"

bash "$(pwd)/tests/setup/docker/run-local.sh"

printf "ready for testing.\n"