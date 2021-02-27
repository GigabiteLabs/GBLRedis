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
            return await this.connectSSL(await this.connectionCredentials())
        } catch(error) {
            this.log.error(error)
        }
    }

    async connectionCredentials() {
        const raw = this.env.cloud.ibm.vcapRaw
        const vcap = this.env.cloud.ibm.vcap(raw)
        const vcapRedis = this.env.cloud.ibm.vcapRedis(vcap)
        const { composedUrl, certificate } = this.env.cloud.ibm.redisAuth(vcapRedis)
        const ca = this.env.cloud.ibm.ca(certificate)
        const sslConfig = this.env.cloud.ibm.sslConfig(ca)
        let tlsConfig = this.env.cloud.ibm.tlsConfig(sslConfig)

        // form final crednetials
        const connectionURL = composedUrl
        tlsConfig.prefix = this.env.config.prefix
        // return
        return { connectionURL, tlsConfig } 
    }
}

module.exports = IBMCloud