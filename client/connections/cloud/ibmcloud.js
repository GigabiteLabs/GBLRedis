const CloudPlatform = require('./cloud-platform')

class IBMCloud extends CloudPlatform {
    constructor() {
        super()
        this.setLogger('IBMCloud')
    }

    async getClient() {
        try {
            if (!this.env.cloud.ibm.vcap) { 
                throw this.errors.NO_VCAP_ENV
            }
            return await this.connectSSL(this.env.cloud.ibm)
        } catch(error) {
            this.log.error(error)
        }
    }
}

module.exports = IBMCloud