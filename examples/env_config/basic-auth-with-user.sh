#!/bin/sh

# unset vars from other envs
unset REDIS_SSL_CERT
unset REDIS_COMPOSED_URL
unset REDIS_CLOUD_PLATFORM_TARGET
unset VCAP_SERVICES

# mandatory for all envs
export REDIS_PREFIX=gblredis:basic-auth-test: # sample namespace prefix
export REDIS_CONNECTION_METHOD=basic-auth # exports this example's connection method

# mandatory for this env
export REDIS_INSTANCE_URL=$INSTANCE_URL # export in your terminal before sourcing this example
export REDIS_BASIC_AUTH_USER=$REDIS_USER # export in your terminal before sourcing this example
export REDIS_BASIC_AUTH_PASS=$REDIS_PASS # export in your terminal before sourcing this example

# options
export REDIS_LOG_LEVEL=trace