#!/bin/bash

# pull it
docker pull redis:latest

# run it
docker run -dp 6379:6379 \
    --name $REDIS_DOCKER_NAME \
    redis:latest \
    redis-server \