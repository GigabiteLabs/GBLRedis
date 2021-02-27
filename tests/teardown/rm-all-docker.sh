#!/bin/bash

printf "stopping test Redis Docker containers ...\n"
docker container stop "$REDIS_DOCKER_NAME"
docker container stop "$REDIS_DOCKER_NAME-secure" 

printf "removing test Redis Docker containers ...\n"
docker container rm "$REDIS_DOCKER_NAME"
docker container rm "$REDIS_DOCKER_NAME-secure"

printf "all docker dontainers destroyed."