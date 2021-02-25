const CloudPlatform = require('../connections/cloud/cloud-platform')
const log = require('../utilities/logger')

class Setup {
    constructor() {
        this.log = log('Setup')
        this.env = require('../constants/env')
        this.constants = require('../constants/app-constants')
        this.msgs = require('../constants/messages')
        this.cloud = new CloudPlatform()
    }

    // validates that all config
    // is ready
    async canProceed() {
        const connectionAvailable = await this.cloud.isConfigured() // || this.shouldUseSSLConfig() 
        return ((this.env.config.prefix) && connectionAvailable)
    }

    async getClient() {
        try {  
            switch (await this.canProceed()) {
                case true:
                    const platform = await this.cloud.getPlatform()
                    return await platform.getClient()
                default:
                    throw this.msgs.errors.COULD_NOT_SETUP
            }
        }catch (error) {
            this.log.error(this.msgs.errors.COULD_NOT_SETUP)
        }
    }

}

module.exports = Setup