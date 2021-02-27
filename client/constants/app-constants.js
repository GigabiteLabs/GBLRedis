/**
 * Constant values used for application
 * configuration, validation, and 
 * other general
 * 
 * @module constants/app-constants
 */
module.exports = {
    /** Cloud platform related constants */
    cloud: {
        /**
         * @property {Array<string>} - an array of strings representing
         * the names of all cloud platforms supported by the
         * framework. 
         * 
         * Note: Any value set for the env var
         * `REDIS_CLOUD_PLATFORM_TARGET` will be compared 
         * against this array before processing.
         */
        supportedPlatforms:  ['ibmcloud'],
        /**
         * @property {Array<string>} - an array of strings representing
         * all supported methods of connecting to a Redis instance. 
         * 
         */
        connectionMethods:  ['cloud-platform', 'direct-ssl-tls', 'basic-auth', 'no-auth']
    }
}