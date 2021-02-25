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
    },
    success: {
        CONNECTION_READY: 'gigbatielabs-redis ::: connection to Redis was successfully established'
    }
}

module.exports = messages