const CloudPlatform = require('../connections/cloud/cloud-platform')
const SSLConnection = require('../connections/ssl/ssl-connection')
const DirectAuthConnection = require('../connections/direct-auth/direct-auth')
const log = require('../utilities/logger')

class Setup {
    constructor(eventEmitter) {
        this.log = log('Setup')
        this.env = require('../constants/env')
        this.constants = require('../constants/app-constants')
        this.msgs = require('../constants/messages')
        this.eventEmitter = eventEmitter
    }

    // validates that all config
    // is ready
    async canProceed() {
        this.log.trace('checking if redis db connection is possible')
        let self = this
        try {
            // if a prefix is missing, no
            // connetion will be possible
            if(!self.env.config.prefix) { throw self.msgs.errors.PREFIX_UNDEFINED }
            // process using connection method
            if (!self.env.config.connectionMethod) {
                throw self.msgs.errors.CONNECTION_METHOD_UNDEFINED
            } else {
                switch(self.env.config.connectionMethod) {
                    case 'cloud-platform':
                        this.cloud = new CloudPlatform()
                        return await self.cloud.isConfigured()
                    case 'direct-ssl-tls':
                        this.ssl = new SSLConnection()
                        return await self.ssl.directConnectionConfigured()
                    case 'basic-auth':
                        this.direct = new DirectAuthConnection()
                        return await this.direct.basicAuthConfigured()
                    case 'no-auth':
                        this.direct = new DirectAuthConnection()
                        return await this.direct.noAuthConfigured()
                    default:
                        throw this.msgs.errors.CONNECTION_METHOD_INVALID
                }
            }
        } catch(error) {
            self.log.error(error)
        }
    }

    async getClient() {
        this.log.trace('checking if redis db connection is possible')
        try {  
            if (await this.canProceed()) {
                switch(this.env.config.connectionMethod) {
                    case 'cloud-platform':
                        const platform = await this.cloud.getPlatform()
                        const cpClient = await platform.getClient(this.eventEmitter)
                        return cpClient
                    case 'direct-ssl-tls':
                        const sslClient = await this.ssl.getClient(this.eventEmitter)
                        return sslClient
                    case 'basic-auth':
                        const basicClient = await this.direct.getClient(this.eventEmitter)
                        return basicClient
                    case 'no-auth':
                        const noAuthClient = await this.direct.getClient(this.eventEmitter)
                        return noAuthClient
                    default:
                        throw this.msgs.errors.CONNECTION_METHOD_INVALID
                }
            } else {
                throw this.msgs.errors.COULD_NOT_SETUP
            }
        } catch (error) {
            this.log.error(error)
        }
    }

}

module.exports = Setup