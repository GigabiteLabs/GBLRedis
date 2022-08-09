#!/bin/bash

printf "\n\nbeginning teardown process... \n"

# stop & destroy all test docker containers
bash "$(pwd)/test/teardown/rm-all-docker.sh"

# unset all env vars
unset REDIS_DOCKER_NAME
unset SECURE_REDIS_DOCKER_PORT

printf "\n\nteardown finished\n."