const redis = require('redis')

class SSLConnection {
    constructor() {
        this.tls = require('tls')
        this.log = require('../../utilities/logger')('CloudPlatform')
        this.env = require('../../constants/env')
        this.constants = require('../../constants/app-constants')
        this.msgs = require('../../constants/messages')
        this.log.trace('SSLConnection Instantiated')
    }

    /**
     * Checks if correct configuration exists 
     * to allow a direct Redis connection using 
     * a certificate file & composed URL.
     * 
     * @returns {boolean} - whether or not a direct
     * connection is possible.
     */
    async directConnectionConfigured() {
        this.log.trace('checking direct SSL connection configuration')
        const certPath = this.env.ssl.certificatePath
        const composedURL = this.env.ssl.composedURL
        if(!certPath){
            this.log.error(
                this.msgs.errors.SSL_DIRECT_NO_CERT_PATH)
        }
        if(!composedURL){
            this.log.error(
                this.msgs.errors.SSL_DIRECT_NO_COMPOSED_URL)
        }
        return (certPath && composedURL)
    }

    /**
     * Parses env vars into a format usable 
     * for calling `this.connectClient()` from
     * the required direct connection config.
     * 
     * @returns {Object} { connectionURL: string, tlsConfig: object } 
     */
    async directConnectionCredentials() {
        this.log.trace('getting direct SSL connection credentials')
        try {
            // Ensure valid composed URL in env vars
            if (this.env.ssl.composedURL.startsWith("rediss://")) {
                const connectionURL = this.env.ssl.composedURL
                const certPath = this.env.ssl.certificatePath
                const tlsConfig = await this.env.ssl.tlsConfig(certPath)
                // quick check that value returned
                if(!tlsConfig) { throw this.msgs.errors.SSL_DIRECT_TLS_CONFIG_FAILED}
                return { connectionURL, tlsConfig }
            } else {
                throw this.msgs.errors.SSL_DIRECT_INVALID_URL_REDISS
            }
        } catch(error) {
            throw error
        } 
    }

    async getClient() {
        try {
            const creds = await this.directConnectionCredentials()
            return await this.connectClient(creds)
        } catch(error) {
            this.log.error(error)
        }
    }

    // makes an SSL connection to Redis
    // and returns the client instance
    async connectClient({ connectionURL, tlsConfig }) {
        this.log.trace('attempting SSL connection with redis client')
        const self = this
        try {
             // read any additional client opts
            let clientOpts = await this.env.config.redisClientOpts()
            let connectionConfig = Object.assign(tlsConfig, clientOpts)
            // create redis client
            this.client = 
            await redis
            .createClient(
                connectionURL,
                connectionConfig,
            ).on("connect", function(msg) {
                self.log.info(`${self.msgs.success.CONNECTION_READY}. raw message: ${msg}`)
            }).on("ready", function(err) {
                self.log.info(self.msgs.success.CONNECTION_READY)
            }).on("error", function(err) {
                self.log.error(err)
                throw self.msgs.errors.CONNECTION_ERROR(err)
            }).on("reconnecting", function(err) {
                self.log.warn(self.msgs.errors.RECONNECTING(err))
            })
            return this.client
        } catch(error) {
            throw error
        }
    }
}
    
module.exports = SSLConnection
    
    


    // async setupWithSSLConfig() {
    //     // extract vars
    //     const { REDIS_CERT, REDIS_SSL_CERT, REDIS_URL, REDIS_COMPOSED_URL} = process.env
    //     const cert = REDIS_CERT || REDIS_SSL_CERT
    //     const url = REDIS_URL || REDIS_COMPOSED_URL
    //     // setup a secure client with SSL & return
    //     try {
    //         // Ensure valid composed URL in env vars
    //         if (url.startsWith("rediss://")) {
    //             const tls = require('tls')
    //             var ssl = {
    //                 ca: [ fs.readFileSync(cert, 'ascii') ]
    //             }
    //             // create a client
    //             return await redis.createClient(url, {tls: ssl})

    //             // handle failure
    //             .on("error", function(err) {
    //                 throw `\n\ngigbatielabs-redis: ERROR: Redis client could not be configured, error: ${err}`
    //             })
    //         } else {
    //             throw `\n\n\n\n`
    //             process.exit(1)
    //         }
    //     } catch(error) {
    //         throw error
    //     } 
    // }