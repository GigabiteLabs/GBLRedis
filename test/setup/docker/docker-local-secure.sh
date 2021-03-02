#!/bin/bash

# pull it
docker pull redis:latest

# run it
docker run -dp "$SECURE_REDIS_DOCKER_PORT:6379" \
    --name "$REDIS_DOCKER_NAME-secure" \
    redis:latest \
    redis-server \
    --requirepass catsomething