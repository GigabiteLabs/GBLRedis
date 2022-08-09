const redis = require('redis')

class DirectAuthConnection {
    constructor() {
        this.log = require('../../utilities/logger')('CloudPlatform')
        this.env = require('../../constants/env')
        this.constants = require('../../constants/app-constants')
        this.msgs = require('../../constants/messages')
        this.log.trace('DirectAuthConnection Instantiated')
    }

    /**
     * Checks if correct configuration exists 
     * to allow a direct Redis connection using 
     * a certificate file & composed URL.
     * 
     * @returns {boolean} - whether or not a direct
     * connection is possible.
     */
    async basicAuthConfigured() {
        this.log.trace('checking direct SSL connection configuration')
        // basic requires url, use no-auth check
        const instanceURLConfigured = await this.noAuthConfigured()
        const basicPass = this.env.basic.pass
        const basicUser = this.env.basic.user
        if(!basicPass){
            this.log.error(
                this.msgs.errors.BASIC_AUTH_NO_PASS)
        }
        if(!basicUser){
            this.log.info(
                this.msgs.info.BASIC_AUTH_NO_USER)
        }
        return (instanceURLConfigured && basicPass)
    }


    /**
     * Checks if correct configuration exists 
     * to allow a direct Redis connection using 
     * a certificate file & composed URL.
     * 
     * @returns {boolean} - whether or not a direct
     * connection is possible.
     */
    async noAuthConfigured() {
        this.log.trace('checking no-auth configuration')
        const instanceURL = this.env.noauth.connectionURL
        if(!instanceURL){
            this.log.error(
                this.msgs.errors.NO_AUTH_NO_URL)
        }
        return (instanceURL)
    }

    /**
     * Parses env vars into a format usable 
     * for calling `this.connectClient()` from
     * the required direct connection config.
     * 
     * @returns {Object} { connectionURL: string, tlsConfig: object } 
     */
    async directConnectionCredentials() {
        this.log.trace('getting direct connection credentials')
        try {
            let connectionURL
            switch(this.env.config.connectionMethod) {
                case 'basic-auth':
                    connectionURL = this.env.basic.connectionURL
                    const basicAuth = this.env.basic.pass
                    if(this.env.basic.user) {
                        // split up the URL by the slashes
                        let connectionSegments = connectionURL.split('//')
                        // insert the username before the host
                        // and after the redis protocol, ssh style.
                        connectionURL = `${connectionSegments[0]}//${this.env.basic.user}@${connectionSegments[1]}`
                    }
                    let authConfig = { password: basicAuth }
                    return { connectionURL, authConfig }
                case 'no-auth':
                    connectionURL = this.env.noauth.connectionURL
                    return { connectionURL }
                default:
                    throw this.msgs.errors.CONNECTION_METHOD_INVALID
            }
        } catch(error) {
            throw error
        } 
    }

    async getClient(eventEmitter) {
        try {
            const creds = await this.directConnectionCredentials()
            return await this.connectClient(creds, eventEmitter)
        } catch(error) {
            this.log.error(error)
        }
    }

    // attempts a connection to the
    // Redis instance using either basic auth
    // or no auth
    async connectClient({ connectionURL, authConfig }, eventEmitter) {
        this.log.trace('attempting direct connection to redis')
        const self = this
        try {
             // read any additional client opts
            let clientOpts = await this.env.config.redisClientOpts()
            let connectionConfig
            if (authConfig) {
                connectionConfig = Object.assign(authConfig, clientOpts)
            }
            // create redis client
            this.client = 
            await redis
            .createClient(
                connectionURL,
                connectionConfig,
            ).on("connect", function(msg) {
                self.log.info(self.msgs.success.CONNECTING)
            }).on("ready", function(msg) {
                self.log.info(self.msgs.success.CONNECTION_READY)
                eventEmitter.emit('client ready')
            }).on("error", function(err) {
                self.log.error(err)
                throw self.msgs.errors.CONNECTION_ERROR(err)
            }).on("reconnecting", function(err) {
                self.log.warn(self.msgs.warning.RECONNECTING(err))
            })
            return this.client
        } catch(error) {
            throw error
        }
    }
}

module.exports = DirectAuthConnection