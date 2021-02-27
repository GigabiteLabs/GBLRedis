#!/bin/sh

## unset vars from other env tests
# unset cloud-platform vars
unset REDIS_CLOUD_PLATFORM_TARGET
unset VCAP_SERVICES

# unset basic-auth & no-auth vars
unset REDIS_INSTANCE_URL
unset REDIS_BASIC_AUTH_USER
unset REDIS_BASIC_AUTH_PASS

# set mandatory vars for all envs
export REDIS_PREFIX=gblredis:direct-ssl-test: # sample namespace prefix
export REDIS_CONNECTION_METHOD=direct-ssl-tls # exports this example's connection method

# set mandatory vars for this env
export REDIS_SSL_CERT=$CERT_PATH # export in your terminal before sourcing this example
export REDIS_COMPOSED_URL=$COMPOSED_URL # export in your terminal before sourcing this example

# set options
export REDIS_LOG_LEVEL=trace