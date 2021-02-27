const messages = {
    errors: {
        CLIENT_NOT_CONFIGURED: (err) => {
            return `gigbatielabs-redis ::: ERROR ::: Redis client could not be configured, an error occured: ${err}`
        },
        INVALID_REDIS_URL: (err) => {
            return `gigbatielabs-redis ::: ERROR ::: Invalid Redis url, Redis client could not be configured: ${err}`
        },
        INVALID_CLOUD_PLATFORM: (err) => {
            return `gigbatielabs-redis ::: ERROR ::: An invalid value for the cloud platform env var was set: ${err}`
        },
        UNSUPPORTED_CLOUD_PLATFORM: (err) => {
            return `gigbatielabs-redis ::: ERROR ::: The cloud platform configured is not supported. configured: ${err}`
        },
        COULD_NOT_SETUP: `gigbatielabs-redis ::: ERROR ::: The client could not be setup. Check that the env & config is setup`,
        NO_VCAP_ENV: `gigbatielabs-redis ::: ERROR ::: Client setup failed because no VCAP_SERVICES env var was set`,
        CONNECTION_ERROR: (err) => {
            return `gigbatielabs-redis ::: ERROR ::: an error occurred while attempting to connect to Redis: ${err}`
        },
        RECONNECTING: (err) => {
            return `gigbatielabs-redis ::: WARNING ::: the connection to Redis was lost, reconnecting. raw msg: ${err}`
        },
        CONNECTION_WARNING: (err) => {
            return `gigbatielabs-redis ::: WARNING ::: a warning occured while connecting to Redis: ${err}`
        },
        PREFIX_UNDEFINED: `gigbatielabs-redis ::: ERROR ::: no definition exists for \'REDIS_PREFIX\', which is mandatory.`,
        CONNECTION_METHOD_INVALID: `gigbatielabs-redis ::: ERROR ::: the value defined for REDIS_CONNECTION_METHOD is not a supported connection method, see documentation.`,
        CONNECTION_METHOD_UNDEFINED: `gigbatielabs-redis ::: ERROR ::: REDIS_CONNECTION_METHOD: no env var value defined`,
        SSL_DIRECT_NO_CERT_PATH: `gigbatielabs-redis ::: ERROR ::: no value was configure for env var: \'REDIS_SSL_CERT\'`,
        SSL_DIRECT_NO_COMPOSED_URL: `gigbatielabs-redis ::: ERROR ::: no value was configure for env var: \'REDIS_COMPOSED_URL\'`,
        SSL_DIRECT_INVALID_URL_REDISS: `gigbatielabs-redis ::: ERROR ::: The config for connection URL must start with \'rediss://\'`,
        SSL_DIRECT_TLS_CONFIG_FAILED: `gigbatielabs-redis ::: ERROR ::: A direct connection using TLS is not properly configured.`,
        REDIS_CLIENT_OPTIONS_NOT_PARSABLE: `gigbatielabs-redis ::: ERROR ::: the value configured for \'REDIS_CLIENT_OPTIONS\' was not parsable as a valid JSON object.`,
        BASIC_AUTH_NO_PASS: `gigbatielabs-redis ::: ERROR ::: no env var was configured for \'REDIS_BASIC_AUTH_PASS\' while attempting a basic-auth connnection.`,
        BASIC_AUTH_NO_URL: `gigbatielabs-redis ::: ERROR ::: no env var was configured for \'REDIS_BASIC_AUTH_URL\' while attempting a basic-auth connnection.`,
        NO_AUTH_NO_URL: `gigbatielabs-redis ::: ERROR ::: no env var was configured for \'REDIS_INSTANCE_URL\' while attempting a no-auth connnection.`,
    },
    success: {
        CONNECTION_READY: 'gigbatielabs-redis ::: connection to Redis was successfully established'
    },
    info: {
        BASIC_AUTH_NO_USER: `gigbatielabs-redis ::: INFO ::: no var was found for \'REDIS_BASIC_AUTH_USER\', which may or may not be an issue, client will attempt connection without a user specified.`,
    },
    internal: {
        NOT_CONFIGURED: 'gigbatielabs-redis ::: ERROR ::: this operation is not yet configured.'
    }
}

module.exports = messages