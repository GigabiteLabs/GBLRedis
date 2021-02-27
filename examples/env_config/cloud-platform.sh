#!/bin/sh

## unset vars from other envs
# unset direct-ssl
unset REDIS_SSL_CERT
unset REDIS_COMPOSED_URL
unset REDIS_INSTANCE_URL

# unset basic-auth & no-auth
unset REDIS_INSTANCE_URL
unset REDIS_BASIC_AUTH_USER
unset REDIS_BASIC_AUTH_PASS

# mandatory for this env
export REDIS_PREFIX=gblredis:cloud-platform-test:
export REDIS_CONNECTION_METHOD=cloud-platform
export REDIS_CLOUD_PLATFORM_TARGET=$PLATFORM_TARGET
export VCAP_SERVICES=$(cat $VCAP_PATH)

# options
export REDIS_LOG_LEVEL=trace