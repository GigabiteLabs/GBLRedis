#!/bin/bash

printf "\n\nconfiguring an INSECURE local Redis DB via Docker on port: 6379 ...\n"
bash "$(pwd)/tests/setup/docker/docker-local-insecure.sh"

printf "configuring a SECURE local Redis DB via Docker on port: $SECURE_REDIS_DOCKER_PORT ..."
bash "$(pwd)/tests/setup/docker/docker-local-secure.sh"

printf "\nfinished."