const redis = require('redis')

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

        // setup env vars
        this.log.debug(this.env.cloud.ibm.vcapRaw)
        const raw = this.env.cloud.ibm.vcapRaw
        const vcap = this.env.cloud.ibm.vcap(raw)
        const vcapRedis = this.env.cloud.ibm.vcapRedis(vcap)
        const { composedUrl, certificate } = this.env.cloud.ibm.redisAuth(vcapRedis)
        const ca = this.env.cloud.ibm.ca(certificate)
        const sslConfig = this.env.cloud.ibm.sslConfig(ca)
        const tlsConfig = this.env.cloud.ibm.tlsConfig(sslConfig)

        this.connectionURL = composedUrl
        this.tlsConfig = tlsConfig

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
        // true & true means use cloud platform
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

    // makes an SSL connection to Redis
    // and returns the client instance
    async connectSSL(cloud) {
        const self = this
        try {
            // create redis client
            self.client = 
            await redis
            .createClient(
                self.connectionURL, 
                self.tlsConfig
            ).on("connect", function(err) {
                self.log.info(self.msgs.success.CONNECTION_READY)
            }).on("ready", function(err) {
                self.log.info(self.msgs.success.CONNECTION_READY)
            }).on("error", function(err) {
                self.log.error(err)
                throw self.msgs.errors.CONNECTION_ERROR(err)
            }).on("reconnecting", function(err) {
                self.log.warn(self.msgs.errors.RECONNECTING(err))
            })
            return self.client
        } catch(error) {
            throw error
        }
    }
}

module.exports = CloudPlatform