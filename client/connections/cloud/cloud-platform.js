const SSLConnection = require('../ssl/ssl-connection')
/**
 * A common class extended by all platform-specific
 * instances.
 * 
 * This class contains functions nad vlaues available
 * to every platform class that extends it.
 * 
 * @type {Object}
 * @property {Object} tls - the TLS library required for SSL connections to Redis
 * @property {Object} log - a logging instance for console logs
 * @property {Object} env - an instance of the env module containing all env vars
 * @property {Object} appConstants - an object containing all constants not configured as env vars
 * @property {Object} errors - an object containing categorized error message strings for loggind & error handling
 */
class CloudPlatform {
    constructor() {
        this.tls = require('tls')
        this.log = require('../../utilities/logger')('CloudPlatform')
        this.env = require('../../constants/env')
        this.constants = require('../../constants/app-constants')
        this.msgs = require('../../constants/messages')
        this.log.trace('CloudPlatform Instantiated')
    }

    setLogger(className) {
        this.log = require('../../utilities/logger')(className)
        this.log.trace(`${className} connection instantiated`)
    }

    // checks if cloud platform config is 
    // supported or not
    async isConfigured() {
        // grab the 
        const platformSet = this.env.cloud.platform
        // check if the configured 
        // platform is valid
        const platformSupported = 
            this.constants.cloud.supportedPlatforms
                .includes(platformSet)
        if(!platformSet) { 
            this.log.error(
                this.msgs.errors.INVALID_CLOUD_PLATFORM(
                    this.env.cloud.platform)) 
        }
        if(!platformSupported) {
            this.log.error(
                this.msgs.errors.UNSUPPORTED_CLOUD_PLATFORM(
                    this.env.cloud.platform)) 
        }
        // true && true == ok to use cloud platform
        return (platformSet && platformSupported)
    }

    async getPlatform() {
        try {
            switch (this.env.cloud.platform) {
                case 'ibmcloud':
                    const { IBMCloud } = require('./supported-platforms')
                    return await new IBMCloud()
                default:
                    throw this.msgs.errors.UNSUPPORTED_CLOUD_PLATFORM
            }
        }catch(error) {
            this.log.error(error)
            return undefined
        }
    }

    /**
     * 
     * @param {tuple} credentials - A tuple containing
     * two destructurable objects:
     * `{ connectionURL, tlsConfig }`
     * 
     * `connectionURL`: string
     * `tlsConfig`: object
     * 
     * @see IBMCloud
     */
    async connectSSL(credentials, eventEmitter) {
        try {
            const sslConnection = await new SSLConnection()
            return await sslConnection.connectClient(credentials, eventEmitter)
        } catch(error) {
            this.log.error(error)
            return undefined
        }
    }
}

module.exports = CloudPlatform